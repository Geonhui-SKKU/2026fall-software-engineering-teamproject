import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  Map,
  Sparkles,
} from "lucide-react"

import {
  CreditCards,
  EvaluationNote,
  EventList,
  Meter,
  PageHeading,
  Panel,
  ProjectionBreakdown,
  Status,
  TextLink,
} from "@/components/demo-ui"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  cohort,
  courseById,
  creditsOf,
  demoRules,
  earnedCredits,
  events,
  graduationCredits,
  graduationTarget,
  programs,
  requirements,
  snapshotTime,
  type Course,
} from "@/lib/demo"
import {
  baselineScenario,
  graduationChecks,
  summarizeProjection,
} from "@/lib/scenario"

export function Dashboard({ plan }: { plan: Course[] }) {
  const projection = summarizeProjection(baselineScenario(plan))
  const stats = [
    {
      label: "취득 학점",
      value: (
        <>
          {earnedCredits}
          <span className="text-lg font-medium text-muted-foreground">
            {" "}
            / {graduationCredits}
          </span>
        </>
      ),
      icon: BookOpen,
      note: `졸업까지 ${graduationCredits - earnedCredits}학점 남았어요`,
      to: "graduation",
    },
    {
      label: "졸업 요건 충족",
      value: `${requirements.filter(({ earned, goal }) => earned >= goal).length} / ${requirements.length} 항목`,
      icon: ClipboardCheck,
      note: "학점 영역별 충족 여부",
      to: "graduation",
    },
    {
      label: "목표 졸업 시기",
      value: graduationTarget,
      icon: GraduationCap,
      note: `${cohort} · 8학기 기준`,
      to: "what-if",
    },
    {
      label: "다음 학기 계획",
      value: `${plan.length}과목`,
      icon: CalendarDays,
      note: `2027년 1학기 · ${creditsOf(plan)}학점 예정`,
      to: "planner",
    },
  ]

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border bg-card px-5 py-6 sm:px-8 sm:py-8">
        <div className="dashboard-pattern" aria-hidden="true" />
        <div className="relative flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="mb-3 text-xs font-semibold tracking-wide text-primary">
              2027학년도 1학기 <span className="mx-1 opacity-40">/</span> 학업
              대시보드
            </p>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              안녕하세요, 김성균 님!
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              소프트웨어학과 · {cohort} · 3학년 2학기 · 단일전공
            </p>
            <div className="mt-2">
              <TextLink to="records">모의 학적 · {snapshotTime}</TextLink>
            </div>
          </div>
          <Button size="lg" render={<a href="#roadmap" />} nativeButton={false}>
            <Map /> 과목 로드맵 보기 <ArrowRight />
          </Button>
        </div>
      </section>
      <section
        aria-label="학업 현황"
        className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map(({ label, value, icon: Icon, note, to }, index) => (
          <a key={label} href={`#${to}`} className="group rounded-xl">
            <Card className="h-full transition-colors group-hover:ring-primary/40">
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {label}
                  </p>
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent text-primary">
                    <Icon className="size-4" />
                  </span>
                </div>
                <p className="text-2xl font-bold tracking-tight tabular-nums">
                  {value}
                </p>
                {index === 0 && (
                  <Progress
                    aria-label="취득 학점"
                    value={(earnedCredits / graduationCredits) * 100}
                  />
                )}
                <p className="text-xs text-muted-foreground">{note}</p>
              </CardContent>
            </Card>
          </a>
        ))}
      </section>
      <section aria-labelledby="credits-heading">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2
            id="credits-heading"
            className="text-lg font-semibold tracking-tight"
          >
            영역별 이수 현황
          </h2>
          <TextLink to="graduation">졸업 요건 자세히 보기</TextLink>
        </div>
        <CreditCards eligible={projection.eligible} />
      </section>
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <Panel
          title="다가오는 학사일정"
          action={<TextLink to="calendar">일정 전체 보기</TextLink>}
        >
          <EventList list={events.slice(0, 3)} />
        </Panel>
        <Panel
          title="마이크로디그리 · 전공트랙"
          action={<TextLink to="programs">프로그램 보기</TextLink>}
        >
          <div className="space-y-5">
            {programs.slice(0, 2).map((program) => (
              <Meter
                key={program.name}
                label={program.name}
                value={
                  program.ids.filter((id) => courseById(id)?.completed).length
                }
                goal={program.ids.length}
              />
            ))}
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" /> 과목별 이수 내역을
              바탕으로 진행률을 표시해요.
            </p>
          </div>
        </Panel>
      </div>
    </div>
  )
}

export function Graduation({ plan }: { plan: Course[] }) {
  const projection = summarizeProjection(baselineScenario(plan))
  const { rows, certification, readiness } = graduationChecks(
    projection.eligible
  )

  function downloadReport() {
    const lines = [
      "성균로드 · 졸업 요건 리포트 (시연용)",
      `취득 ${projection.earned} / ${graduationCredits}학점 · 모든 계획 과목 이수 시 ${projection.includesAllPlanned}학점 · 첫 학기 이후 예상 ${projection.projected}학점`,
      `${demoRules.advisory} ${demoRules.source} · ${demoRules.scope} · 모의 학적 ${snapshotTime}`,
      `${certification.label}: 확인 필요 (Unknown) · ${certification.reason}`,
      ...rows.map(
        (row) =>
          `${row.label}: ${row.earned}/${row.goal}학점 (예상 ${row.projected}학점)`
      ),
      "수강 계획: " + (plan.map((course) => course.name).join(", ") || "없음"),
    ]
    const url = URL.createObjectURL(
      new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" })
    )
    const link = document.createElement("a")
    link.href = url
    link.download = "성균로드-졸업리포트.txt"
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <>
      <PageHeading
        title="졸업 요건 진단"
        description="취득 학점과 수강 계획을 바탕으로 졸업 준비 상태를 확인하세요."
        action={<Button onClick={downloadReport}>리포트 다운로드</Button>}
      />
      <div className="space-y-5">
        <EvaluationNote />
        <Panel
          title="총 이수 학점"
          action={
            <Badge variant="secondary">
              졸업 시연 기준 {graduationCredits}학점
            </Badge>
          }
        >
          <ProjectionBreakdown summary={projection} />
        </Panel>
        <CreditCards eligible={projection.eligible} />
        <Panel title="학점 외 졸업 요건">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold">{certification.label}</p>
            <Badge variant="outline">확인 필요 (Unknown)</Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {certification.reason}
          </p>
          <p className="mt-2 text-sm">
            {readiness === "met"
              ? "시연 기준 충족"
              : "미충족 또는 확인이 필요한 요건이 있어 졸업 요건 충족으로 판정하지 않습니다."}
          </p>
        </Panel>
        <Panel title="아직 필요한 졸업 요건">
          <ul className="divide-y">
            {rows
              .filter(({ earned, goal }) => earned < goal)
              .map(({ label, earned, goal, projected }) => (
                <li
                  key={label}
                  className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-semibold">
                      {label} · 취득 기준 {goal - earned}학점 필요
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {projected >= goal
                        ? "이수 가능으로 예상된 과목을 모두 이수하면 충족할 수 있어요."
                        : `예상 이수 학점을 포함해도 ${goal - projected}학점 더 필요해요.`}
                    </p>
                  </div>
                  <TextLink to={projected >= goal ? "planner" : "roadmap"}>
                    {projected >= goal
                      ? "수강 계획 확인"
                      : "추천 학기별 과목 찾기"}
                  </TextLink>
                </li>
              ))}
          </ul>
        </Panel>
        <Panel
          title="영역별 상세 요건"
          action={<TextLink to="planner">수강 계획 수정</TextLink>}
        >
          <ul className="divide-y">
            {rows.map(({ label, earned, goal, projected }) => (
              <li
                key={label}
                className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
              >
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    취득 {earned} / {goal}학점 · 예상 이수 {projected}학점
                  </p>
                </div>
                <Status complete={earned >= goal} />
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  )
}
