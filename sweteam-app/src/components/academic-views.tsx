import { DemoNote, PageHeading, Panel, TextLink } from "@/components/demo-ui"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  academicRecords,
  cohort,
  preassignmentNotices,
  snapshotTime,
  type Course,
} from "@/lib/demo"

const archivedReference =
  "https://cse.skku.edu/cse/notice.do?mode=view&articleNo=222220"

export function Preassignment({
  reminders,
  applied,
  onReminder,
  onApplied,
}: {
  reminders: string[]
  applied: string[]
  onReminder: (id: string) => void
  onApplied: (id: string) => void
}) {
  return (
    <>
      <PageHeading
        title="직권배정 알림"
        description="시연 공지의 대상과 신청 기간을 확인하고 개인 추적 상태를 관리하세요."
        action={<TextLink to="calendar">학사일정 보기</TextLink>}
      />
      <div className="space-y-4">
        <DemoNote>
          공지와 일정은 합성 예시입니다. 알림 설정과 신청 기록은 이 브라우저에만
          저장되며, 실제 알림 발송이나 신청 제출은 하지 않습니다.
        </DemoNote>
        {preassignmentNotices.map((notice) => {
          const marked = applied.includes(notice.id)
          return (
            <Panel
              key={notice.id}
              title={notice.title}
              action={
                <Badge variant="secondary">
                  {marked
                    ? "신청 기록됨 (Applied)"
                    : notice.eligibilityKnown
                      ? "시연 대상"
                      : "자격 확인 필요"}
                </Badge>
              }
            >
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-muted-foreground">과목 · 학과</dt>
                  <dd>
                    {notice.courseId} · {notice.department}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">신청 기간</dt>
                  <dd>{notice.period ?? "마감 미확인 (Unknown)"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">신청 자격</dt>
                  <dd>{notice.eligibility}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">신청 방법</dt>
                  <dd>{notice.method}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs text-muted-foreground">출처</dt>
                  <dd>
                    성균로드 팀 · 합성 공지.{" "}
                    <a
                      className="font-medium text-primary underline"
                      href={archivedReference}
                      target="_blank"
                      rel="noreferrer"
                    >
                      학과 공식 공지 형식 예시 (2026-2학기 강화학습개론)
                    </a>
                  </dd>
                </div>
              </dl>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="size-4 accent-primary"
                    aria-label={`${notice.title} 알림 설정`}
                    checked={reminders.includes(notice.id)}
                    disabled={marked || !notice.period}
                    onChange={() => onReminder(notice.id)}
                  />
                  알림 설정
                </label>
                <Button
                  size="sm"
                  variant="outline"
                  aria-pressed={marked}
                  onClick={() => onApplied(notice.id)}
                >
                  {marked ? "신청 기록 취소" : "신청했다고 표시"}
                </Button>
              </div>
              {(marked || !notice.period) && (
                <p role="status" className="mt-2 text-xs text-muted-foreground">
                  {marked
                    ? "개인용 신청 기록입니다. 남은 알림 설정을 해제했으며 실제 제출이나 선발을 확인하지 않습니다."
                    : "확정된 마감이 없어 알림을 예약하지 않습니다."}
                </p>
              )}
            </Panel>
          )
        })}
      </div>
    </>
  )
}

export function AcademicRecords({
  plan,
  onReset,
}: {
  plan: Course[]
  onReset: () => void
}) {
  return (
    <>
      <PageHeading
        title="모의 학적 기록"
        description={`김성균 · 소프트웨어학과 · ${cohort} · 단일전공`}
      />
      <div className="space-y-4">
        <DemoNote>
          GLS와 연동되지 않습니다. 아래는 합성 학적의 일부 과목이며, 대시보드
          취득 학점은 전체 합성 누계입니다.
        </DemoNote>
        <Panel
          title="학적 스냅샷"
          action={<Badge variant="secondary">모의 동기화 {snapshotTime}</Badge>}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {(["enrolled", "unmatched", "completed"] as const).map((status) => (
              <section
                key={status}
                className={status === "completed" ? "sm:col-span-2" : undefined}
              >
                <h3 className="font-semibold">
                  {status === "completed"
                    ? "이수 완료"
                    : status === "enrolled"
                      ? "현재 수강 중"
                      : "카탈로그 미일치 (Unmatched)"}
                </h3>
                <ul className="mt-1 divide-y">
                  {academicRecords
                    .filter((item) => item.status === status)
                    .map((item) => (
                      <li
                        key={item.id}
                        className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm"
                      >
                        <div>
                          <p>{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.id} · {item.period}
                            {item.grade ? ` · ${item.grade}` : ""}
                            {status === "unmatched"
                              ? " · 계산에서 제외"
                              : " · 3학점"}
                          </p>
                        </div>
                        {status === "enrolled" && (
                          <TextLink to={`impact?course=${item.id}`}>
                            취소 영향 보기
                          </TextLink>
                        )}
                      </li>
                    ))}
                </ul>
              </section>
            ))}
          </div>
        </Panel>
        <Panel
          title="다음 학기 수강 계획 · 학적과 별도"
          action={<TextLink to="planner">학기 플래너</TextLink>}
        >
          <p className="text-sm">
            {plan.map((course) => course.name).join(", ") || "계획 과목 없음"}
          </p>
        </Panel>
        <Panel title="시연 초기화">
          <p className="mb-3 text-sm text-muted-foreground">
            이 브라우저의 수강 계획과 알림, 신청 기록을 샘플 상태로 되돌립니다.
          </p>
          <Dialog>
            <DialogTrigger render={<Button variant="outline" />}>
              데모 데이터 초기화
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>데모 데이터를 초기화할까요?</DialogTitle>
                <DialogDescription>
                  이 브라우저에 저장된 시연용 수강 계획, 알림, 신청 기록을 초기
                  상태로 되돌립니다.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose render={<Button variant="outline" />}>
                  취소
                </DialogClose>
                <Button onClick={onReset}>초기화 확인</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Panel>
      </div>
    </>
  )
}
