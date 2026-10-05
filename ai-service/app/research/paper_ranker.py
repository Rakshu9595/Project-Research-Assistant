import re


def tokenize(text):
    """
    Convert text into a set of useful words.
    """

    if not text:
        return set()

    words = re.findall(
        r"\b[a-zA-Z0-9]+\b",
        text.lower()
    )

    # Remove very common words
    stop_words = {
        "the",
        "a",
        "an",
        "and",
        "or",
        "of",
        "to",
        "in",
        "on",
        "for",
        "with",
        "is",
        "are",
        "this",
        "that",
        "using",
        "based"
    }

    return {
        word
        for word in words
        if word not in stop_words
    }


def calculate_keyword_score(
    query,
    paper
):
    """
    Calculate how many query keywords
    appear in the paper title and abstract.
    """

    query_words = tokenize(query)

    if not query_words:
        return 0.0

    title = paper.get(
        "title",
        ""
    )

    abstract = paper.get(
        "abstract",
        ""
    )

    paper_words = tokenize(
        f"{title} {abstract}"
    )

    matching_words = (
        query_words.intersection(
            paper_words
        )
    )

    score = (
        len(matching_words)
        / len(query_words)
    )

    return score


def calculate_title_score(
    query,
    paper
):
    """
    Give a higher score when query keywords
    appear in the paper title.
    """

    query_words = tokenize(query)

    title_words = tokenize(
        paper.get(
            "title",
            ""
        )
    )

    if not query_words:
        return 0.0

    matching_words = (
        query_words.intersection(
            title_words
        )
    )

    return (
        len(matching_words)
        / len(query_words)
    )


def calculate_citation_score(paper):
    """
    Calculate a normalized score based on
    the number of citations.
    """

    citation_count = paper.get(
        "cited_by_count",
        0
    )

    if not citation_count:
        return 0.0

    # Avoid very large citation counts
    score = min(
        citation_count / 1000,
        1.0
    )

    return score


def calculate_recency_score(paper):
    """
    Calculate a score based on publication year.

    Newer papers receive a higher score.
    """

    publication_year = paper.get(
        "publication_year"
    )

    if not publication_year:
        return 0.0

    current_year = 2026

    age = current_year - publication_year

    if age <= 0:
        return 1.0

    if age >= 10:
        return 0.0

    return 1 - (
        age / 10
    )


def calculate_paper_score(
    query,
    paper
):
    """
    Calculate the final relevance score
    for a research paper.
    """

    keyword_score = (
        calculate_keyword_score(
            query,
            paper
        )
    )

    title_score = (
        calculate_title_score(
            query,
            paper
        )
    )

    citation_score = (
        calculate_citation_score(
            paper
        )
    )

    recency_score = (
        calculate_recency_score(
            paper
        )
    )

    # Weighted score
    final_score = (
        keyword_score * 0.50
        + title_score * 0.30
        + citation_score * 0.10
        + recency_score * 0.10
    )

    return round(
        final_score,
        4
    )


def rank_papers(
    query,
    papers,
    limit=10
):
    """
    Rank research papers according
    to their relevance to the query.
    """

    if not papers:
        return []

    ranked_papers = []

    for paper in papers:

        score = calculate_paper_score(
            query,
            paper
        )

        ranked_paper = paper.copy()

        ranked_paper["relevance_score"] = (
            score
        )

        ranked_papers.append(
            ranked_paper
        )

    # Sort from highest relevance
    # to lowest relevance
    ranked_papers.sort(
        key=lambda paper:
        paper.get(
            "relevance_score",
            0
        ),
        reverse=True
    )

    # Return only requested number
    return ranked_papers[:limit]