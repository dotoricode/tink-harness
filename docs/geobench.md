# GEO Benchmark For Tink

This repository includes a [`geobench`](https://github.com/NomaDamas/geobench) product spec for measuring LLM answer visibility: hit rate, MRR, share of voice, citation rate/share, and confidence intervals.

Product spec: [`geobench/tink-harness.yaml`](../geobench/tink-harness.yaml)

## Run

Use a local checkout or install of `geobench`; do not commit `.env`, raw run logs, or provider responses.

```bash
/path/to/geobench/dist/geobench estimate --product geobench/tink-harness.yaml --providers openai --tier cheap
/path/to/geobench/dist/geobench profile geobench/tink-harness.yaml
/path/to/geobench/dist/geobench bench --product geobench/tink-harness.yaml --providers openai --tier cheap --mode benchmark
```

To inspect results locally:

```bash
/path/to/geobench/dist/geobench dash
```

## Publishing Boundary

Publish aggregate metrics only. Do not publish raw provider answers, secrets, private run logs, or `.env` values. When citing results, include the run date, provider set, tier, query count, and whether the spec was profiled before the run.

## Korean Summary

이 repo에는 Tink의 LLM 답변 노출도를 측정하기 위한 geobench 제품 스펙이 포함되어 있습니다. 실행 결과를 공개할 때는 hit rate, MRR, share of voice, citation rate/share 같은 집계 지표만 공개하고, 원문 provider 답변·시크릿·개인 실행 로그는 공개하지 않습니다.
