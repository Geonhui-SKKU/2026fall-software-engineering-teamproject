import { useState } from "react"
import { ArrowRight, GripVertical } from "lucide-react"

import {
  DemoNote,
  EvaluationNote,
  Meter,
  PageHeading,
  Panel,
  ProjectionBreakdown,
  TextLink,
} from "@/components/demo-ui"
import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnContent,
  KanbanItem,
  KanbanItemHandle,
  KanbanOverlay,
} from "@/components/reui/kanban"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  courseById,
  creditsOf,
  earnedCredits,
  enrolledIds,
  graduationCredits,
  terms,
  type Course,
} from "@/lib/demo"
import {
  analyzeWithdrawal,
  baselineScenario,
  dependentCourses,
  evaluateScenario,
  moveCourse,
  projectedRequirements,
  scenarioTerms,
  summarizeProjection,
  termLabel,
} from "@/lib/scenario"

const selectClass = "w-full rounded-lg border bg-card px-2.5 py-1.5 text-sm"

export function WhatIf({
  plan,
  courseId,
}: {
  plan: Course[]
  courseId: string
}) {
  const baseline = baselineScenario(plan)
  const candidate = courseById(courseId)
  const deferred =
    candidate?.time &&
    !candidate.completed &&
    !plan.some(({ id }) => id === candidate.id)
      ? candidate
      : undefined
  const initialScenario = () =>
    deferred ? moveCourse(baseline, deferred, scenarioTerms[1].id) : baseline
  const [scenario, setScenario] = useState(initialScenario)
  const current = evaluateScenario(baseline)
  const simulated = evaluateScenario(scenario)
  const impactExample = plan.find(
    (course) => dependentCourses(course).length > 0
  )
  const currentRequirements = projectedRequirements(current.ready)
  const changedRequirements = projectedRequirements(simulated.ready).flatMap(
    (row, index) => {
      const before = currentRequirements[index].projected
      return before === row.projected ? [] : [{ ...row, before }]
    }
  )

  return (
    <>
      <PageHeading
        title="What-if 시뮬레이션"
        description="과목 카드를 다른 학기로 옮겨 선수 과목과 예상 이수 학점이 어떻게 달라지는지 확인하세요."
        action={
          <Button
            variant="outline"
            onClick={() => setScenario(initialScenario())}
          >
            시나리오 초기화
          </Button>
        }
      />
      <div className="space-y-4">
        {deferred && (
          <DemoNote>
            {deferred.name} 과목은 충돌을 피하기 위해 시뮬레이션의 2027년
            2학기에만 추가했어요.
          </DemoNote>
        )}
        <Panel
          title="학기별 수강 시나리오"
          action={<Badge variant="secondary">저장된 계획에 반영 안 됨</Badge>}
        >
          <Kanban
            value={scenario}
            onValueChange={setScenario}
            getItemValue={(course) => course.id}
            restoreOnCancel
          >
            <KanbanBoard className="grid items-start gap-3 sm:grid-cols-3">
              {scenarioTerms.map(({ id, label }) => (
                <KanbanColumn
                  key={id}
                  value={id}
                  className="min-w-0 rounded-xl border bg-muted/40 p-2.5"
                >
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-1 px-1">
                    <h3 className="text-sm font-semibold">{label}</h3>
                    <Badge variant="outline">
                      {creditsOf(scenario[id])}학점
                    </Badge>
                  </div>
                  <KanbanColumnContent
                    value={id}
                    className="flex min-h-20 flex-col gap-2"
                  >
                    {scenario[id].length === 0 && (
                      <p className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
                        계획 과목 없음
                      </p>
                    )}
                    {scenario[id].map((course) => {
                      const warning = simulated.warnings.get(course.id)
                      const overlaps = simulated.timeConflicts.get(course.id)
                      return (
                        <KanbanItem
                          key={course.id}
                          value={course.id}
                          className="rounded-lg border bg-card p-2.5"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div>
                              <p className="text-sm font-semibold">
                                {course.name}
                              </p>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {course.category} · 3학점
                              </p>
                            </div>
                            <KanbanItemHandle
                              render={
                                <button
                                  type="button"
                                  aria-label={`${course.name} 카드 끌어서 이동`}
                                  className="rounded p-1 text-muted-foreground hover:bg-muted"
                                />
                              }
                            >
                              <GripVertical className="size-4" />
                            </KanbanItemHandle>
                          </div>
                          {warning && (
                            <p className="mt-2 rounded-md bg-amber-50 p-1.5 text-xs text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                              선수 미충족:{" "}
                              {warning.map((item) => item.name).join(", ")}
                            </p>
                          )}
                          {overlaps && (
                            <p className="mt-2 rounded-md bg-amber-50 p-1.5 text-xs text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                              시간표 충돌:{" "}
                              {overlaps.map((item) => item.name).join(", ")}
                            </p>
                          )}
                          <select
                            aria-label={`${course.name} 수강 학기`}
                            className={`${selectClass} mt-2 text-xs`}
                            value={id}
                            onChange={(event) =>
                              setScenario((previous) =>
                                moveCourse(previous, course, event.target.value)
                              )
                            }
                          >
                            {scenarioTerms.map((term) => (
                              <option key={term.id} value={term.id}>
                                {term.label}
                              </option>
                            ))}
                          </select>
                        </KanbanItem>
                      )
                    })}
                  </KanbanColumnContent>
                </KanbanColumn>
              ))}
            </KanbanBoard>
            <KanbanOverlay>
              {({ value }) => (
                <div className="rounded-lg border bg-card p-2.5 text-sm font-semibold shadow-md">
                  {courseById(String(value))?.name}
                </div>
              )}
            </KanbanOverlay>
          </Kanban>
        </Panel>
        <div className="grid gap-4 md:grid-cols-2">
          {(
            [
              ["현재 계획 + 예시 후속 과목", current, baseline],
              ["시뮬레이션", simulated, scenario],
            ] as const
          ).map(([label, result, board]) => (
            <Panel
              key={label}
              title={label}
              action={
                <Badge variant="secondary">
                  선수 미충족 {result.warnings.size}과목
                  {result.timeConflicts.size > 0
                    ? ` · 시간 충돌 ${result.timeConflicts.size}과목`
                    : ""}
                </Badge>
              }
            >
              <div className="space-y-3">
                <ProjectionBreakdown
                  summary={summarizeProjection(board, result)}
                />
                <Meter
                  label="전체 기간 예상 누적 학점"
                  value={earnedCredits + creditsOf(result.ready)}
                  goal={graduationCredits}
                />
              </div>
            </Panel>
          ))}
        </div>
        <Panel title="졸업 요건별 변화 · 시연 기간 전체">
          {changedRequirements.length ? (
            <ul className="divide-y text-sm">
              {changedRequirements.map(({ label, before, goal, projected }) => (
                <li
                  key={label}
                  className="flex flex-wrap justify-between gap-2 py-2"
                >
                  <span>
                    {label} · 시연 기준 {goal}학점
                  </span>
                  <span className="font-medium">
                    {before} → {projected}학점 ·{" "}
                    {projected >= goal
                      ? "예상 충족"
                      : `${goal - projected}학점 부족`}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              영역별 예상 학점 변화가 없어요.
            </p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            3품인증: 확인 필요 (Unknown) · 졸업 판정 불가
          </p>
        </Panel>
        <DemoNote>
          선수 과목은 이전 학기에 이수해야 해요. 선수 미충족 과목과 첫 학기
          시간표 충돌 과목은 예상 학점에서 제외돼요. 후속 학기에는 예시 과목이
          포함돼요.
        </DemoNote>
        <EvaluationNote />
        <TextLink
          to={impactExample ? `impact?course=${impactExample.id}` : "impact"}
        >
          저장된 수강 계획의 취소 영향 분석
        </TextLink>
      </div>
    </>
  )
}

export function WithdrawalImpact({
  plan,
  courseId,
}: {
  plan: Course[]
  courseId: string
}) {
  const [selected, setSelected] = useState(courseId)
  const baseline = baselineScenario(plan)
  const enrolled = enrolledIds.flatMap((id) => courseById(id) ?? [])
  const future = Object.values(baseline).flat()
  const choices = [...enrolled, ...future]
  const target =
    choices.find(({ id }) => id === selected) ?? enrolled[0] ?? choices[0]
  const isEnrolled = enrolled.some(({ id }) => id === target?.id)
  const targetTerm = Object.entries(baseline).find(([, list]) =>
    list.some(({ id }) => id === target?.id)
  )?.[0]
  const semesterLoad = isEnrolled
    ? creditsOf(enrolled)
    : targetTerm
      ? creditsOf(baseline[targetTerm])
      : 0
  const { before, after, affected, newlyBlocked } = analyzeWithdrawal(
    baseline,
    target
  )
  const afterRequirements = projectedRequirements(after.ready)
  const affectedRequirements = projectedRequirements(before.ready).flatMap(
    (row, index) =>
      row.projected === afterRequirements[index].projected
        ? []
        : [{ ...row, after: afterRequirements[index].projected }]
  )

  return (
    <>
      <PageHeading
        title="수강취소 영향 분석"
        description="현재 수강 중인 과목의 취소 또는 예정 과목의 제외가 후속 과목과 졸업 학점에 미치는 영향을 확인하세요."
        action={<TextLink to="planner">학기 플래너 돌아가기</TextLink>}
      />
      <div className="mb-4">
        <DemoNote>
          시뮬레이션으로만 계산하며, 저장된 수강 계획과 학적은 변경하지 않아요.
          실제 취소 요청은 제출되지 않으며, 후속 학기 예시 과목도 분석에
          포함됩니다.
        </DemoNote>
      </div>
      <div className="grid items-start gap-4 lg:grid-cols-[250px_minmax(0,1fr)_300px]">
        <Panel title="취소할 과목 선택">
          <select
            className={selectClass}
            aria-label="취소 영향 분석 과목"
            value={target?.id ?? ""}
            onChange={(event) => setSelected(event.target.value)}
          >
            <optgroup label="현재 수강 중 · 모의 학적">
              {enrolled.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="예정 과목 · 시연 계획">
              {future.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </optgroup>
          </select>
          {target && (
            <p className="mt-3 text-xs text-muted-foreground">
              {target.id} · {target.category} · 3학점
            </p>
          )}
        </Panel>
        <Panel
          title="후속 과목 영향"
          action={
            <Badge variant="secondary">
              새로 지연 위험 {newlyBlocked.length}과목
            </Badge>
          }
        >
          {affected.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              이 과목을 선수로 요구하는 미이수 과목이 없어요.
            </p>
          ) : (
            <ul className="grid gap-2">
              {affected.map(({ course, depth }) => {
                const term = Object.entries(baseline).find(([, list]) =>
                  list.some(({ id }) => id === course.id)
                )?.[0]
                const blocked = newlyBlocked.some(
                  ({ course: item }) => item.id === course.id
                )
                return (
                  <li
                    key={course.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-semibold">{course.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {depth === 1 ? "직접 선수 관계" : `${depth}단계 후속`} ·{" "}
                        {term ? termLabel(term) : `권장 ${terms[course.term]}`}
                      </p>
                    </div>
                    <Badge variant={blocked ? "destructive" : "outline"}>
                      {blocked
                        ? "지연 위험"
                        : term
                          ? "이미 선수 미충족"
                          : "계획 외 연계 과목"}
                    </Badge>
                  </li>
                )
              })}
            </ul>
          )}
        </Panel>
        <Panel title="예상 이수 학점 변화">
          <div className="space-y-3">
            <div className="rounded-lg border p-2.5 text-sm">
              <p className="font-semibold">
                학기 수강 학점 ·{" "}
                {isEnrolled
                  ? "2026년 2학기"
                  : targetTerm
                    ? termLabel(targetTerm)
                    : "확인 필요"}
              </p>
              <p>
                {semesterLoad} → {Math.max(0, semesterLoad - (target ? 3 : 0))}
                학점
              </p>
              <p className="text-xs text-muted-foreground">
                적용 최소 학점은 확인되지 않았습니다.
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              이수 가능으로 예상된 후속 학기 학점 포함 · 현재 수강 중인 학점은
              미포함
            </p>
            <p className="flex items-center gap-2 text-xl font-bold tabular-nums">
              {earnedCredits + creditsOf(before.ready)}{" "}
              <ArrowRight className="size-4 text-muted-foreground" />{" "}
              {earnedCredits + creditsOf(after.ready)}학점
            </p>
            {affectedRequirements.length > 0 ? (
              <ul className="divide-y text-sm">
                {affectedRequirements.map(
                  ({ label, goal, projected, after: next }) => (
                    <li className="flex justify-between gap-2 py-2" key={label}>
                      <span>
                        {label}
                        {projected >= goal && next < goal && (
                          <span className="block text-xs text-destructive">
                            취소 시 기준 미충족 예상
                          </span>
                        )}
                      </span>
                      <span>
                        {projected} → {next}학점
                      </span>
                    </li>
                  )
                )}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                예상 학점 변화가 없어요.
              </p>
            )}
            <TextLink to="graduation">졸업 요건 확인</TextLink>
          </div>
        </Panel>
      </div>
      <div className="mt-4">
        <EvaluationNote />
      </div>
    </>
  )
}
