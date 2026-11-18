import {
  courseById,
  courses,
  creditsOf,
  earnedCredits,
  enrolledIds,
  graduationCredits,
  knownCompletedIds,
  requirements,
  type Course,
} from "./demo.ts"

export const scenarioTerms = [
  { id: "spring-2027", label: "2027년 1학기" },
  { id: "fall-2027", label: "2027년 2학기" },
  { id: "spring-2028", label: "2028년 1학기" },
] as const

export type Scenario = Record<string, Course[]>
export const termLabel = (id: string) =>
  scenarioTerms.find((term) => term.id === id)?.label ?? id

export function baselineScenario(plan: Course[]): Scenario {
  const future = (ids: string[]) =>
    ids.flatMap((id) => {
      const course = courseById(id)
      return course && !plan.some((item) => item.id === id) ? [course] : []
    })
  return {
    [scenarioTerms[0].id]: [...plan],
    [scenarioTerms[1].id]: future(["SWE4001", "SWE4006"]),
    [scenarioTerms[2].id]: future(["SWE4002"]),
  }
}

export function moveCourse(
  scenario: Scenario,
  course: Course,
  target: string
): Scenario {
  if (!scenarioTerms.some(({ id }) => id === target)) return scenario
  return Object.fromEntries(
    scenarioTerms.map(({ id }) => [
      id,
      id === target
        ? [...scenario[id].filter((item) => item.id !== course.id), course]
        : scenario[id].filter((item) => item.id !== course.id),
    ])
  )
}

export function evaluateScenario(
  scenario: Scenario,
  assumedCompletions: readonly string[] = enrolledIds
) {
  const completed = new Set([...knownCompletedIds, ...assumedCompletions])
  const warnings = new Map<string, Course[]>()
  const timeConflicts = new Map<string, Course[]>()
  const openingTerm = scenario[scenarioTerms[0].id] ?? []
  for (const course of openingTerm) {
    if (!course.time) continue
    const overlapping = openingTerm.filter(
      (item) =>
        item.id !== course.id &&
        item.time?.[0] === course.time?.[0] &&
        item.time?.[1] === course.time?.[1]
    )
    if (overlapping.length > 0) timeConflicts.set(course.id, overlapping)
  }
  const ready: Course[] = []
  for (const { id } of scenarioTerms) {
    const passed: Course[] = []
    for (const course of scenario[id] ?? []) {
      const missing = (course.requires ?? [])
        .filter((key) => !completed.has(key))
        .flatMap((key) => courseById(key) ?? [])
      if (missing.length > 0) warnings.set(course.id, missing)
      else if (!completed.has(course.id) && !timeConflicts.has(course.id))
        passed.push(course)
    }
    for (const course of passed) {
      if (!completed.has(course.id)) {
        completed.add(course.id)
        ready.push(course)
      }
    }
  }
  return { warnings, timeConflicts, ready }
}

export function projectedRequirements(eligible: readonly Course[]) {
  return requirements.map((item) => ({
    ...item,
    projected:
      item.earned +
      creditsOf(eligible.filter((course) => course.category === item.label)),
  }))
}

export function summarizeProjection(
  scenario: Scenario,
  result = evaluateScenario(scenario)
) {
  const scheduled = scenario[scenarioTerms[0].id] ?? []
  const eligible = result.ready.filter((course) =>
    scheduled.some(({ id }) => id === course.id)
  )
  const excluded = scheduled.flatMap((course) => {
    const prerequisites = result.warnings.get(course.id) ?? []
    const conflicts = result.timeConflicts.get(course.id) ?? []
    return prerequisites.length || conflicts.length
      ? [{ course, prerequisites, conflicts }]
      : []
  })
  return {
    earned: earnedCredits,
    includesAllPlanned: earnedCredits + creditsOf(scheduled),
    projected: earnedCredits + creditsOf(eligible),
    eligible,
    excluded,
  }
}

export function graduationChecks(eligible: readonly Course[] = []) {
  const rows = projectedRequirements(eligible)
  const certification = {
    label: "3품인증",
    status: "unknown" as const,
    reason: "인증 확인 자료가 시연 기록에 포함되어 있지 않습니다.",
  }
  const creditRequirements = rows.map(({ earned, goal }) =>
    earned >= goal ? "met" : "not-met"
  )
  const readiness = combineRequirementStatuses([
    ...creditRequirements,
    earnedCredits >= graduationCredits ? "met" : "not-met",
    certification.status,
  ])
  return { rows, certification, readiness }
}

export function combineRequirementStatuses(
  statuses: readonly ("met" | "not-met" | "unknown")[]
) {
  if (statuses.includes("not-met")) return "not-met"
  return !statuses.length || statuses.includes("unknown") ? "unknown" : "met"
}

export function analyzeWithdrawal(baseline: Scenario, target?: Course) {
  const before = evaluateScenario(baseline)
  const after = evaluateScenario(
    Object.fromEntries(
      Object.entries(baseline).map(([term, list]) => [
        term,
        list.filter(({ id }) => id !== target?.id),
      ])
    ),
    enrolledIds.filter((id) => id !== target?.id)
  )
  const affected = target ? dependentCourses(target) : []
  const readyBefore = new Set(before.ready.map(({ id }) => id))
  const newlyBlocked = affected.filter(
    ({ course }) => readyBefore.has(course.id) && after.warnings.has(course.id)
  )
  return { before, after, affected, newlyBlocked }
}

export function dependentCourses(course: Course) {
  const queue = [{ course, depth: 0 }]
  const seen = new Set([course.id])
  const result: typeof queue = []
  for (const current of queue) {
    for (const dependent of courses.filter(
      (item) => !item.completed && item.requires?.includes(current.course.id)
    )) {
      if (seen.has(dependent.id)) continue
      seen.add(dependent.id)
      const next = { course: dependent, depth: current.depth + 1 }
      result.push(next)
      queue.push(next)
    }
  }
  return result
}
