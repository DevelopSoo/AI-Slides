# 강사 노트 보관: 임베딩 모델 (Part 2 · 단원 2)

슬라이드에 넣기엔 분량이 많아 보관해 둔 내용. 나중에 강사 발표 스크립트(노트)를 만들 때 **33장 「임베딩 모델」** 설명에 붙인다.
정보는 2026년 10월에 공식 출처로 확인한 것이다. 쓰기 전에 순위·모델 사양이 바뀌었는지 다시 확인한다.

---

## 1. 임베딩 모델이란?

- 하는 일은 하나: **글을 받아서, 뜻을 담은 숫자 목록(벡터)으로 바꾼다.**
  - 뜻이 비슷한 글은 숫자도 가깝다. "학교를 잠시 쉬고 싶다"와 "제12조 (휴학)"처럼 단어가 달라도 찾을 수 있는 이유.
  - 글 길이와 상관없이 숫자 개수는 모델마다 고정이다 (예시 모델은 항상 384개). 그래야 서로 비교할 수 있다. 단, 한 번에 넣을 수 있는 길이에는 한계가 있다.
- RAG에서 **두 번** 쓰인다.
  - 준비 단계(31장): 문서 조각마다 숫자 목록을 만들어 벡터 DB에 저장
  - 질문 단계(34장): 질문도 숫자 목록으로 바꿔, 저장된 것과 가까운 정도(유사도)를 비교
  - 두 번 모두 **반드시 같은 모델**. 모델을 바꾸면 기준이 달라져 비교가 안 되고, 문서를 전부 다시 임베딩해야 한다.
- **하지 않는 일**
  - 답 만들기 → LLM(Claude 등)이 한다.
  - 가까운 숫자 찾기 → 벡터 DB나 검색 코드가 한다.
  - 그래서 임베딩 모델과 LLM은 **따로 고른다.** (예: 답은 Claude, 임베딩은 Voyage AI나 무료 공개 모델. Anthropic은 자체 임베딩 모델이 없다.)
- 한 줄 정리: 임베딩 모델은 **검색용 번역기**. 책 페이지와 질문에 같은 기준으로 색인 번호를 매겨 주는 역할.

## 2. 어디서 찾을까? - MTEB 리더보드

- **MTEB**(Massive Text Embedding Benchmark): 여러 임베딩 모델을 같은 시험으로 채점한 성적표. Hugging Face에 리더보드가 있다.
- **언어마다 성적표가 따로 있다.** 한국어는 `MTEB(kor, v2)`
  - 시험 20개, 시험 종류 6가지: 분류 · 군집 · 문장쌍 분류(NLI) · 재정렬 · **검색(Retr.)** · 문장 유사도
  - 검색 시험에는 법률(LawIRKo), 공공 보건 Q&A, AutoRAG 등 실제 RAG와 비슷한 데이터가 들어 있다.
- 표에서 보는 열: 순위, 모델, 크기(Parameters), 공개 정도(Openness), 평균 점수, 시험 종류별 점수
  - **RAG라면 전체 평균보다 '검색(Retr.)' 점수를 본다.**
- 오른쪽 필터로 후보를 좁힌다: 공개 모델 / 유료 API 모델, 모델 크기, Sentence-Transformers 호환 여부 등
- 2026년 10월 한국어 상위권 예: Qwen3-Embedding(8B·4B), F2LLM-v2, 한국어에 맞춰 다시 학습한 모델(nlpai-lab/KURE-v1, dragonkue/BGE-m3-ko, nlpai-lab/KoE5). **순위는 계속 바뀐다.**
- 유료 API 모델(OpenAI, Voyage AI 등)은 각 회사 공식 문서에서 사양과 요금을 확인한다.

## 3. 어떻게 고를까? - 기준 4가지 + 직접 시험

| 질문 | 볼 것 | 예 |
|---|---|---|
| 한국어를 잘 다루나? | 한국어 리더보드 점수, 지원 언어 | MiniLM 예시 모델은 50여 개 언어(한국어 포함), bge-m3는 100개 이상 |
| 내 조각 길이를 받을 수 있나? | 한 번에 넣는 길이 | MiniLM 128토큰(긴 조각은 잘림) / bge-m3·OpenAI 8,192토큰 / voyage-4 32,000토큰 |
| 문서를 밖으로 보내도 되나? | 실행 방식 | API = 문서가 회사 밖 서버로 전송됨 / 공개 모델 = 내 서버에서 실행. 학사 규정·사내 문서라면 가장 먼저 따질 기준 |
| 비용을 감당할 수 있나? | 숫자 개수, 모델 크기, 요금 | 숫자가 많을수록 저장 공간·계산 비용 ↑. API는 쓴 만큼 요금, 공개 모델은 무료지만 실행할 컴퓨터가 필요 |

- 마지막은 **직접 시험**: 리더보드 점수는 출발점일 뿐이다. 내 문서로 예상 질문(예: 10개)을 만들어, 정답 조각이 검색 상위 몇 개 안에 드는지 확인한다. → 단원 3(검색 품질)으로 연결.

## 참고: 33장 표의 모델 사양 (2026년 10월 확인)

| 모델 | 숫자 개수 | 실행 | 한 번에 넣는 길이 | 특징 |
|---|---|---|---|---|
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | 384 | 무료 공개(Apache 2.0) | 128토큰 | 50여 개 언어(한국어 포함), 약 0.1B로 가벼움 |
| OpenAI text-embedding-3-small | 1536 (줄여 쓰기 가능) | API, 토큰당 과금 | 8,192토큰 | 더 큰 -large는 3072개 |
| BAAI/bge-m3 | 1024 | 무료 공개(MIT) | 8,192토큰 | 100개 이상 언어 |
| Voyage AI voyage-4 | 1024 (256·512·2048 선택) | API, 토큰당 과금(계정마다 첫 2억 토큰 무료) | 32,000토큰 | 다국어, Claude 공식 문서가 소개하는 제공사 |

## 출처

- MTEB 리더보드 - Korean: https://mteb-leaderboard.hf.space/benchmark/MTEB(kor%2C%20v2)
- MTEB GitHub: https://github.com/embeddings-benchmark/mteb
- paraphrase-multilingual-MiniLM-L12-v2: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- Sentence Transformers 지원 언어 목록: https://www.sbert.net/docs/sentence_transformer/pretrained_models.html
- BAAI/bge-m3: https://huggingface.co/BAAI/bge-m3
- OpenAI 임베딩 문서: https://developers.openai.com/api/docs/guides/embeddings
- Voyage AI 임베딩 문서 / 요금: https://docs.voyageai.com/docs/embeddings , https://docs.voyageai.com/docs/pricing
- Claude 문서 - Embeddings: https://platform.claude.com/docs/en/build-with-claude/embeddings
