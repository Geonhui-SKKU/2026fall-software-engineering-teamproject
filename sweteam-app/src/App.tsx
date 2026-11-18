import { useEffect, useState } from "react"
import { CircleAlert, CircleCheck } from "lucide-react"

import { AcademicRecords, Preassignment } from "@/components/academic-views"
import { CourseDetails, Planner, Roadmap } from "@/components/course-planning"
import { Brand } from "@/components/demo-ui"
import {
  AcademicCalendar,
  ProgramDetail,
  Programs,
  Welcome,
} from "@/components/extra-views"
import { Dashboard, Graduation } from "@/components/overview"
import type { PlannerConflict } from "@/components/planner-calendar"
import { WhatIf, WithdrawalImpact } from "@/components/scenario-views"
import { Badge } from "@/components/ui/badge"
import {
  courseById,
  defaultPlanIds,
  preassignmentNotices,
  type Course,
} from "@/lib/demo"
import { cn } from "@/lib/utils"

const links = [
  ["dashboard", "대시보드"],
  ["roadmap", "과목 로드맵"],
  ["planner", "학기 플래너"],
  ["preassignment", "직권배정"],
  ["calendar", "학사일정"],
  ["graduation", "졸업 진단"],
  ["what-if", "What-if"],
  ["impact", "취소 영향"],
  ["programs", "프로그램"],
  ["records", "학적 기록"],
] as const

function currentRoute() {
  const [hash, query] = window.location.hash.slice(1).split("?")
  const page =
    hash === "welcome" || hash === "program-detail"
      ? hash
      : (links.find(([id]) => id === hash)?.[0] ?? "dashboard")
  return { page, courseId: new URLSearchParams(query).get("course") ?? "" }
}

function useStoredIds(key: string, defaults: string[]) {
  const [ids, setIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw === null) return defaults
      const parsed: unknown = JSON.parse(raw)
      return Array.isArray(parsed) &&
        parsed.every((item) => typeof item === "string")
        ? [...new Set(parsed)]
        : defaults
    } catch {
      return defaults
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(ids))
    } catch {
      // Local storage can be disabled; keep the current session usable.
    }
  }, [ids, key])
  return [ids, setIds] as const
}

const toggleId = (ids: string[], id: string) =>
  ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id]

function App() {
  const [{ page, courseId }, setRoute] = useState(currentRoute)
  const [course, setCourse] = useState<Course | null>(null)
  const [conflict, setConflict] = useState<PlannerConflict>()
  const [notice, setNotice] = useState<{
    message: string
    warning?: boolean
  } | null>(null)
  const [plannedIds, setPlannedIds] = useStoredIds(
    "skku-road.plan.v1",
    defaultPlanIds
  )
  const [reminders, setReminders] = useStoredIds("skku-road.reminders.v1", [
    "registration",
  ])
  const [noticeReminders, setNoticeReminders] = useStoredIds(
    "skku-road.preassignment-reminders.v1",
    []
  )
  const [applied, setApplied] = useStoredIds(
    "skku-road.preassignment-applied.v1",
    []
  )
  const plan = plannedIds
    .map(courseById)
    .filter((item): item is Course => Boolean(item?.time) && !item?.completed)

  useEffect(() => {
    function onHashChange() {
      setRoute(currentRoute())
      setCourse(null)
      setConflict(undefined)
      setNotice(null)
      window.scrollTo(0, 0)
    }
    window.addEventListener("hashchange", onHashChange)
    return () => window.removeEventListener("hashchange", onHashChange)
  }, [])

  function toggleCourse(item: Course) {
    if (!item.time || item.completed) return
    setConflict(undefined)
    if (plannedIds.includes(item.id)) {
      setPlannedIds((ids) => ids.filter((id) => id !== item.id))
      setNotice({ message: `${item.name} 과목을 수강 계획에서 제거했어요.` })
      return
    }
    const conflict = plan.find(
      ({ time }) => time?.[0] === item.time?.[0] && time?.[1] === item.time?.[1]
    )
    if (conflict) {
      setConflict({ enrolled: conflict, candidate: item })
      setNotice({
        message: `${conflict.name} 과목과 시간이 겹쳐 추가할 수 없어요.`,
        warning: true,
      })
      return
    }
    const missing = item.requires
      ?.filter((id) => !courseById(id)?.completed)
      .map((id) => courseById(id)?.name ?? id)
    setPlannedIds((ids) => [...ids, item.id])
    setNotice(
      missing?.length
        ? {
            message: `${item.name} 과목을 추가했어요. 미이수 선수 과목: ${missing.join(", ")}`,
            warning: true,
          }
        : { message: `${item.name} 과목을 수강 계획에 추가했어요.` }
    )
  }

  function viewCourse(item: Course) {
    setNotice(null)
    setCourse(item)
  }

  function resetDemo() {
    setPlannedIds(defaultPlanIds)
    setReminders(["registration"])
    setNoticeReminders([])
    setApplied([])
    window.location.hash = "dashboard"
  }

  const feedback = notice && (
    <p
      role="status"
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
        notice.warning
          ? "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200"
          : "border-primary/25 bg-accent text-accent-foreground"
      )}
    >
      {notice.warning ? (
        <CircleAlert className="size-4 shrink-0" />
      ) : (
        <CircleCheck className="size-4 shrink-0" />
      )}
      {notice.message}
    </p>
  )

  if (page === "welcome") return <Welcome />

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-20 border-b bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-5 px-4 sm:px-6">
          <a href="#dashboard" className="my-3 rounded-lg">
            <Brand />
          </a>
          <nav
            aria-label="주 메뉴"
            className="order-last flex w-full items-center gap-1 overflow-x-auto py-2 lg:order-0 lg:w-auto lg:flex-1"
          >
            {links.map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                aria-current={
                  page === id ||
                  (page === "program-detail" && id === "programs")
                    ? "page"
                    : undefined
                }
                className={cn(
                  "rounded-lg px-2.5 py-2 text-sm whitespace-nowrap transition-colors",
                  page === id ||
                    (page === "program-detail" && id === "programs")
                    ? "bg-accent font-semibold text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Badge variant="outline">시연용</Badge>
            <span
              className="grid size-8 place-items-center rounded-full bg-accent text-xs font-bold text-primary"
              aria-label="김성균 학생"
            >
              김
            </span>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {!course && feedback && <div className="mb-4">{feedback}</div>}
        {page === "dashboard" && <Dashboard plan={plan} />}
        {page === "roadmap" && <Roadmap plan={plan} onView={viewCourse} />}
        {page === "planner" && (
          <Planner
            plan={plan}
            onToggle={toggleCourse}
            onView={viewCourse}
            conflict={conflict}
            onClearConflict={() => {
              setConflict(undefined)
              setNotice(null)
            }}
          />
        )}
        {page === "calendar" && (
          <AcademicCalendar
            reminders={reminders}
            onToggle={(id) => {
              setReminders((ids) =>
                ids.includes(id)
                  ? ids.filter((value) => value !== id)
                  : [...ids, id]
              )
            }}
          />
        )}
        {page === "preassignment" && (
          <Preassignment
            reminders={noticeReminders}
            applied={applied}
            onReminder={(id) => {
              if (
                !applied.includes(id) &&
                preassignmentNotices.some(
                  (item) => item.id === id && item.period
                )
              ) {
                setNoticeReminders((ids) => toggleId(ids, id))
              }
            }}
            onApplied={(id) => {
              setApplied((ids) => toggleId(ids, id))
              setNoticeReminders((ids) => ids.filter((value) => value !== id))
            }}
          />
        )}
        {page === "records" && (
          <AcademicRecords plan={plan} onReset={resetDemo} />
        )}
        {page === "graduation" && <Graduation plan={plan} />}
        {page === "what-if" && (
          <WhatIf key={courseId} plan={plan} courseId={courseId} />
        )}
        {page === "impact" && (
          <WithdrawalImpact key={courseId} plan={plan} courseId={courseId} />
        )}
        {page === "programs" && <Programs plan={plan} onView={viewCourse} />}
        {page === "program-detail" && (
          <ProgramDetail plan={plan} onView={viewCourse} />
        )}
      </main>
      <CourseDetails
        course={course}
        plan={plan}
        onToggle={toggleCourse}
        onClose={() => setCourse(null)}
        feedback={feedback}
      />
    </div>
  )
}

export default App
