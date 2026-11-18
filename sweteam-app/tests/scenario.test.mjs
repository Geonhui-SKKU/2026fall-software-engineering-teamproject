import assert from "node:assert/strict"
import { test } from "node:test"

import {
  academicRecords,
  courseById,
  creditsOf,
  defaultPlanIds,
  enrolledIds,
  knownCompletedIds,
} from "../src/lib/demo.ts"
import {
  analyzeWithdrawal,
  baselineScenario,
  combineRequirementStatuses,
  dependentCourses,
  evaluateScenario,
  graduationChecks,
  moveCourse,
  scenarioTerms,
  summarizeProjection,
} from "../src/lib/scenario.ts"

const [first, second] = scenarioTerms.map(({ id }) => id)
const plan = defaultPlanIds.map(courseById)

test("moving a prerequisite delays direct and later dependents without changing the plan", () => {
  const baseline = baselineScenario(plan)
  const moved = moveCourse(baseline, courseById("SWE3020"), second)
  const current = evaluateScenario(baseline)
  const simulated = evaluateScenario(moved)
  assert.equal(current.warnings.size, 0)
  assert.deepEqual([...simulated.warnings.keys()], ["SWE4001", "SWE4002"])
  assert.equal(creditsOf(current.ready) - creditsOf(simulated.ready), 6)
  assert.equal(baseline[first].length, 3)
  assert.equal(plan.length, 3)
})

test("a conflicting candidate is viable in a later semester, not in the initial timetable", () => {
  const candidate = courseById("SWE3030")
  const baseline = baselineScenario(plan)
  const conflict = evaluateScenario(moveCourse(baseline, candidate, first))
  assert.deepEqual([...conflict.timeConflicts.keys()], ["SWE3011", "SWE3030"])
  assert.ok(!conflict.ready.some(({ id }) => id === candidate.id))
  const deferred = evaluateScenario(moveCourse(baseline, candidate, second))
  assert.equal(deferred.timeConflicts.size, 0)
  assert.ok(deferred.ready.includes(candidate))
})

test("withdrawal analysis finds transitive dependencies", () => {
  assert.deepEqual(
    dependentCourses(courseById("SWE3020")).map(({ course, depth }) => [
      course.id,
      depth,
    ]),
    [
      ["SWE4001", 1],
      ["SWE4002", 2],
    ]
  )
})

test("Graduation and What-if use the same 87/99/96 result when Machine Learning is blocked", () => {
  const withMachineLearning = [...plan, courseById("SWE3031")]
  const board = baselineScenario(withMachineLearning)
  const graduation = summarizeProjection(board)
  const whatIf = summarizeProjection(board, evaluateScenario(board))
  assert.deepEqual(graduation, whatIf)
  assert.equal(graduation.earned, 87)
  assert.equal(graduation.includesAllPlanned, 99)
  assert.equal(graduation.projected, 96)
  assert.deepEqual(
    graduation.excluded.map(({ course, prerequisites }) => [
      course.id,
      prerequisites.map(({ id }) => id),
    ]),
    [["SWE3031", ["SWE3024"]]]
  )
  assert.equal(
    graduationChecks(graduation.eligible).rows.find(
      ({ label }) => label === "전공선택"
    ).projected,
    30
  )
})

test("an unmatched or enrolled record is not a completed record", () => {
  const unmatched = academicRecords.find(({ status }) => status === "unmatched")
  assert.ok(unmatched)
  assert.ok(!knownCompletedIds.includes(unmatched.id))
  assert.ok(enrolledIds.every((id) => !knownCompletedIds.includes(id)))
  assert.equal(summarizeProjection(baselineScenario([])).projected, 87)
})

test("an unknown required certification cannot be reported as met", () => {
  assert.equal(graduationChecks().certification.status, "unknown")
  assert.equal(combineRequirementStatuses(["met", "unknown"]), "unknown")
  assert.equal(
    combineRequirementStatuses(["met", "unknown", "not-met"]),
    "not-met"
  )
})

test("removing an enrolled prerequisite affects both capstones and preserves the baseline", () => {
  const baseline = baselineScenario(plan)
  const target = courseById(enrolledIds[0])
  const original = JSON.stringify(baseline)
  const { before, after, newlyBlocked } = analyzeWithdrawal(baseline, target)
  assert.deepEqual(
    newlyBlocked.map(({ course }) => course.id),
    ["SWE4001", "SWE4002"]
  )
  assert.equal(creditsOf(before.ready) - creditsOf(after.ready), 6)
  assert.equal(JSON.stringify(baseline), original)
  assert.equal(
    academicRecords.find(({ id }) => id === target.id).status,
    "enrolled"
  )
})
