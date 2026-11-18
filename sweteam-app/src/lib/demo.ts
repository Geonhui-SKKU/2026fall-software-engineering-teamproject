export const categories = ["전공필수", "전공선택", "교양"] as const
export type Category = (typeof categories)[number]
export const days = ["월", "화", "수", "목", "금"]
export const cohort = "2024학번"
export const graduationTarget = "2028년 2월"
export const demoRules = {
  source: "성균로드 팀 · 합성 규칙 세트 v1",
  scope: `${cohort} 소프트웨어학과 단일전공 · 2027년 1학기 시연`,
  advisory: "시연용 참고 정보입니다. 공식 학사 판단은 대학이 합니다.",
}
export const defaultPlanIds = ["SWE3011", "SWE3020", "SWE3021"]
export const snapshotTime = "2026.11.19 10:00 (KST)"
export const enrolledIds = ["SWE3095"]
export const terms = Array.from(
  { length: 8 },
  (_, index) => `${Math.floor(index / 2) + 1}학년 ${(index % 2) + 1}학기`
)

export type Course = {
  id: string
  name: string
  term: number
  category: Category
  completed?: boolean
  requires?: string[]
  time?: [day: number, hour: number]
}

export const courses: Course[] = [
  {
    id: "SWE1001",
    name: "프로그래밍기초",
    term: 0,
    category: "전공필수",
    completed: true,
  },
  {
    id: "GED1001",
    name: "대학글쓰기",
    term: 0,
    category: "교양",
    completed: true,
  },
  {
    id: "MAT1001",
    name: "미적분학",
    term: 0,
    category: "교양",
    completed: true,
  },
  {
    id: "SWE1002",
    name: "객체지향프로그래밍",
    term: 1,
    category: "전공필수",
    completed: true,
    requires: ["SWE1001"],
  },
  {
    id: "SWE2011",
    name: "이산수학",
    term: 1,
    category: "전공선택",
    completed: true,
  },
  {
    id: "GED1002",
    name: "글로벌영어",
    term: 1,
    category: "교양",
    completed: true,
  },
  {
    id: "SWE2015",
    name: "자료구조",
    term: 2,
    category: "전공필수",
    completed: true,
    requires: ["SWE1002"],
  },
  {
    id: "SWE2020",
    name: "컴퓨터구조",
    term: 2,
    category: "전공선택",
    completed: true,
  },
  {
    id: "MAT2002",
    name: "선형대수",
    term: 2,
    category: "교양",
    completed: true,
  },
  {
    id: "SWE3001",
    name: "알고리즘개론",
    term: 3,
    category: "전공필수",
    completed: true,
    requires: ["SWE2015"],
  },
  {
    id: "SWE3004",
    name: "데이터베이스",
    term: 3,
    category: "전공선택",
    completed: true,
  },
  {
    id: "SWE3005",
    name: "시스템프로그래밍",
    term: 3,
    category: "전공선택",
    completed: true,
  },
  {
    id: "SWE3095",
    name: "소프트웨어설계실습",
    term: 5,
    category: "전공선택",
    requires: ["SWE3005"],
  },
  {
    id: "SWE3011",
    name: "운영체제",
    term: 4,
    category: "전공필수",
    requires: ["SWE2020"],
    time: [0, 10],
  },
  {
    id: "SWE3020",
    name: "소프트웨어공학",
    term: 4,
    category: "전공필수",
    requires: ["SWE3001"],
    time: [2, 10],
  },
  {
    id: "SWE3021",
    name: "컴퓨터네트워크",
    term: 4,
    category: "전공선택",
    time: [1, 13],
  },
  {
    id: "SWE3024",
    name: "인공지능",
    term: 4,
    category: "전공선택",
    requires: ["SWE3001"],
    time: [3, 14],
  },
  {
    id: "GED2010",
    name: "과학기술과사회",
    term: 4,
    category: "교양",
    time: [4, 11],
  },
  {
    id: "SWE3030",
    name: "웹프로그래밍",
    term: 5,
    category: "전공선택",
    time: [0, 10],
  },
  {
    id: "SWE3031",
    name: "기계학습",
    term: 5,
    category: "전공선택",
    requires: ["SWE3024"],
    time: [2, 14],
  },
  {
    id: "SWE3032",
    name: "정보보호개론",
    term: 5,
    category: "전공선택",
    time: [4, 14],
  },
  {
    id: "SWE4001",
    name: "캡스톤디자인 1",
    term: 6,
    category: "전공필수",
    requires: ["SWE3020", "SWE3095"],
  },
  {
    id: "SWE4006",
    name: "클라우드컴퓨팅",
    term: 6,
    category: "전공선택",
    requires: ["SWE3021"],
  },
  { id: "GED4010", name: "기술과창업", term: 6, category: "교양" },
  {
    id: "SWE4002",
    name: "캡스톤디자인 2",
    term: 7,
    category: "전공필수",
    requires: ["SWE4001"],
  },
  { id: "SWE4010", name: "소프트웨어현장실습", term: 7, category: "전공선택" },
]

export const requirements = [
  { label: "전공필수", earned: 18, goal: 24 },
  { label: "전공선택", earned: 27, goal: 36 },
  { label: "교양", earned: 33, goal: 30 },
  { label: "일반선택", earned: 9, goal: 10 },
]
export const earnedCredits = requirements.reduce(
  (sum, item) => sum + item.earned,
  0
)
export const graduationCredits = 130
export const courseById = (id: string) =>
  courses.find((course) => course.id === id)
export const academicRecords = [
  ...courses
    .filter((course) => course.completed)
    .map((course) => ({
      id: course.id,
      name: course.name,
      period: terms[course.term],
      grade: "A0",
      status: "completed" as const,
    })),
  ...enrolledIds.map((id) => ({
    id,
    name: courseById(id)?.name ?? id,
    period: "2026년 2학기",
    grade: null,
    status: "enrolled" as const,
  })),
  {
    id: "DEMO9999",
    name: "교환과목 예시",
    period: "2026년 1학기",
    grade: "P",
    status: "unmatched" as const,
  },
]
export const knownCompletedIds = academicRecords
  .filter(({ status }) => status === "completed")
  .map(({ id }) => id)
export const creditsOf = (list: readonly Course[]) =>
  new Set(list.map(({ id }) => id)).size * 3
export const courseTime = ([day, hour]: NonNullable<Course["time"]>) =>
  `${days[day]} ${String(hour).padStart(2, "0")}:00–${hour + 1}:00`

export const events = [
  {
    id: "registration",
    month: "02월",
    day: "17",
    name: "2027학년도 1학기 수강신청",
    date: "2027.02.17 – 02.19",
    type: "수강신청",
  },
  {
    id: "semester",
    month: "03월",
    day: "02",
    name: "2027학년도 1학기 개강",
    date: "2027.03.02",
    type: "학사일정",
  },
  {
    id: "adjustment",
    month: "03월",
    day: "02",
    name: "수강 변경 및 확인 기간",
    date: "2027.03.02 – 03.08",
    type: "수강신청",
  },
  {
    id: "midterm",
    month: "04월",
    day: "19",
    name: "1학기 중간고사",
    date: "2027.04.19 – 04.23",
    type: "학사일정",
  },
]

export const preassignmentNotices = [
  {
    id: "capstone-assignment",
    title: "캡스톤디자인 1 직권배정",
    courseId: "SWE4001",
    department: "소프트웨어학과",
    eligibility: "소프트웨어학과 4학년 진급 예정자 (시연 조건)",
    eligibilityKnown: true,
    period: "2027.02.09 09:00 – 02.12 17:00 (KST)",
    method: "학과 공지에 안내된 양식을 제출하는 예시입니다.",
  },
  {
    id: "cloud-assignment",
    title: "클라우드컴퓨팅 직권배정",
    courseId: "SWE4006",
    department: "소프트웨어학과",
    eligibility: "학과 공지에서 대상과 정원 확인이 필요합니다.",
    eligibilityKnown: false,
    period: null,
    method: "지원 절차 확인 필요",
  },
] as const

export const bootcamp = {
  name: "AI 실무 부트캠프",
  activity: "팀 실습 프로젝트 발표",
  scholarship: "장학 대상 학기와 지급 조건이 확인되지 않았습니다.",
}

export const programs = [
  {
    name: "인공지능 마이크로디그리",
    label: "마이크로디그리",
    ids: ["SWE2015", "SWE3001", "SWE3024", "SWE3031"],
    description:
      "인공지능의 기초부터 기계학습까지 이어지는 소프트웨어 특화 과정입니다.",
  },
  {
    name: "데이터사이언스 트랙",
    label: "전공트랙",
    ids: ["MAT2002", "SWE3004", "SWE3031"],
    description: "데이터 처리와 분석에 필요한 기초 역량을 쌓는 과정입니다.",
  },
  {
    name: "클라우드·인프라 트랙",
    label: "전공트랙",
    ids: ["SWE3011", "SWE3021", "SWE4006"],
    description: "운영체제, 네트워크, 클라우드 시스템을 학습합니다.",
  },
]
