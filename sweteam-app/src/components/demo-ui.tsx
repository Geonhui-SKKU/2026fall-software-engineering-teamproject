import type { ReactNode } from "react"
import { CalendarDays, Check, ChevronRight, GraduationCap } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  demoRules,
  events,
  graduationCredits,
  snapshotTime,
  type Course,
} from "@/lib/demo"
import { projectedRequirements, type summarizeProjection } from "@/lib/scenario"

export function Brand() {
  return (
    <span className="flex items-center gap-2.5 text-lg font-bold tracking-tight whitespace-nowrap">
      <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
        <GraduationCap className="size-5" />
      </span>
      성균로드
    </span>
  )
}

export function PageHeading({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl leading-tight font-bold tracking-tight sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  )
}

export function Panel({
  title,
  action,
  children,
  className,
}: {
  title: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-wrap items-center justify-between gap-2">
        <CardTitle role="heading" aria-level={2}>
          {title}
        </CardTitle>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

export function Meter({
  label,
  value,
  goal,
}: {
  label: string
  value: number
  goal: number
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-x-2 text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground tabular-nums">
          {value} / {goal}
        </span>
      </div>
      <Progress
        aria-label={label}
        value={Math.min(100, (value / goal) * 100)}
      />
    </div>
  )
}

export function CreditCards({ eligible }: { eligible: Course[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {projectedRequirements(eligible).map(
        ({ label, earned, goal, projected }) => (
          <Card key={label} size="sm">
            <CardContent className="space-y-2.5">
              <Meter label={label} value={earned} goal={goal} />
              <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                <Status complete={earned >= goal} />
                {projected > earned && (
                  <span className="text-muted-foreground">
                    예상 이수 {projected}학점
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        )
      )}
    </div>
  )
}

export function ProjectionBreakdown({
  summary,
}: {
  summary: ReturnType<typeof summarizeProjection>
}) {
  return (
    <>
      <dl className="grid gap-2 sm:grid-cols-3">
        {[
          ["취득 학점", summary.earned],
          ["모든 계획 과목 이수 시", summary.includesAllPlanned],
          ["첫 학기 이후 예상 누적 학점", summary.projected],
        ].map(([label, credits]) => (
          <div key={label} className="rounded-lg border p-2.5">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="mt-1 text-base font-semibold tabular-nums">
              {credits}학점
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-xs text-muted-foreground">
        현재 수강 과목은 다음 학기 전에 이수한다고 가정하며, 그 학점은 이 예상
        누계에 포함하지 않습니다.
      </p>
      {summary.excluded.length > 0 && (
        <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          <p className="font-semibold">예상 학점에서 제외된 과목</p>
          <ul className="mt-1 list-disc space-y-1 pl-4">
            {summary.excluded.map(({ course, prerequisites, conflicts }) => (
              <li key={course.id}>
                {course.name} ·{" "}
                {[
                  prerequisites.length
                    ? `미이수 선수 과목: ${prerequisites.map((item) => item.name).join(", ")}`
                    : "",
                  conflicts.length
                    ? `시간표 충돌: ${conflicts.map((item) => item.name).join(", ")}`
                    : "",
                ]
                  .filter(Boolean)
                  .join(" / ")}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}

export function EvaluationNote() {
  return (
    <DemoNote>
      {demoRules.advisory} 기준: {demoRules.source} ({demoRules.scope}). 모의
      학적 기준 시각: {snapshotTime}.
    </DemoNote>
  )
}

export function Status({ complete }: { complete: boolean }) {
  return complete ? (
    <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
      <Check /> 충족
    </Badge>
  ) : (
    <Badge className="bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
      미충족
    </Badge>
  )
}

export function EventList({
  list,
  reminders,
  onToggle,
}: {
  list: typeof events
  reminders?: string[]
  onToggle?: (id: string) => void
}) {
  return (
    <ul className="divide-y">
      {list.map((event) => (
        <li
          key={event.id}
          className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
        >
          <div className="grid min-w-12 place-items-center rounded-lg bg-accent p-1 text-accent-foreground">
            <span className="text-[10px]">{event.month}</span>
            <strong className="text-lg leading-tight">{event.day}</strong>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{event.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {event.date} · {event.type}
            </p>
          </div>
          {onToggle && (
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <input
                type="checkbox"
                className="size-4 accent-primary"
                checked={reminders?.includes(event.id) ?? false}
                onChange={() => onToggle(event.id)}
                aria-label={`${event.name} 알림`}
              />
              <span aria-hidden="true">알림</span>
            </label>
          )}
        </li>
      ))}
    </ul>
  )
}

export function TextLink({
  to,
  children,
}: {
  to: string
  children: ReactNode
}) {
  return (
    <a
      href={`#${to}`}
      className="inline-flex items-center gap-1 rounded text-xs font-semibold text-primary hover:underline"
    >
      {children}
      <ChevronRight className="size-3.5" />
    </a>
  )
}

export function DemoNote({ children }: { children?: ReactNode }) {
  return (
    <p className="flex items-start gap-2 rounded-lg border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
      <CalendarDays className="mt-px size-4 shrink-0" />
      {children ??
        `졸업 기준 ${graduationCredits}학점과 과목 정보는 시연용 예시이며, 실제 학사 정보와 다를 수 있습니다.`}
    </p>
  )
}
