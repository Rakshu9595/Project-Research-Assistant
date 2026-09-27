from difflib import SequenceMatcher


def calculate_answer_relevance(
    generated_answer,
    expected_answer
):
    """
    Calculate how similar the generated answer
    is to the expected answer.

    Returns a score between 0 and 1.
    """

    if not generated_answer or not expected_answer:
        return 0.0

    generated_answer = generated_answer.lower().strip()
    expected_answer = expected_answer.lower().strip()

    score = SequenceMatcher(
        None,
        generated_answer,
        expected_answer
    ).ratio()

    return round(score, 4)


def calculate_context_relevance(
    question,
    context
):
    """
    Calculate how relevant the retrieved context
    is to the question.

    Returns a score between 0 and 1.
    """

    if not question or not context:
        return 0.0

    question_words = set(
        question.lower().split()
    )

    if not question_words:
        return 0.0

    # Combine retrieved context
    context_text = ""

    for item in context:

        if isinstance(item, str):
            context_text += " " + item

        elif isinstance(item, dict):
            context_text += " " + str(
                item.get("content", "")
            )

    context_words = set(
        context_text.lower().split()
    )

    if not context_words:
        return 0.0

    # Find common words
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


def calculate_router_accuracy(
    predicted_routes,
    expected_routes
):
    """
    Calculate the percentage of correctly
    predicted routes.
    """

    if not predicted_routes or not expected_routes:
        return 0.0

    if len(predicted_routes) != len(expected_routes):
        raise ValueError(
            "Predicted and expected routes "
            "must have the same length."
        )

    correct = 0

    for predicted, expected in zip(
        predicted_routes,
        expected_routes
    ):

        if (
            predicted.lower().strip()
            == expected.lower().strip()
        ):
            correct += 1

    accuracy = (
        correct
        / len(expected_routes)
    ) * 100

    return round(accuracy, 2)


def calculate_average_score(scores):
    """
    Calculate the average of a list of scores.
    """

    if not scores:
        return 0.0

    average = sum(scores) / len(scores)

    return round(average, 4)