import requests


SEMANTIC_SCHOLAR_BASE_URL = (
    "https://api.semanticscholar.org/graph/v1"
)


def search_papers(query, limit=10):
    """
    Search for academic research papers
    using the Semantic Scholar API.
    """

    try:

        if not query or not query.strip():
            raise ValueError(
                "Research query cannot be empty."
            )

        if limit < 1:
            raise ValueError(
                "Limit must be at least 1."
            )

        url = (
            f"{SEMANTIC_SCHOLAR_BASE_URL}/paper/search"
        )

        params = {
            "query": query.strip(),
            "limit": min(limit, 100),
            "fields": (
                "title,authors,year,abstract,"
                "url,externalIds,citationCount,"
                "referenceCount,publicationDate"
            )
        }

        response = requests.get(
            url,
            params=params,
            timeout=20
        )

        response.raise_for_status()

        data = response.json()

        papers = []

        for paper in data.get("data", []):

            authors = []

            for author in paper.get(
                "authors",
                []
            ):

                author_name = author.get(
                    "name"
                )

                if author_name:
                    authors.append(
                        author_name
                    )

            external_ids = (
                paper.get("externalIds") or {}
            )

            doi = external_ids.get("DOI")

            paper_url = paper.get("url")

            if not paper_url and doi:
                paper_url = (
                    f"https://doi.org/{doi}"
                )

            papers.append({
                "id": paper.get("paperId"),
                "title": paper.get(
                    "title",
                    "Unknown title"
                ),
                "authors": authors,
                "publication_year": paper.get(
                    "year"
                ),
                "publication_date": paper.get(
                    "publicationDate"
                ),
                "abstract": paper.get(
                    "abstract"
                ) or "",
                "url": paper_url or "",
                "doi": doi,
                "citation_count": paper.get(
                    "citationCount",
                    0
                ),
                "reference_count": paper.get(
                    "referenceCount",
                    0
                ),
                "source": "Semantic Scholar"
            })

        return papers

    except requests.exceptions.RequestException as error:

        print(
            "❌ Semantic Scholar API Error:",
            error
        )

        raise Exception(
            f"Semantic Scholar request failed: {str(error)}"
        )

    except Exception as error:

        print(
            "❌ Semantic Scholar Search Error:",
            error
        )

        raise Exception(
            f"Failed to search Semantic Scholar: {str(error)}"
        )


def get_paper_details(paper_id):
    """
    Retrieve detailed information about
    a specific research paper.
    """

    try:

        if not paper_id or not paper_id.strip():
            raise ValueError(
                "Paper ID cannot be empty."
            )

        url = (
            f"{SEMANTIC_SCHOLAR_BASE_URL}/paper/"
            f"{paper_id.strip()}"
        )

        params = {
            "fields": (
                "title,authors,year,abstract,"
                "url,externalIds,citationCount,"
                "referenceCount,publicationDate"
            )
        }

        response = requests.get(
            url,
            params=params,
            timeout=20
        )

        response.raise_for_status()

        paper = response.json()

        authors = []

        for author in paper.get(
            "authors",
            []
        ):

            author_name = author.get(
                "name"
            )

            if author_name:
                authors.append(
                    author_name
                )

        external_ids = (
            paper.get("externalIds") or {}
        )

        doi = external_ids.get("DOI")

        paper_url = paper.get("url")

        if not paper_url and doi:
            paper_url = (
                f"https://doi.org/{doi}"
            )

        return {
            "id": paper.get("paperId"),
            "title": paper.get(
                "title",
                "Unknown title"
            ),
            "authors": authors,
            "publication_year": paper.get(
                "year"
            ),
            "publication_date": paper.get(
                "publicationDate"
            ),
            "abstract": paper.get(
                "abstract"
            ) or "",
            "url": paper_url or "",
            "doi": doi,
            "citation_count": paper.get(
                "citationCount",
                0
            ),
            "reference_count": paper.get(
                "referenceCount",
                0
            ),
            "source": "Semantic Scholar"
        }

    except requests.exceptions.RequestException as error:

        print(
            "❌ Semantic Scholar API Error:",
            error
        )

        raise Exception(
            f"Failed to retrieve paper details: {str(error)}"
        )

    except Exception as error:

        print(
            "❌ Paper Details Error:",
            error
        )

        raise Exception(
            f"Failed to get paper details: {str(error)}"
        )