import requests


# OpenAlex API base URL
OPENALEX_BASE_URL = "https://api.openalex.org"


def search_papers(
    query,
    limit=10
):
    """
    Search for academic papers using OpenAlex.

    Parameters:
        query: Research topic or search query
        limit: Maximum number of papers to return

    Returns:
        List of research papers
    """

    try:

        # Validate query
        if not query or not query.strip():
            raise ValueError(
                "Research query cannot be empty."
            )

        # OpenAlex search endpoint
        url = (
            f"{OPENALEX_BASE_URL}/works"
        )

        # API parameters
        params = {
            "search": query.strip(),
            "per-page": limit
        }

        # Send request
        response = requests.get(
            url,
            params=params,
            timeout=15
        )

        # Check response
        response.raise_for_status()

        data = response.json()

        # Get results
        results = data.get(
            "results",
            []
        )

        papers = []

        for paper in results:

            # Get authors
            authors = []

            for authorship in paper.get(
                "authorships",
                []
            ):

                author = authorship.get(
                    "author",
                    {}
                )

                author_name = author.get(
                    "display_name"
                )

                if author_name:
                    authors.append(
                        author_name
                    )

            # Get publication information
            publication_year = paper.get(
                "publication_year"
            )

            # Get DOI
            doi = paper.get(
                "doi"
            )

            # Get OpenAlex ID
            openalex_id = paper.get(
                "id"
            )

            # Get paper URL
            primary_location = paper.get(
                "primary_location"
            ) or {}

            landing_page_url = (
                primary_location.get(
                    "landing_page_url"
                )
            )

            # Create normalized paper object
            papers.append(
                {
                    "id": openalex_id,
                    "title": paper.get(
                        "title",
                        "Unknown title"
                    ),
                    "authors": authors,
                    "publication_year": (
                        publication_year
                    ),
                    "doi": doi,
                    "url": (
                        landing_page_url
                        or doi
                        or openalex_id
                    ),
                    "abstract": (
                        extract_abstract(paper)
                    ),
                    "cited_by_count": paper.get(
                        "cited_by_count",
                        0
                    )
                }
            )

        return papers

    except requests.exceptions.RequestException as error:

        print(
            "❌ OpenAlex API Error:",
            error
        )

        raise Exception(
            f"OpenAlex request failed: {str(error)}"
        )

    except Exception as error:

        print(
            "❌ OpenAlex Search Error:",
            error
        )

        raise Exception(
            f"Failed to search OpenAlex: {str(error)}"
        )


def extract_abstract(paper):
    """
    Reconstruct the abstract from OpenAlex's
    inverted-index format.
    """

    abstract_index = paper.get(
        "abstract_inverted_index"
    )

    if not abstract_index:
        return ""

    words = []

    for word, positions in abstract_index.items():

        for position in positions:

            words.append(
                (position, word)
            )

    # Sort words according to their position
    words.sort(
        key=lambda item: item[0]
    )

    abstract = " ".join(
        word
        for _, word in words
    )

    return abstract


def get_paper_by_id(paper_id):
    """
    Get details of a specific paper
    using its OpenAlex ID.
    """

    try:

        if not paper_id:
            raise ValueError(
                "Paper ID cannot be empty."
            )

        # Support full OpenAlex URL or ID
        if paper_id.startswith(
            "https://openalex.org/"
        ):

            url = paper_id

        else:

            url = (
                f"{OPENALEX_BASE_URL}/works/"
                f"{paper_id}"
            )

        response = requests.get(
            url,
            timeout=15
        )

        response.raise_for_status()

        paper = response.json()

        authors = []

        for authorship in paper.get(
            "authorships",
            []
        ):

            author = authorship.get(
                "author",
                {}
            )

            author_name = author.get(
                "display_name"
            )

            if author_name:
                authors.append(
                    author_name
                )

        primary_location = (
            paper.get("primary_location")
            or {}
        )

        return {
            "id": paper.get("id"),
            "title": paper.get(
                "title",
                "Unknown title"
            ),
            "authors": authors,
            "publication_year": paper.get(
                "publication_year"
            ),
            "doi": paper.get("doi"),
            "url": (
                primary_location.get(
                    "landing_page_url"
                )
                or paper.get("doi")
                or paper.get("id")
            ),
            "abstract": extract_abstract(
                paper
            ),
            "cited_by_count": paper.get(
                "cited_by_count",
                0
            )
        }

    except requests.exceptions.RequestException as error:

        print(
            "❌ OpenAlex API Error:",
            error
        )

        raise Exception(
            f"Failed to retrieve paper: {str(error)}"
        )

    except Exception as error:

        print(
            "❌ Paper Details Error:",
            error
        )

        raise Exception(
            f"Failed to get paper details: {str(error)}"
        )