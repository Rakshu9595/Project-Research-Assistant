import time

from router.answer_router import route_question


def evaluate_single_question(question, expected_route):
    """
    Evaluate the router for one question.
    """

    try:
        # Start timer
        start_time = time.time()

        # Get the route predicted by the router
        result = route_question(question)

        # Get predicted route
        if isinstance(result, dict):
            predicted_route = result.get("route", "")
        else:
            predicted_route = result

        # Calculate response time
        response_time = time.time() - start_time

        # Check whether prediction is correct
        is_correct = (
            predicted_route.lower()
            == expected_route.lower()
        )

        return {
            "question": question,
            "expected_route": expected_route,
            "predicted_route": predicted_route,
            "correct": is_correct,
            "response_time": response_time
        }

    except Exception as error:

        print(
            "❌ Router Evaluation Error:",
            error
        )

        return {
            "question": question,
            "expected_route": expected_route,
            "error": str(error)
        }


def evaluate_router_dataset(dataset):
    """
    Evaluate the router using multiple questions.
    """

    results = []

    for item in dataset:

        result = evaluate_single_question(
            question=item["question"],
            expected_route=item["expected_route"]
        )

        results.append(result)

    return results


def calculate_router_accuracy(results):
    """
    Calculate router accuracy.
    """

    successful = [
        result
        for result in results
        if "error" not in result
    ]

    if not successful:
        return 0.0

    correct_predictions = sum(
        1
        for result in successful
        if result["correct"]
    )

    accuracy = (
        correct_predictions
        / len(successful)
    ) * 100

    return accuracy


def print_router_evaluation_report(results):
    """
    Print the router evaluation report.
    """

    print("\n====== Router Evaluation Report ======\n")

    total_questions = len(results)

    successful = [
        result
        for result in results
        if "error" not in result
    ]

    print(
        "Total Questions:",
        total_questions
    )

    print(
        "Successfully Evaluated:",
        len(successful)
    )

    # Calculate accuracy
    accuracy = calculate_router_accuracy(
        results
    )

    print(
        "Router Accuracy:",
        round(accuracy, 2),
        "%"
    )

    # Calculate average response time
    if successful:

        average_time = (
            sum(
                result["response_time"]
                for result in successful
            )
            / len(successful)
        )

        print(
            "Average Response Time:",
            round(average_time, 2),
            "seconds"
        )

    print("\n======================================")