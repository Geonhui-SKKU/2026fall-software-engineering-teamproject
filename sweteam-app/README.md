# 성균로드 · Sungkyun Road

Korean-language academic planning prototype for SKKU’s Introduction to Software Engineering, Team 2. Built with React, Vite, shadcn/ui (Base UI), and ReUI. This is a **synthetic-data course project** under [SRS v1.01 §2.5 C-6](../srs_team2.pdf), not a university service.

- [Figma draft](https://www.figma.com/design/BD9ygCuaHEMSEoVWSHVyPq/?node-id=1-4)
- [Acceptance-case evidence and deferred scope](docs/acceptance.md)
- [Presentation outline and demo script](docs/presentation.md)

## Run and verify

Use Node.js **22.18+** (including Node.js 24) and npm.

```bash
npm ci
npm run lint
npm test
npm run build
npm run preview
```

Open the URL printed by Vite. For development, use `npm run dev` instead of `npm run preview`. `/#welcome` opens the optional demo intro.

## Start from a clean demo state

Open **학적 기록 → 데모 데이터 초기화 → 초기화 확인**. This only resets the app’s synthetic plan, reminder preferences, and application markers in the current browser. The dashboard should show **87 earned credits** and **3 planned courses**. No account or credential is required.

## Walkthrough

1. **직권배정:** Enable the reminder for **캡스톤디자인 1**, then mark it as applied. The reminder turns off and no application or notification is sent. The second notice has an unknown deadline.
2. **학기 플래너:** Try adding **웹프로그래밍**. Its slot overlaps **운영체제**. The calendar highlights both classes without saving the rejected candidate.
3. **What-if:** Select **다음 학기로 미뤄 보기**. The candidate appears in **2027년 2학기** only in the scenario. Move **소프트웨어공학** to the same semester via its selector to see prerequisite warnings on both capstone courses and the changed credit requirements.
4. **학적 기록 → 취소 영향 보기:** Preview withdrawal of enrolled **소프트웨어설계실습**. Both capstones are flagged; the current semester’s sample course load drops from **3 to 0**. No record or plan changes.
5. **졸업 진단:** First add **기계학습** in the planner without **인공지능**, then check **87 earned / 99 if all planned courses count / 96 projected after the first term**. The excluded course explains its missing prerequisite. **3품인증** remains **Unknown**. The downloadable report distinguishes these values.
6. **과목 로드맵 / 프로그램:** Select **인공지능** to see the prerequisite path, or inspect the AI bootcamp’s linked microdegree and unverified scholarship condition.

## Limits

The fixture covers one synthetic profile, one saved semester, and an in-memory three-semester What-if scenario. It does not connect to GLS, check official records or policies, send notifications, or submit academic transactions. Current enrollment is assumed completed before future semesters for prerequisite checks; those in-progress credits are excluded from the demonstrated forecast totals. Content is primarily Korean. Production performance, security, and WCAG conformance are not claimed.
