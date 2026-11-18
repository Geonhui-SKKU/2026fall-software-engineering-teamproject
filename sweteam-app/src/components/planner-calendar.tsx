import { useMemo } from "react"
import { ko } from "date-fns/locale"

import { EventCalendar } from "@/components/reui/event-calendar/event-calendar"
import { EventCalendarWeekView } from "@/components/reui/event-calendar/event-calendar-time-grid"
import type { CalendarEvent } from "@/components/reui/event-calendar/event-calendar-types"
import { courseTime, type Course } from "@/lib/demo"

export type PlannerConflict = { enrolled: Course; candidate: Course }

const demoMonday = new Date("2027-03-08T09:00:00+09:00")

function asEvent(
  course: Course,
  conflict?: PlannerConflict
): CalendarEvent<Course>[] {
  if (!course.time) return []
  const [day, hour] = course.time
  const start = new Date(
    demoMonday.getTime() + (day * 24 + hour - 9) * 3_600_000
  )
  const candidate = course.id === conflict?.candidate.id
  return [
    {
      id: course.id,
      title: course.name,
      start,
      end: new Date(start.getTime() + 3_600_000),
      readOnly: true,
      color: candidate
        ? "var(--color-amber-600)"
        : conflict?.enrolled.id === course.id
          ? "var(--destructive)"
          : "var(--primary)",
      data: course,
    },
  ]
}

export default function PlannerCalendar({
  plan,
  conflict,
  onView,
}: {
  plan: Course[]
  conflict?: PlannerConflict
  onView: (course: Course) => void
}) {
  const events = useMemo(
    () => [
      ...plan.flatMap((course) => asEvent(course, conflict)),
      ...(conflict ? asEvent(conflict.candidate, conflict) : []),
    ],
    [plan, conflict]
  )

  return (
    <div className="overflow-x-auto rounded-lg border">
      <EventCalendar
        aria-label="2027년 1학기 주간 시간표"
        className="min-w-[545px] [--ec-hour-height:3.5rem]"
        view="week"
        date={demoMonday}
        timeZone="Asia/Seoul"
        locale={ko}
        weekStartsOn={1}
        dayStartHour={9}
        dayEndHour={17}
        interval={60}
        scrollMode="page"
        nowIndicator={false}
        enableShortcuts={false}
        viewSettings={{ weekends: false }}
        interactions={{ drag: false, resize: false, selectSlot: false }}
        i18n={{
          formats: {
            timeGridDayHeader: "EEEE",
            timeGutter: "HH:mm",
            eventTime: "HH:mm",
          },
        }}
        events={events}
        onEventClick={({ event }) => {
          if (event.data) onView(event.data)
        }}
        renderEvent={({ occurrence: { event } }) => (
          <div className="flex min-w-0 flex-col gap-0.5 overflow-hidden px-1 py-0.5">
            <span className="truncate font-semibold">{event.title}</span>
            <span className="truncate text-[10px]">
              {event.id === conflict?.candidate.id
                ? "추가 안 됨"
                : event.id === conflict?.enrolled.id
                  ? "기존 계획 · 충돌"
                  : event.data?.time
                    ? courseTime(event.data.time)
                    : null}
            </span>
          </div>
        )}
      >
        <EventCalendarWeekView showAllDay={false} />
      </EventCalendar>
    </div>
  )
}
