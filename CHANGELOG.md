# Changelog

All notable changes to Tink are tracked here.

Tink is pre-v1. Expect small, reviewable changes until the v1.0.0 hardening gates pass.

## [0.1.3] - 2026-05-22

### Changed

- Replaced the remote README hero image with a repository asset.
- Increased the top command contrast so it remains readable on dark terminal backgrounds.


## [0.1.2] - 2026-05-22

### Changed

- Added a synthesis probe so `/tink:forge` can detect when a built-in harness is only a generic fit.
- Made run-only draft harnesses the default path for generic-fit cases, with saving still requiring separate approval.
- Clarified that `harness-synthesis` should handle both `no fit` and `generic fit` cases.

## [0.1.1] - 2026-05-22

### Added

- Existing-user update instructions for Claude Code plugin installs.
- Standalone compatibility installer refresh command using `--force`.
- Maintenance evidence structure: approval ledger and hone queue templates.
- Run record fields for selected, rejected, actually loaded, and maintenance evidence.

### Changed

- Bumped the Claude Code plugin version to make `/plugin update` detect the latest release.
- Clarified `unknown` evidence handling for `/tink:list`.
- Added evidence grades for `/tink:purge` and evidence handles for `/tink:hone`.

## [0.1.0] - 2026-05-22

### Added

- Initial pre-v1 plugin shape for Tink.
- Plugin-first `/tink:*` command surface.
- Standalone compatibility installer.
- Built-in harnesses, setup flow, optional hook recommendation, and visible `.tink/` state model.
