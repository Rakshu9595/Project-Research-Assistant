import time

from rag.rag_pipeline import run_rag_pipeline

from evaluation.metrics import (
    calculate_answer_relevance,
    calculate_context_relevance,
)


def evaluate_single_question(question, expected_answer):
    """
    Evaluate the RAG system for one question.
    """

    try:
        # Start timer
        start_time = time.time()

        # Run the RAG pipeline
        result = run_rag_pipeline(question)

        # Get generated answer
        answer = result.get("answer", "")

        # Get retrieved context
        context = result.get("context", [])

        # Calculate answer relevance
        answer_score = calculate_answer_relevance(
            answer,
            expected_answer
        )

        # Calculate context relevance
        context_score = calculate_context_relevance(
            question,
            context
        )

        # Calculate response time
        response_time = time.time() - start_time

        return {
            "question": question,
            "generated_answer": answer,
            "expected_answer": expected_answer,
            "answer_relevance_score": answer_score,
            "context_relevance_score": context_score,
            "response_time": response_time
        }

    except Exception as error:

        print(
            "❌ RAG Evaluation Error:",
            error
        )

        return {
            "question": question,
            "error": str(error)
        }


def evaluate_rag_dataset(dataset):
    """
    Evaluate the RAG system using multiple questions.
    """

    results = []

    for item in dataset:

        result = evaluate_single_question(
            question=item["question"],
            expected_answer=item["answer"]
        )

        results.append(result)

    return results


def print_evaluation_report(results):
    """
    Print a simple RAG evaluation report.
    """

    print("\n====== RAG Evaluation Report ======\n")

    # Total number of questions
    total_questions = len(results)

    print(
        "Total Questions:",
        total_questions
    )

    # Select successful evaluations
    successful = [
        result
        for result in results
        if "error" not in result
    ]

    print(
        "Successful:",
        len(successful)
    )

    # Calculate average scores
    if successful:

        avg_answer_score = (
            sum(
                result["answer_relevance_score"]
                for result in successful
            )
            / len(successful)
        )

        avg_context_score = (
            sum(
                result["context_relevance_score"]
                for result in successful
            )
            / len(successful)
        )

        avg_response_time = (
            sum(
                result["response_time"]
                for result in successful
            )
            / len(successful)
        )

        print(
            "Average Answer Score:",
            round(avg_answer_score, 2)
        )

        print(
            "Average Context Score:",
            round(avg_context_score, 2)
        )

        print(
            "Average Response Time:",
            round(avg_response_time, 2),
            "seconds"
        )

    print("\n===================================")