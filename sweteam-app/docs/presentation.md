# 성균로드 · Team 2 presentation

## Slide outline

1. **Problem.** Students need to connect course prerequisites, registration deadlines, and graduation criteria before making academic decisions.
2. **Scope.** The SRS describes the intended product; the Figma design guides key screens. This prototype uses one synthetic student and does not connect to or change GLS.
3. **Demo: notices and planning.** Track a mock pre-assignment notice, then use the weekly calendar to spot and defer a conflict.
4. **Demo: consequences.** Moving Software Engineering delays both capstone courses. Preview the impact of withdrawing from an enrolled prerequisite without modifying the saved plan.
5. **Demo: trust in the result.** Explain the 87/99/96 credit breakdown and why missing certification evidence produces Unknown rather than graduation approval.
6. **Verification and remaining scope.** Show the scenario regression tests and acceptance matrix. Call out the missing verified policy engine, real integrations, and full coverage across student profiles.

## Live demo script

| Time      | Action                                                                                                                  | Point to make                                                                                                                           |
| --------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 0:00–0:30 | Open the dashboard after resetting in **학적 기록**.                                                                    | “This is a synthetic 2024 cohort student. The mock record and the editable plan are separate.”                                          |
| 0:30–1:10 | In **직권배정**, set a reminder and mark the capstone notice as applied. Point out the other notice’s unknown deadline. | “These are local tracking controls. Nothing is submitted or sent.”                                                                      |
| 1:10–2:10 | In **학기 플래너**, add **웹프로그래밍** and click **다음 학기로 미뤄 보기**.                                           | “Two classes share the same slot. The rejected one appears only in the What-if scenario.”                                               |
| 2:10–3:00 | Move **소프트웨어공학** to **2027년 2학기** using its selector.                                                         | “Moving a prerequisite too late can block more than one future course.”                                                                 |
| 3:00–3:45 | In **학적 기록**, open withdrawal impact on **소프트웨어설계실습**.                                                     | “The preview changes the displayed load and blocked courses, not the actual fixture record or saved plan.”                              |
| 3:45–4:45 | Add **기계학습** without **인공지능**, then open **졸업 진단**.                                                         | “87 is earned, 99 assumes all planned credits count, and we project only 96. 3품인증 is Unknown, so this is not a graduation decision.” |

Use the semester selector as the reliable alternative to pointer drag. If presenting without a live browser, capture screenshots from the synthetic reset state only. The [traceability matrix](acceptance.md) explains which acceptance cases the demo can support.
