import re

from llm.llm_client import generate_response


CLASSIFIER_SYSTEM_PROMPT = """
You are a question classification assistant
for a Project Research Assistant application.

Your task is to classify the user's question
into exactly one of the following categories:

1. rag
2. general
3. research

CATEGORY RULES:

rag:
- Questions about uploaded project reports.
- Questions asking about project objectives.
- Questions about methodologies in documents.
- Questions about technologies mentioned in reports.
- Questions asking for summaries of uploaded files.
- Questions about project architecture or results
  described in the uploaded documents.

general:
- General knowledge questions.
- Questions asking for definitions or explanations.
- Questions not specifically referring to
  uploaded project documents.
- Questions about programming, AI, ML,
  or other general technical concepts.

research:
- Questions asking for research papers.
- Questions asking for academic references.
- Questions asking for related studies.
- Questions asking for journal articles.
- Questions asking for literature review sources.
- Questions asking for scholarly publications.

IMPORTANT RULES:

1. Return only one category.
2. Do not provide explanations.
3. Do not generate an answer.
4. Do not return multiple categories.
5. Use only lowercase letters.
6. Research paper requests have priority.
7. Explicit document-related questions
   should be classified as rag.

VALID OUTPUT:

rag
general
research
"""


def validate_question(question):
    """
    Validate the user's question.
    """

    if not isinstance(question, str):
        raise ValueError(
            "Question must be a string."
        )

    question = question.strip()

    if not question:
        raise ValueError(
            "Question cannot be empty."
        )

    return question


def classify_by_keywords(question):
    """
    Classify questions using simple keywords.

    Returns:
        rag, general, research or None
    """

    question_lower = question.lower()

    research_patterns = [
        r"\bresearch papers?\b",
        r"\bacademic papers?\b",
        r"\bjournal articles?\b",
        r"\bscholarly articles?\b",
        r"\brelated studies\b",
        r"\bliterature review\b",
        r"\bscientific publications?\b",
        r"\bacademic references?\b",
        r"\bfind papers?\b",
        r"\brecommend papers?\b",
        r"\bpublished studies\b",
    ]

    rag_patterns = [
        r"\bmy project\b",
        r"\bour project\b",
        r"\bmy report\b",
        r"\bour report\b",
        r"\buploaded document\b",
        r"\buploaded file\b",
        r"\baccording to the document\b",
        r"\baccording to the report\b",
        r"\bin the document\b",
        r"\bin the report\b",
        r"\bfrom the pdf\b",
        r"\bfrom the ppt\b",
        r"\bfrom the docx\b",
        r"\bsummarize my document\b",
        r"\bsummarize my report\b",
    ]

    # Research requests have first priority.

    for pattern in research_patterns:

        if re.search(pattern, question_lower):
            return "research"

    # Check document-related questions.

    for pattern in rag_patterns:

        if re.search(pattern, question_lower):
            return "rag"

    # Use LLM for unclear questions.

    return None


def classify_with_llm(question):
    """
    Use Gemini to classify a question
    when keyword classification is unclear.
    """

    try:

        prompt = f"""
Classify the following user question.

Question:
{question}

Return exactly one category:

rag
general
research
"""

        response = generate_response(
            system_prompt=CLASSIFIER_SYSTEM_PROMPT,
            user_prompt=prompt
        )

        if not response:
            raise ValueError(
                "LLM returned an empty classification."
            )

        predicted_class = (
            response.strip().lower()
        )

        # Remove possible formatting.

        predicted_class = (
            predicted_class
            .replace("`", "")
            .replace("*", "")
            .strip()
        )

        valid_classes = [
            "rag",
            "general",
            "research"
        ]

        if predicted_class in valid_classes:
            return predicted_class

        raise ValueError(
            f"Invalid classification: {predicted_class}"
        )

    except Exception as error:

        print(
            "❌ LLM Classification Error:",
            error
        )

        raise Exception(
            f"Failed to classify question: {str(error)}"
        )


def classify_question(question):
    """
    Main function for classifying
    the user's question.

    Returns:
        rag, general or research
    """

    try:

        # Step 1: Validate question.

        question = validate_question(
            question
        )

        # Step 2: Try keyword classification.

        keyword_result = classify_by_keywords(
            question
        )

        if keyword_result is not None:
            return keyword_result

        # Step 3: Use Gemini for unclear questions.

        llm_result = classify_with_llm(
            question
        )

        return llm_result

    except Exception as error:

        print(
            "❌ Question Classification Error:",
            error
        )

        raise Exception(
            f"Question classification failed: {str(error)}"
        )