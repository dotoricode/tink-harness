# Notes

## Starting Point

- Phase 3 verify runner contract exists.
- Verification evidence is written to `.tink/current/verification.json`.

## Verification Summary

- result: pass
- checked: npm test; command/template sync; schema shape
- problems: none
- remaining: none
- last_safe_point: all required verification passed
- next_action: report verification evidence in the final answer
- evidence: `.tink/current/verification.json`

## Verification Failure Summary

- result: fail
- checked: npm test
- problems: test suite failed with exit code 1
- remaining: fix the failing test target
- last_safe_point: changes are not ready to call done
- next_action: fix the failing check and rerun `$tink:verify`
- evidence: `.tink/current/verification.json`

## Verification Blocked Summary

- result: blocked
- checked: external dashboard review; macOS smoke note
- problems: external dashboard review could not be inspected
- remaining: provide the dashboard evidence or mark the check out of scope
- last_safe_point: verification is incomplete
- next_action: unblock the required manual check before marking the run done
- evidence: `.tink/current/verification.json`
