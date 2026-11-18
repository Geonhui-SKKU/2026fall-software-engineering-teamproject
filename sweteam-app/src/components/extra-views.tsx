import { useState } from "react"
import { ArrowRight, CalendarDays, ClipboardCheck, Map } from "lucide-react"

import {
  Brand,
  DemoNote,
  EventList,
  EvaluationNote,
  Meter,
  PageHeading,
  Panel,
  TextLink,
} from "@/components/demo-ui"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { bootcamp, courseById, events, programs, type Course } from "@/lib/demo"

export function Welcome() {
  return (
    <main className="grid min-h-svh md:grid-cols-[44%_1fr]">
      <section className="flex flex-col justify-center gap-6 bg-primary p-8 text-primary-foreground sm:p-14">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">성균로드</h1>
          <p className="mt-3 text-sm opacity-85">
            성균관대학교 학생을 위한 학업 로드맵
          </p>
        </div>
        <ul className="grid gap-2 text-sm">
          {(
            [
              [Map, "학기별 과목 로드맵"],
              [CalendarDays, "나만의 수강 시간표"],
              [ClipboardCheck, "졸업 요건 진단"],
            ] as const
          ).map(([Icon, text]) => (
            <li
              className="flex items-center gap-2 rounded-lg bg-white/15 p-3"
              key={text}
            >
              <Icon className="size-4" />
              {text}
            </li>
          ))}
        </ul>
      </section>
      <section className="grid place-items-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="space-y-5">
            <Brand />
            <div>
              <h2 className="text-2xl font-bold">시작하기</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                로그인 없이 김성균 학생의 샘플 데이터로 성균로드를 체험하세요.
              </p>
            </div>
            <Button
              className="w-full"
              render={<a href="#dashboard" />}
              nativeButton={false}
            >
              데모 시작하기 <ArrowRight />
            </Button>
            <DemoNote>
              실제 학사 시스템과 연동되지 않으며 개인 정보를 입력하지 않습니다.
            </DemoNote>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

export function AcademicCalendar({
  reminders,
  onToggle,
}: {
  reminders: string[]
  onToggle: (id: string) => void
}) {
  const [filter, setFilter] = useState("전체")
  const list = events.filter(
    (event) =>
      filter === "전체" ||
      event.type === filter ||
      (filter === "알림 설정됨" && reminders.includes(event.id))
  )
  return (
    <>
      <PageHeading
        title="학사일정 알림"
        description="주요 수강신청 일정과 학사일정을 확인하세요."
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {["전체", "수강신청", "학사일정", "알림 설정됨"].map((item) => (
          <Button
            key={item}
            variant={filter === item ? "default" : "outline"}
            aria-pressed={filter === item}
            onClick={() => setFilter(item)}
          >
            {item}
          </Button>
        ))}
      </div>
      <div className="space-y-4">
        <Panel title="2027년 1학기 학사일정">
          {list.length ? (
            <EventList list={list} reminders={reminders} onToggle={onToggle} />
          ) : (
            <p className="text-sm text-muted-foreground">
              알림을 설정한 일정이 없어요.
            </p>
          )}
        </Panel>
        <DemoNote>
          알림 설정은 이 브라우저에 저장돼요. 데모에서는 실제 알림을 보내지
          않습니다.
        </DemoNote>
      </div>
    </>
  )
}

export function Programs({
  plan,
  onView,
}: {
  plan: Course[]
  onView: (course: Course) => void
}) {
  return (
    <>
      <PageHeading
        title="마이크로디그리 · 부트캠프 · 전공트랙"
        description="소프트웨어학과 특화 과정과 과목별 이수 상태를 확인하세요."
      />
      <div className="grid items-start gap-4 lg:grid-cols-3">
        {programs.map((program) => (
          <Panel
            key={program.name}
            title={program.name}
            action={<Badge variant="secondary">{program.label}</Badge>}
          >
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {program.description}
              </p>
              <Meter
                label="이수 과목"
                value={
                  program.ids.filter((id) => courseById(id)?.completed).length
                }
                goal={program.ids.length}
              />
              <ul className="divide-y">
                {program.ids.map((id) => {
                  const course = courseById(id)
                  if (!course) return null
                  return (
                    <li
                      className="flex items-center justify-between gap-2 py-2 text-sm"
                      key={id}
                    >
                      <button
                        className="text-left hover:text-primary hover:underline"
                        onClick={() => onView(course)}
                      >
                        {course.name}
                      </button>
                      <Badge
                        variant={course.completed ? "secondary" : "outline"}
                      >
                        {course.completed
                          ? "이수"
                          : plan.some((item) => item.id === id)
                            ? "계획"
                            : "미이수"}
                      </Badge>
                    </li>
                  )
                })}
              </ul>
              {program === programs[0] && (
                <TextLink to="program-detail">프로그램 상세 보기</TextLink>
              )}
            </div>
          </Panel>
        ))}
      </div>
      <div className="mt-4 space-y-4">
        <Panel
          title={bootcamp.name}
          action={<Badge variant="secondary">합성 부트캠프 예시</Badge>}
        >
          <dl className="grid gap-3 text-sm md:grid-cols-3">
            <div>
              <dt className="font-semibold">연계 마이크로디그리</dt>
              <dd className="mt-1">
                <TextLink to="program-detail">{programs[0].name}</TextLink>
              </dd>
            </div>
            <div>
              <dt className="font-semibold">비교과 이수 요건</dt>
              <dd className="mt-1">
                {bootcamp.activity} ·{" "}
                <span className="text-muted-foreground">확인 필요</span>
              </dd>
            </div>
            <div>
              <dt className="font-semibold">장학금 자격</dt>
              <dd className="mt-1 text-muted-foreground">
                미확인 · {bootcamp.scholarship} 실제 지급을 보장하지 않습니다.
              </dd>
            </div>
          </dl>
        </Panel>
        <EvaluationNote />
      </div>
    </>
  )
}

export function ProgramDetail({
  plan,
  onView,
}: {
  plan: Course[]
  onView: (course: Course) => void
}) {
  const program = programs[0]
  const list = program.ids.flatMap((id) => courseById(id) ?? [])
  const completed = list.filter((course) => course.completed)
  const planned = list.filter((course) =>
    plan.some((item) => item.id === course.id)
  )
  return (
    <>
      <PageHeading
        title={program.name}
        description={program.description}
        action={<TextLink to="programs">프로그램 목록</TextLink>}
      />
      <div className="space-y-4">
        <Panel
          title="마이크로디그리 이수 현황"
          action={
            <Badge variant="secondary">계획에 포함 {planned.length}과목</Badge>
          }
        >
          <Meter
            label="이수 완료"
            value={completed.length}
            goal={list.length}
          />
        </Panel>
        <Panel
          title="이수 요건"
          action={<TextLink to="roadmap">과목 로드맵 보기</TextLink>}
        >
          <p className="mb-3 text-sm text-muted-foreground">
            아래 {list.length}과목을 모두 이수하면 요건을 충족합니다.
          </p>
          <ul className="divide-y">
            {list.map((course) => (
              <li
                key={course.id}
                className="flex items-center justify-between gap-2 py-2.5"
              >
                <button
                  className="text-left text-sm font-medium hover:text-primary hover:underline"
                  onClick={() => onView(course)}
                >
                  {course.name}{" "}
                  <span className="text-xs text-muted-foreground">
                    {course.id}
                  </span>
                </button>
                <Badge variant={course.completed ? "secondary" : "outline"}>
                  {course.completed
                    ? "이수 완료"
                    : planned.includes(course)
                      ? "수강 계획"
                      : "미이수"}
                </Badge>
              </li>
            ))}
          </ul>
        </Panel>
        <EvaluationNote />
      </div>
    </>
  )
}
