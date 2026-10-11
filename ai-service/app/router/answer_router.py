from rag.rag_pipeline import run_rag_pipeline

from llm.fallback import generate_fallback_answer

from router.question_classifier import classify_question

from router.relevance_checker import check_relevance


def route_question(
    question,
    document_id=None,
    user_id=None
):
    """
    Route the user's question to the
    appropriate answering system.

    Available routes:

    1. RAG
    2. General LLM
    3. Research Paper Search
    """

    try:

        # Step 1: Validate the question

        if not question or not question.strip():
            raise ValueError(
                "Question cannot be empty."
            )

        question = question.strip()

        # Step 2: Classify the question

        question_type = classify_question(
            question
        )

        # Step 3: Handle research questions

        if question_type == "research":

            return {
                "route": "research",
                "question": question,
                "answer": (
                    "Research paper search is required "
                    "for this question."
                ),
                "sources": [],
                "document_id": document_id,
                "user_id": user_id
            }

        # Step 4: Handle general questions

        if question_type == "general":

            fallback_result = (
                generate_fallback_answer(
                    question
                )
            )

            return {
                "route": "general",
                "question": question,
                "answer": fallback_result.get(
                    "answer",
                    ""
                ),
                "sources": [],
                "document_id": document_id,
                "user_id": user_id
            }

        # Step 5: Handle document-related questions

        if question_type == "rag":

            rag_result = run_rag_pipeline(
                question
            )

            # Step 6: Check retrieved context relevance

            retrieved_context = rag_result.get(
                "context",
                []
            )

            is_relevant = check_relevance(
                question,
                retrieved_context
            )

            # Step 7: Return RAG answer if relevant

            if is_relevant:

                return {
                    "route": "rag",
                    "question": question,
                    "answer": rag_result.get(
                        "answer",
                        ""
                    ),
                    "sources": rag_result.get(
                        "sources",
                        []
                    ),
                    "document_id": document_id,
                    "user_id": user_id
                }

            # Step 8: Use General LLM fallback

            fallback_result = (
                generate_fallback_answer(
                    question
                )
            )

            return {
                "route": "general",
                "question": question,
                "answer": fallback_result.get(
                    "answer",
                    ""
                ),
                "sources": [],
                "is_fallback": True,
                "document_id": document_id,
                "user_id": user_id
            }

        # Step 9: Handle unknown classifications

        raise ValueError(
            f"Unsupported question type: {question_type}"
        )

    except Exception as error:

        print(
            "❌ Answer Router Error:",
            error
        )

        raise Exception(
            f"Failed to route question: {str(error)}"
        )