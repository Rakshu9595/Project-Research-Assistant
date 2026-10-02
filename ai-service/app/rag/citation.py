def create_citation(metadata):
    """
    Create a citation for a retrieved document chunk.
    """

    if not metadata:
        return "Unknown source"

    file_name = metadata.get(
        "file_name",
        "Unknown file"
    )

    # PDF source
    if "page_number" in metadata:

        return (
            f"{file_name}, "
            f"Page {metadata['page_number']}"
        )

    # PPT/PPTX source
    if "slide_number" in metadata:

        return (
            f"{file_name}, "
            f"Slide {metadata['slide_number']}"
        )

    # DOCX heading/section
    if "style" in metadata:

        return (
            f"{file_name}, "
            f"Section: {metadata['style']}"
        )

    # Table source
    if "table_number" in metadata:

        return (
            f"{file_name}, "
            f"Table {metadata['table_number']}"
        )

    # Default source
    return file_name


def create_citations(results):
    """
    Create citations for multiple retrieved chunks.
    """

    citations = []

    if not results:
        return citations

    for result in results:

        # ChromaDB metadata
        if isinstance(result, dict):

            metadata = result.get(
                "metadata",
                result
            )

            citation = create_citation(
                metadata
            )

            if citation not in citations:
                citations.append(citation)

    return citations


def format_citations(citations):
    """
    Format citations for displaying in the final answer.
    """

    if not citations:
        return ""

    formatted = "\n\nSources:\n"

    for index, citation in enumerate(
        citations,
        start=1
    ):

        formatted += (
            f"[{index}] {citation}\n"
        )

    return formatted


def add_citations_to_answer(
    answer,
    citations
):
    """
    Add source citations to the final RAG answer.
    """

    if not answer:
        return answer

    if not citations:
        return answer

    citation_text = format_citations(
        citations
    )

    return answer + citation_text