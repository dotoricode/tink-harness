---
description: Inspect available Tink harnesses and recent usage signals.
---

# /tink:list

List available Tink harnesses without loading every harness body.

## Procedure
1. Read `.tink/harnesses/index.json`.
2. Read only compact usage metadata from `.tink/runs/` (frontmatter `selected_harnesses` / `actually_loaded_harnesses` + dates), `.tink/maintenance/ledger.jsonl`, and `.tink/maintenance/weave-queue.json`. Do not load raw logs.
3. Treat `.tink/current/` as weak evidence unless it is clearly from the same active conversation. If context is uncertain, label it `stale current candidate`, not proof of usage.
4. Classify every harness into exactly one of three categories:
   - **working** — directly performs or gates tasks (e.g. `ship`, `pr-merge`, `requirements-interview`, `plan-consensus`, `goal-checkpoint`, `delegation-brief`). Generic work (code change, research, review, docs) runs on the base run without a harness, so it does not appear here.
   - **meta** — manages other harnesses or Tink itself. Treat these names as meta regardless of `kind`: `harness-synthesis`, `harness-curation`, `tink-feedback-apply`.
   - **custom (this repo)** — `kind: synthesized` in `index.json` (created in this repo, not part of the default set). If a synthesized harness also matches a meta name, prefer meta.
5. Compute the signal per harness:
   - 🟢 **active** — appears in any `.tink/runs/*.md` frontmatter or `.tink/maintenance/ledger.jsonl` entry.
   - ⚪ **unknown** — no run/ledger/memory evidence. Do not call it `quiet` or `candidate for purge` from the static index alone. Do not infer non-use from missing evidence.
6. Show all three categories every time, even when one is empty. For an empty category, render `_(아직 없음)_` (or the English equivalent if the project language is `en`) instead of an item list.
7. Do not output the `evidence` field. Usage is now compressed into `signal`.

## Output format

Always start with a header block that defines the fields and categories. Render each harness as a multi-line block — one field per line, never collapsed onto one line. Close with an assessment and command suggestions.

Use this exact skeleton (translate field labels and descriptions to the language in `.tink/config.json`):

````markdown
### 🧶 Tink 하네스 목록

> **필드 설명**
> - **purpose** — 이 하네스가 다루는 작업
> - **context** — Claude 컨텍스트 점유량
>   · `tiny` 아주 짧음  · `small` 보통 체크리스트  · `large` 별도 승인 후 읽는 큰 하네스
> - **last used** — 가장 최근 실행 날짜 (없으면 `미사용`)
> - **signal** — 🟢 `active` 사용 기록 있음  · ⚪ `unknown` 아직 사용 기록 없음
>
> **카테고리 설명**
> - **작업 하네스** — 실제 작업을 수행하거나 안전판 역할 (출시·인터뷰·목표 관리 등). 일반 코드 변경·리뷰·문서는 하네스 없이 기본 절차로 진행됩니다.
> - **메타 하네스** — 다른 하네스나 Tink 자체를 관리 (선택·합성·피드백 반영)
> - **이 저장소 전용** — 이 프로젝트에서 직접 만들어 저장된 하네스

---

#### 🛠️ 작업 하네스

##### `<name>`
- **purpose**: <one short sentence>
- **context**: <tiny | small | large>
- **last used**: <YYYY-MM-DD | 미사용>
- **signal**: 🟢 active | ⚪ unknown

#### 🧭 메타 하네스

##### `<name>`
- **purpose**: …
- **context**: …
- **last used**: …
- **signal**: …

(또는 비어 있으면)
_(아직 없음)_

#### 🔧 이 저장소 전용

##### `<name>`
- **purpose**: …
- **context**: …
- **last used**: …
- **signal**: …

(또는 비어 있으면)
_(아직 없음)_

---

### 📊 평가
- **가장 활발**: …
- **한 번도 안 쓴 하네스**: …
- **균형/주의점**: 한두 문장 평가.

### 💡 다음에 쓸 수 있는 명령
- `/tink:cast <작업 설명>` — 적절한 하네스를 골라 작업 시작
- `/tink:weave` — 자주 쓰는 하네스에 누적된 개선 사항 반영 (해당될 때만)
- `/tink:frog` — 오래 사용 안 된 하네스 정리 후보 검토 (실제 삭제는 별도 승인)
- `/tink:setup` — 언어·범위·훅 정책 등 Tink 설정 점검
````

## Assessment & command-suggestion rules
- The 평가 section must mention at least: the most-used harness, every harness with an `unknown` signal, and any obvious imbalance (e.g. meta harnesses all untouched).
- Always include `/tink:cast` and `/tink:setup` as default next steps.
- Only suggest `/tink:weave` when at least one active harness has user-correction evidence, repeated runs of the same category, or items queued in `.tink/maintenance/weave-queue.json`.
- Only suggest `/tink:frog` when at least one harness has been `unknown` for the entire visible history AND there is no plausible upcoming use. Frame it as "정리 후보 검토", not "삭제".

## Output style
Use bullets, not tables. One field per line per harness. Never collapse a harness into a single line.

## Do not
- Do not read every harness body by default.
- Do not infer non-use from missing evidence.
- Do not remove anything. Use `/tink:frog` for removal candidates.
- Do not output the `evidence` field.
- Do not hide a category because it has zero items — render `_(아직 없음)_` instead.
