"""Unit Tests for Red/Yellow/Green Risk and Impact Classifier."""
import pytest
from app.analysis.risk_classifier import RiskClassifier
from app.analysis.severity import RiskSeverity


def test_red_classification_high_risk():
    classifier = RiskClassifier()
    sentence = "Employees who fail to complete mandatory security training may lose system access."
    res = classifier.classify_sentence(sentence)
    assert res["severity"] == RiskSeverity.RED.value
    assert res["category"] == "Security"
    assert res["confidence"] >= 0.70
    assert "loss of system access" in res["reason"].lower() or "revocation" in res["reason"].lower()


def test_yellow_classification_warning():
    classifier = RiskClassifier()
    sentence = "Processing expense claims may take up to five business days."
    res = classifier.classify_sentence(sentence)
    assert res["severity"] == RiskSeverity.YELLOW.value
    assert res["confidence"] >= 0.60
    assert "delay" in res["reason"].lower() or "workflow" in res["reason"].lower()


def test_green_classification_benefit():
    classifier = RiskClassifier()
    sentence = "Employees receive additional cybersecurity training and certification bonuses."
    res = classifier.classify_sentence(sentence)
    assert res["severity"] == RiskSeverity.GREEN.value
    assert res["confidence"] >= 0.65
    assert "benefit" in res["reason"].lower() or "training" in res["reason"].lower() or "security" in res["reason"].lower()


def test_neutral_statement_not_overclassified():
    classifier = RiskClassifier()
    sentence = "The quarterly executive meeting is scheduled for room 302 on Thursday afternoon."
    res = classifier.classify_sentence(sentence)
    assert res["severity"] == RiskSeverity.NEUTRAL.value
