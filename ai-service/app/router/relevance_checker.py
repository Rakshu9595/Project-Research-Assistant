import re

from sentence_transformers import util

from embeddings.embedding_service import embedding_service


DEFAULT_RELEVANCE_THRESHOLD = 0.45


def clean_text(text):
    """
    Clean text before checking relevance.
    """

    if not text:
        return ""

    text = str(text).lower().strip()

    text = re.sub(
        r"\s+",
        " ",
        text
    )

    return text


def extract_context_text(context):
    """
    Extract text from retrieved documents.

    Supports:
    - List of strings
    - List of dictionaries
    - Single string
    """

    if not context:
        return []

    if isinstance(context, str):
        return [context.strip()] if context.strip() else []

    extracted_texts = []

    for item in context:

        if isinstance(item, str):

            text = item.strip()

        elif isinstance(item, dict):

            text = (
                item.get("content")
                or item.get("text")
                or ""
            )

            if not isinstance(text, str):
                text = str(text)

            text = text.strip()

        else:
            continue

        if text:
            extracted_texts.append(text)

    return extracted_texts


def calculate_keyword_relevance(question, context_text):
    """
    Calculate keyword overlap between
    the question and retrieved text.

    Returns a score between 0 and 1.
    """

    question = clean_text(question)

    context_text = clean_text(context_text)

    if not question or not context_text:
        return 0.0

    question_words = set(
        re.findall(
            r"\b\w+\b",
            question
        )
    )

    context_words = set(
        re.findall(
            r"\b\w+\b",
            context_text
        )
    )

    stop_words = {
        "what", "is", "are", "the",
        "a", "an", "of", "to",
        "in", "on", "for", "and",
        "or", "how", "why", "does",
        "do", "my", "our", "this",
        "that", "with", "from",
        "which", "explain", "describe"
    }

    question_words = (
        question_words - stop_words
    )

    context_words = (
        context_words - stop_words
    )

    if not question_words:
        return 0.0

    common_words = (
        question_words.intersection(
            context_words
        )
    )

    score = (
        len(common_words)
        / len(question_words)
    )

    return round(score, 4)


def calculate_semantic_relevance(question, context_text):
    """
    Calculate semantic similarity using
    sentence embeddings.

    Uses the same embedding model
    as the RAG pipeline.
    """

    try:

        if not question or not context_text:
            return 0.0

        question_embedding = (
            embedding_service.generate_embedding(
                question
            )
        )

        context_embedding = (
            embedding_service.generate_embedding(
                context_text
            )
        )

        similarity = util.cos_sim(
            question_embedding,
            context_embedding
        )

        score = float(
            similarity.item()
        )

        # Convert cosine similarity to a
        # non-negative relevance score.

        score = max(
            0.0,
            min(1.0, score)
        )

        return round(score, 4)

    except Exception as error:

        print(
            "❌ Semantic Relevance Error:",
            error
        )

        raise Exception(
            f"Failed to calculate semantic relevance: {str(error)}"
        )


def calculate_relevance_score(question, context_text):
    """
    Combine semantic similarity
    and keyword relevance.

    Semantic similarity weight = 80%
    Keyword relevance weight = 20%
    """

    semantic_score = (
        calculate_semantic_relevance(
            question,
            context_text
        )
    )

    keyword_score = (
        calculate_keyword_relevance(
            question,
            context_text
        )
    )

    final_score = (
        semantic_score * 0.80
        + keyword_score * 0.20
    )

    return round(
        final_score,
        4
    )


def get_relevance_details(
    question,
    context,
    threshold=DEFAULT_RELEVANCE_THRESHOLD
):
    """
    Check the relevance of retrieved
    document chunks individually.

    Returns detailed relevance results.
    """

    try:

        if not isinstance(question, str) or not question.strip():
            raise ValueError(
                "Question cannot be empty."
            )

        if not 0 <= threshold <= 1:
            raise ValueError(
                "Threshold must be between 0 and 1."
            )

        context_texts = extract_context_text(
            context
        )

        if not context_texts:

            return {
                "is_relevant": False,
                "relevance_score": 0.0,
                "threshold": threshold,
                "relevant_chunks": [],
                "total_chunks": 0
            }

        scored_chunks = []

        for text in context_texts:

            score = calculate_relevance_score(
                question,
                text
            )

            scored_chunks.append({
                "content": text,
                "relevance_score": score,
                "is_relevant": score >= threshold
            })

        scored_chunks.sort(
            key=lambda item: item["relevance_score"],
            reverse=True
        )

        best_score = scored_chunks[0][
            "relevance_score"
        ]

        relevant_chunks = [
            chunk
            for chunk in scored_chunks
            if chunk["is_relevant"]
        ]

        return {
            "is_relevant": best_score >= threshold,
            "relevance_score": best_score,
            "threshold": threshold,
            "relevant_chunks": relevant_chunks,
            "total_chunks": len(scored_chunks)
        }

    except Exception as error:

        print(
            "❌ Relevance Checking Error:",
            error
        )

        raise Exception(
            f"Failed to check relevance: {str(error)}"
        )


def check_relevance(
    question,
    context,
    threshold=DEFAULT_RELEVANCE_THRESHOLD
):
    """
    Main relevance checking function.

    Returns:
        True  -> Use RAG
        False -> Use General LLM fallback
    """

    result = get_relevance_details(
        question=question,
        context=context,
        threshold=threshold
    )

    return result["is_relevant"]