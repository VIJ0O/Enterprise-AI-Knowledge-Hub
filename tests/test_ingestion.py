"""Unit Tests for Ingestion Pipeline."""
import pytest
from app.ingestion.cleaner import TextCleaner
from app.ingestion.sentence_splitter import SentenceSplitter
from app.ingestion.chunker import SmartChunker
from app.ingestion.metadata import MetadataEnricher


def test_text_cleaner():
    cleaner = TextCleaner()
    raw_text = "This is a  test\x00 with “smart quotes” and \r\n multiple   spaces. Page 1 of 10"
    cleaned = cleaner.clean(raw_text)
    assert "smart quotes" in cleaned
    assert "\x00" not in cleaned
    assert "  " not in cleaned


def test_sentence_splitter_abbreviations():
    splitter = SentenceSplitter()
    text = "Dr. Smith visited the U.S. office at 10.5 AM. He reviewed Policy A. Then he left."
    spans = splitter.split_spans(text)
    sentences = [s["text"] for s in spans]
    assert len(sentences) >= 2
    assert any("Dr. Smith visited" in s for s in sentences)


def test_smart_chunker():
    chunker = SmartChunker()
    sample_text = (
        "# Security Policy\n"
        "Section 1: Access Control\n"
        "Employees who fail to complete mandatory security training may lose system access. " * 5
    )
    chunks = chunker.chunk_document_page(
        page_text=sample_text,
        page_number=1,
        document_id="doc_test_123",
        version="v1.0"
    )
    assert len(chunks) > 0
    assert chunks[0]["document_id"] == "doc_test_123"
    assert chunks[0]["page"] == 1
    assert "chunk_id" in chunks[0]


def test_metadata_enricher():
    enricher = MetadataEnricher()
    chunk = {"text": "Security compliance requirements under ISO 27001 standard."}
    enriched = enricher.add_access_metadata(
        chunk,
        doc={"department": "Security", "access_level": "confidential"},
        user=None
    )
    assert enriched["department"] == "Security"
    assert enriched["access_level"] == "confidential"
