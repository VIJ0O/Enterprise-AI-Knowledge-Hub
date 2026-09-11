"""Unit Tests for Vector, BM25, Fusion, and Reranking."""
import pytest
from app.retrieval.bm25 import BM25Index
from app.retrieval.fusion import reciprocal_rank_fusion
from app.retrieval.reranker import BGEReranker


def test_bm25_index_and_search():
    index = BM25Index()
    chunks = [
        {"chunk_id": "c1", "text": "Employees who fail security training will lose system access.", "department": "Security", "access_level": "public"},
        {"chunk_id": "c2", "text": "Finance reimbursement processing takes 5 business days.", "department": "Finance", "access_level": "public"},
        {"chunk_id": "c3", "text": "Annual leave allocation is 24 days per year.", "department": "HR", "access_level": "internal"},
    ]
    index.add_chunks(chunks)

    # Search security
    results = index.search(query="security training system access", limit=2)
    assert len(results) > 0
    assert results[0]["chunk_id"] == "c1"

    # Search with department filter
    hr_results = index.search(query="leave allocation", allowed_departments=["HR"])
    assert len(hr_results) > 0
    assert hr_results[0]["department"] == "HR"


def test_reciprocal_rank_fusion():
    list1 = [
        {"chunk_id": "c1", "score": 0.95, "retrieval_type": "vector"},
        {"chunk_id": "c2", "score": 0.80, "retrieval_type": "vector"},
    ]
    list2 = [
        {"chunk_id": "c2", "score": 12.5, "retrieval_type": "bm25"},
        {"chunk_id": "c1", "score": 8.0, "retrieval_type": "bm25"},
    ]

    fused = reciprocal_rank_fusion([list1, list2], k=60)
    assert len(fused) == 2
    assert "fused_score" in fused[0]
    assert fused[0]["fused_score"] > 0.0


def test_bge_reranker():
    reranker = BGEReranker()
    query = "What happens if I miss mandatory training?"
    chunks = [
        {"chunk_id": "c1", "text": "The company cafeteria is open between 12 PM and 2 PM.", "fused_score": 0.01},
        {"chunk_id": "c2", "text": "Employees who fail to complete mandatory security training may lose system access.", "fused_score": 0.03}
    ]

    reranked = reranker.rerank(query, chunks, top_n=2)
    assert len(reranked) == 2
    assert reranked[0]["chunk_id"] == "c2"
    assert "reranker_score" in reranked[0]
