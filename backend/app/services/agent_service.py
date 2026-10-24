"""
Agent controller: routes learning tasks to the appropriate Gemini service.
Acts as the central orchestrator — never executes arbitrary code.
"""
from typing import Any, Optional
from app.services import gemini_service


class StudyAgent:
    """Routes educational tasks to appropriate tools."""

    def answer_question(self, message: str, history: list[dict] | None = None) -> str:
        """Route a general academic question to the chat tool."""
        cleaned_history = self._validate_history(history)
        return gemini_service.chat(message, cleaned_history)

    def create_notes(self, topic: str, subject: str, difficulty: str, length: str) -> str:
        """Route a note generation task."""
        return gemini_service.generate_notes(topic, subject, difficulty, length)

    def create_quiz(self, topic: str, subject: str, num_questions: int) -> list[dict]:
        """Route a quiz generation task and return validated question list."""
        return gemini_service.generate_quiz(topic, subject, num_questions)

    def create_study_plan(
        self, subjects: list[str], exam_date: str, hours_per_day: float, topics: str
    ) -> str:
        """Route a study plan generation task."""
        return gemini_service.generate_plan(subjects, exam_date, hours_per_day, topics)

    def answer_from_document(self, question: str, context_chunks: list[str]) -> str:
        """Route a document-based question to the retrieval-augmented tool."""
        return gemini_service.answer_from_document(question, context_chunks)

    def _validate_history(self, history: Any) -> list[dict]:
        if not history:
            return []
        if not isinstance(history, list):
            return []
        validated = []
        for item in history[:20]:
            if isinstance(item, dict) and "role" in item and "content" in item:
                role = str(item["role"])
                content = str(item["content"])[:8000]
                if role in ("user", "assistant"):
                    validated.append({"role": role, "content": content})
        return validated


# Singleton
agent = StudyAgent()
