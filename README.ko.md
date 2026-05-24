<p align="center">
  <img src=".github/assets/hero.gif" alt="Tink Hero Banner" width="100%">
</p>

<h1>
  <strong>Tink</strong>
</h1>

<p>사람과 함께 일하며 함께 자라는 하네스</p>

<p>
  Tink는 작업에 맞는 하네스를 고르고, 작업에 맞는 하네스를 만들기도 하며, 하네스를 개선 및 제거도 합니다.
</p>

<p>
  <em>Tink는 <strong>knit(뜨개질)</strong>을 거꾸로 한 이름입니다. 엉킨 작업 흐름을 풀고, 더 나은 흐름으로 다시 뜨개질해 묶어준다는 뜻입니다. 동시에 곁에 있는 작은 조력자 팅커벨에 대한 오마주이기도 합니다.</em>
</p>

<p>
  <a href="https://github.com/dotoricode/tink-harness/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/dotoricode/tink-harness/ci.yml?branch=main&label=ci" alt="CI"></a>
  <a href="https://github.com/dotoricode/tink-harness/blob/main/LICENSE"><img src="https://img.shields.io/github/license/dotoricode/tink-harness" alt="License"></a>
  <a href="https://github.com/dotoricode/tink-harness/stargazers"><img src="https://img.shields.io/github/stars/dotoricode/tink-harness?style=social" alt="GitHub stars"></a>
</p>

[English](README.md) · **한국어**

---

## 왜 만들었나

요즘 새로운 AI 하네스가 거의 매일 등장합니다. 그중 상당수는 저에게 정말 유용했습니다.

처음에는 하나씩 써보면서 저에게 맞는 것만 남겼습니다. 그런데 여러 개를 섞을수록 환경이 점점 엉켜갔습니다. 매번 처음부터 다시 정리하기가 지쳐서, 결국 제가 이해하고 통제할 수 있는 skill 기반 흐름으로 돌아갔습니다.

그 뒤로 한동안 Hermes Agent를 썼습니다. 그때 마음에 남은 것은, 쓸수록 시스템이 나아진다는 점이었습니다. 반복되는 작업이 다시 쓸 수 있는 skill이 되고, 실수가 기억이 되며, 시스템이 사용하는 사람에게 천천히 맞춰져 갔습니다.

Tink는 단순한 질문에서 시작됐습니다:

> Claude Code나 Codex도 저와 함께 이렇게 자랄 수 있을까요?

큰 프레임워크를 더 얹지 않고도, 에이전트를 더 늘리지 않고도. 그저 Claude나 Codex가 지금 작업에 맞는 하네스를 고르고, 맞는 게 없으면 새로 만들고, 시간이 지나며 그 모음을 더 좋게 다듬도록 돕는 방식으로요.

## 설치

Claude Code 플러그인 설치:

```text
/plugin marketplace add dotoricode/tink-harness
```

```text
/plugin install tink@tink-harness
```

```text
/reload-plugins
```

```text
/tink:setup
```

독립형(Standalone) 호환 설치 프로그램:

```bash
npx github:dotoricode/tink-harness install
```

독립형 설치 프로그램은 `LANG` 환경 변수를 자동으로 감지합니다(감지 실패 시 영어 기본값). 강제로 지정하려면 `--lang=en|ko|zh`를 넘기세요.

## 업데이트

Claude Code 플러그인 사용자:

```text
/plugin marketplace update tink-harness
```

```text
/plugin update tink@tink-harness
```

```text
/reload-plugins
```

업데이트 명령으로 최신 버전을 찾지 못하면, 제거 후 다시 설치하세요:

```text
/plugin uninstall tink@tink-harness
```

```text
/plugin install tink@tink-harness
```

기존 독립형 설치를 업데이트하려면(사용자 수정 파일은 유지됩니다):

```bash
npx github:dotoricode/tink-harness update
```

## 명령

Tink는 명령 체계를 최소한으로 유지합니다.

Tink는 플러그인 우선 구조이며, 모든 명령은 `tink` 네임스페이스를 사용합니다. 따라서 공개되는 명령은 `/tink:*`로 한정되고 일반 명령과의 충돌을 피할 수 있습니다.

### `/tink:cast`

**cast**는 뜨개질에서 첫 코를 잡는 동작입니다. 모든 작업의 시작점이 됩니다.

Tink에서 `cast`는 기본 실행 흐름입니다. 작업을 읽고, 적절한 하네스를 선택하거나 초안을 만들고, 짧은 내부 검토를 거친 뒤 `.tink/current/`에 현재 작업 상태를 구성합니다. 이후 사용자 승인을 받고 안전한 첫 단계를 실행합니다.

단순한 질의응답을 넘어서는 작업이라면 보통 `cast`로 시작합니다.

### `/tink:frog`

**frog**는 잘못 뜬 부분을 풀어내는 뜨개질 용어입니다. 실을 푸는 소리인 "rip it, rip it"에서 이름이 왔습니다.

Tink에서 `frog`는:

- 더 이상 사용하지 않는 하네스
- 다른 하네스와 역할이 겹치는 항목
- 범위가 지나치게 넓은 하네스
- 유지 비용 대비 효율이 낮은 하네스

를 찾아 정리를 제안합니다.

삭제는 항상 사용자 승인 이후에만 수행됩니다.

하네스 구성이 복잡하거나 정리가 필요할 때 사용합니다.

### `/tink:weave`

**weave**는 뜨개질을 마친 뒤 남은 실을 안쪽으로 정리해 마감하는 과정(**weave in**)에서 따온 이름입니다.

Tink에서 `weave`는 실제 사용 기록, 실패 사례, 사용자 수정 내용을 바탕으로 기존 하네스를 다듬습니다.

목표는 다음 실행이:

- 더 명확하고
- 더 안전하며
- 더 검증 가능하도록

개선하는 것입니다.

하네스가 거의 맞지만 조금씩 어긋나기 시작할 때 사용합니다.

### 기타 명령

- `/tink:setup`
  - 언어, 설치 범위, Git 추적, Hook 정책을 설정합니다.

- `/tink:list`
  - 사용 가능한 하네스와 최근 사용 내역을 확인합니다.

- `/tink:update`
  - 설치 경로를 감지하고 안전한 업데이트 방법을 안내합니다.

## 동작 방식

Tink는 사용자가 직접 확인할 수 있는 파일 구조를 사용합니다.

- `.tink/harnesses/`
  - 재사용 가능한 작업 하네스

- `.tink/current/`
  - 현재 실행 상태

- `.tink/runs/`
  - 완료·중단·취소·교체된 실행 기록

- `.tink/memory/`
  - 승인된 실수, 선호 설정, 작업 중 얻은 교훈

가장 중요한 원칙은 **승인(approval)** 입니다.

Tink는:

- 하네스 생성
- 메모리 저장
- 정리 작업
- 개선 제안

을 수행할 수 있지만, 실제 적용 전에는 항상 사용자 확인을 거칩니다.

실행 전에는 짧은 점검 단계를 수행하며, 중요한 변경이 있을 때만 별도 제안을 표시합니다.

위험이 낮은 작업은 기록된 가정을 바탕으로 계속 진행할 수 있습니다. 하지만:

- 공개
- 배포
- 삭제
- 대규모 수정
- 되돌리기 어려운 변경

처럼 외부 영향이 큰 작업은 반드시 명시적 승인이 필요합니다.

또한:

- 새 하네스
- 메모리 항목
- `.claude/` 워크플로 파일

같은 재사용 가능한 자산을 저장할 때는 항상 별도의 승인을 다시 받습니다.

현재 실행을 승인했다고 해서, 이후 설치나 영구 저장까지 자동으로 승인되는 것은 아닙니다.

## Tink가 하지 않는 것

Tink는 다음을 목표로 하지 않습니다.

- 코딩 에이전트
- 워크플로 엔진
- 멀티 에이전트 런타임
- 프롬프트 라이브러리
- Claude Code나 Codex 대체 도구

Tink는 Claude Code나 Codex 위에 얹는 작은 하네스 레이어입니다.

## 라이선스

MIT
