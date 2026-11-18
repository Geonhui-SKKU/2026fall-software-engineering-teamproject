import { lazy, Suspense, useState, type ReactNode } from "react"
import { ArrowRight, Check, CircleAlert, Plus, Search, X } from "lucide-react"

import {
  DemoNote,
  Meter,
  PageHeading,
  Panel,
  TextLink,
} from "@/components/demo-ui"
import type { PlannerConflict } from "@/components/planner-calendar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  categories,
  cohort,
  courseById,
  courses,
  courseTime,
  creditsOf,
  enrolledIds,
  terms,
  type Course,
} from "@/lib/demo"
import { cn } from "@/lib/utils"

const PlannerCalendar = lazy(() => import("@/components/planner-calendar"))

type CourseActions = {
  plan: Course[]
  onToggle: (course: Course) => void
  onView: (course: Course) => void
}

function matches(course: Course, query: string) {
  return `${course.name} ${course.id}`
    .toLowerCase()
    .includes(query.trim().toLowerCase())
}

export function Roadmap({
  plan,
  onView,
}: Pick<CourseActions, "plan" | "onView">) {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("전체")
  const [selected, setSelected] = useState<Course | null>(null)
  const prerequisites =
    selected?.requires?.flatMap((id) => courseById(id) ?? []) ?? []
  const followups = selected
    ? courses.filter((course) => course.requires?.includes(selected.id))
    : []
  const pathIds = new Set(
    [...prerequisites, ...followups, ...(selected ? [selected] : [])].map(
      ({ id }) => id
    )
  )
  function selectCourse(course: Course) {
    setSelected(course)
    onView(course)
  }
  const visible = courses.filter(
    (course) =>
      matches(course, query) &&
      (filter === "전체" ||
        course.category === filter ||
        (filter === "미이수" && !course.completed))
  )

  return (
    <>
      <PageHeading
        title="과목 로드맵"
        description="학기별 전공·교양 과목과 선수 과목을 확인하고 수강 계획을 세워 보세요."
        action={<TextLink to="planner">학기 플래너 열기</TextLink>}
      />
      <Panel
        title="소프트웨어학과 교육과정"
        action={<Badge variant="secondary">{cohort} 기준</Badge>}
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5" aria-label="과목 분류">
            {["전체", ...categories, "미이수"].map((label) => (
              <Button
                size="sm"
                key={label}
                variant={filter === label ? "default" : "outline"}
                aria-pressed={filter === label}
                onClick={() => setFilter(label)}
              >
                {label}
              </Button>
            ))}
          </div>
          <div className="relative w-full sm:w-56">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-8"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="과목명 · 학수번호 검색"
              aria-label="로드맵 과목 검색"
            />
          </div>
        </div>
        {selected && (
          <section
            aria-label="선수 과목 경로"
            className="mb-4 rounded-lg border bg-accent/50 p-3"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">선수 과목 경로</h3>
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label="선수 과목 경로 지우기"
                onClick={() => setSelected(null)}
              >
                <X />
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {(
                [
                  ["직접 선수", prerequisites],
                  ["선택 과목", [selected]],
                  ["직접 후속", followups],
                ] as const
              ).map(([label, list], index) => (
                <div key={label} className="flex items-center gap-2">
                  {index > 0 && (
                    <ArrowRight
                      className="size-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                  )}
                  <div className="rounded-md border bg-card px-2.5 py-1.5">
                    <p className="font-semibold">{label}</p>
                    <p className="text-muted-foreground">
                      {list.map((item) => item.name).join(", ") || "없음"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        {visible.length === 0 ? (
          <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            조건에 맞는 과목이 없어요.
          </p>
        ) : (
          <div className="overflow-x-auto pb-2">
            <div className="grid min-w-[880px] grid-cols-8 gap-2">
              {terms.map((term, index) => (
                <section
                  key={term}
                  className="space-y-2 rounded-lg border bg-muted/25 p-1.5"
                >
                  <h3
                    className={cn(
                      "rounded-md px-1 py-2 text-center text-xs font-semibold",
                      index === 4 ? "bg-accent text-primary" : "bg-muted"
                    )}
                  >
                    {term}
                  </h3>
                  {visible
                    .filter((course) => course.term === index)
                    .map((course) => {
                      const planned = plan.some(({ id }) => id === course.id)
                      return (
                        <button
                          key={course.id}
                          onClick={() => selectCourse(course)}
                          className={cn(
                            "block w-full rounded-md border p-2 text-left transition-colors hover:border-primary",
                            pathIds.has(course.id)
                              ? "border-primary bg-accent ring-1 ring-primary/40"
                              : planned
                                ? "border-primary/35 bg-accent"
                                : "bg-card"
                          )}
                        >
                          <span className="block text-[10px] text-muted-foreground">
                            {course.id} · 3학점
                          </span>
                          <span className="my-1 block text-xs leading-snug font-semibold">
                            {course.name}
                          </span>
                          <span
                            className={cn(
                              "flex items-center gap-0.5 text-[10px]",
                              course.completed
                                ? "text-emerald-700 dark:text-emerald-300"
                                : "text-muted-foreground"
                            )}
                          >
                            {course.completed ? (
                              <>
                                <Check className="size-3" /> 이수 완료
                              </>
                            ) : planned ? (
                              "계획에 추가됨"
                            ) : enrolledIds.includes(course.id) ? (
                              "현재 수강 중"
                            ) : course.time ? (
                              "계획 가능"
                            ) : (
                              "미이수"
                            )}
                          </span>
                        </button>
                      )
                    })}
                </section>
              ))}
            </div>
          </div>
        )}
        <div className="mt-4">
          <DemoNote>
            권장 학기와 선수 관계는 2024학번 소프트웨어학과 시연용 데이터입니다.
            C/L 및 대체 과목은 이 시연에서 판정하지 않습니다.
          </DemoNote>
        </div>
      </Panel>
    </>
  )
}

export function Planner({
  plan,
  onToggle,
  onView,
  conflict,
  onClearConflict,
}: CourseActions & {
  conflict?: PlannerConflict
  onClearConflict: () => void
}) {
  const [query, setQuery] = useState("")
  const available = courses.filter(
    (course) => course.time && matches(course, query)
  )
  const credits = creditsOf(plan)
  return (
    <>
      <PageHeading
        title="학기 플래너"
        description="과목을 추가하면 시간표와 예상 이수 학점이 바로 업데이트돼요."
        action={<Badge variant="secondary">2027학년도 1학기 · 데모</Badge>}
      />
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
        <Panel title="수강 후보 과목">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="과목명 · 학수번호 검색"
            aria-label="플래너 과목 검색"
          />
          <ul className="mt-2 divide-y">
            {available.map((course) => {
              const added = plan.some(({ id }) => id === course.id)
              const Icon = added ? X : Plus
              return (
                <li
                  key={course.id}
                  className="flex items-center justify-between gap-2 py-2"
                >
                  <button
                    onClick={() => onView(course)}
                    className="rounded text-left hover:text-primary"
                  >
                    <span className="block text-sm font-semibold">
                      {course.name}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {courseTime(course.time!)} · 3학점
                    </span>
                  </button>
                  <Button
                    size="icon-sm"
                    variant={added ? "secondary" : "outline"}
                    aria-label={`${course.name} ${added ? "제거" : "추가"}`}
                    onClick={() => onToggle(course)}
                  >
                    <Icon />
                  </Button>
                </li>
              )
            })}
          </ul>
          {available.length === 0 && (
            <p className="mt-3 text-sm text-muted-foreground">
              검색 결과가 없어요.
            </p>
          )}
        </Panel>
        <div className="min-w-0 space-y-4">
          <Panel
            title="주간 시간표"
            action={
              <Badge variant="outline">
                {plan.length}과목 · {credits}학점
              </Badge>
            }
          >
            {conflict && (
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
                <div className="flex items-start gap-2">
                  <CircleAlert className="mt-0.5 size-4 shrink-0" />
                  <div>
                    <p role="status" className="font-semibold">
                      {conflict.candidate.time &&
                        courseTime(conflict.candidate.time)}{" "}
                      · 시간표 충돌
                    </p>
                    <p className="mt-0.5">
                      {conflict.enrolled.name} (기존) /{" "}
                      {conflict.candidate.name} (추가 안 됨)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TextLink to={`what-if?course=${conflict.candidate.id}`}>
                    다음 학기로 미뤄 보기
                  </TextLink>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="충돌 표시 닫기"
                    onClick={onClearConflict}
                  >
                    <X />
                  </Button>
                </div>
              </div>
            )}
            <Suspense
              fallback={
                <p className="min-h-60 rounded-lg border p-3 text-sm text-muted-foreground">
                  시간표 불러오는 중…
                </p>
              }
            >
              <PlannerCalendar
                plan={plan}
                conflict={conflict}
                onView={onView}
              />
            </Suspense>
            {plan.length === 0 && (
              <p className="mt-3 text-sm text-muted-foreground">
                후보 목록에서 과목을 추가해 시간표를 채워 보세요.
              </p>
            )}
          </Panel>
          <Panel
            title="수강 학점"
            action={
              <div className="flex flex-wrap gap-3">
                <TextLink to="impact">수강취소 영향 분석</TextLink>
                <TextLink to="graduation">졸업 요건 확인</TextLink>
              </div>
            }
          >
            <Meter label="계획 학점" value={credits} goal={21} />
            <p className="mt-3 text-xs text-muted-foreground">
              변경 사항은 이 브라우저에 자동 저장돼요. 실제 수강신청은
              이루어지지 않습니다.
            </p>
          </Panel>
        </div>
      </div>
    </>
  )
}

export function CourseDetails({
  course,
  plan,
  onToggle,
  onClose,
  feedback,
}: {
  course: Course | null
  plan: Course[]
  onToggle: (course: Course) => void
  onClose: () => void
  feedback: ReactNode
}) {
  const added = plan.some(({ id }) => course?.id === id)
  const next = courses.filter(
    (item) => course && item.requires?.includes(course.id)
  )
  return (
    <Dialog
      open={course !== null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      {course && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{course.name}</DialogTitle>
            <DialogDescription>
              {course.id} · {course.category} · 3학점
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{terms[course.term]} 권장</Badge>
              <Badge variant="outline">
                {course.completed
                  ? "이수 완료"
                  : enrolledIds.includes(course.id)
                    ? "현재 수강 중"
                    : added
                      ? "수강 계획에 포함"
                      : "미이수"}
              </Badge>
            </div>
            <p>
              수업 시간:{" "}
              {course.time
                ? courseTime(course.time)
                : "학기 플래너에 개설되지 않음"}
            </p>
            <section>
              <h3 className="mb-1 font-semibold">선수 과목</h3>
              <p className="text-muted-foreground">
                {course.requires
                  ?.map((id) => {
                    const item = courseById(id)
                    return `${item?.name ?? id}${item?.completed ? " (이수)" : " (미이수)"}`
                  })
                  .join(", ") || "없음"}
              </p>
            </section>
            <section>
              <h3 className="mb-1 font-semibold">연계 과목</h3>
              <p className="text-muted-foreground">
                {next.map((item) => item.name).join(", ") || "없음"}
              </p>
            </section>
            {feedback}
          </div>
          {course.time && !course.completed && (
            <DialogFooter>
              <Button
                variant={added ? "outline" : "default"}
                onClick={() => onToggle(course)}
              >
                {added ? "수강 계획에서 제거" : "수강 계획에 추가"}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      )}
    </Dialog>
  )
}
