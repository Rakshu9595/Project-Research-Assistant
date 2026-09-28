def chunk_text(
    text,
    chunk_size=500,
    chunk_overlap=50
):
    """
    Split a single text into smaller chunks.

    chunk_size:
        Maximum number of words in one chunk.

    chunk_overlap:
        Number of words repeated between
        consecutive chunks.
    """

    if not text or not text.strip():
        return []

    words = text.strip().split()

    chunks = []

    start = 0

    while start < len(words):

        end = start + chunk_size

        chunk_words = words[start:end]

        chunk = " ".join(chunk_words)

        if chunk.strip():
            chunks.append(chunk)

        # Move forward while keeping overlap
        start = end - chunk_overlap

        if start <= 0:
            start = end

    return chunks


def chunk_elements(
    elements,
    chunk_size=500,
    chunk_overlap=50
):
    """
    Convert extracted document elements
    into smaller chunks while preserving
    document information such as page,
    slide, heading, and table numbers.
    """

    chunks = []

    for element in elements:

        element_type = element.get(
            "element_type",
            "text"
        )

        content = element.get(
            "content",
            ""
        )

        # Convert table data into text
        if isinstance(content, list):

            rows = []

            for row in content:

                if isinstance(row, list):
                    rows.append(
                        " | ".join(
                            str(cell)
                            for cell in row
                        )
                    )

                else:
                    rows.append(str(row))

            content = "\n".join(rows)

        if not content:
            continue

        content = str(content).strip()

        if not content:
            continue

        # Split the content
        text_chunks = chunk_text(
            content,
            chunk_size,
            chunk_overlap
        )

        # Preserve metadata
        for chunk_index, text in enumerate(
            text_chunks,
            start=1
        ):

            chunk = {
                "content": text,
                "element_type": element_type,
                "chunk_index": chunk_index
            }

            # Preserve PDF page number
            if "page_number" in element:
                chunk["page_number"] = (
                    element["page_number"]
                )

            # Preserve PPT slide number
            if "slide_number" in element:
                chunk["slide_number"] = (
                    element["slide_number"]
                )

            # Preserve DOCX style
            if "style" in element:
                chunk["style"] = (
                    element["style"]
                )

            # Preserve table number
            if "table_number" in element:
                chunk["table_number"] = (
                    element["table_number"]
                )

            # Preserve image number
            if "image_number" in element:
                chunk["image_number"] = (
                    element["image_number"]
                )

            chunks.append(chunk)

    return chunks


def chunk_document(
    document,
    chunk_size=500,
    chunk_overlap=50
):
    """
    Chunk a complete loaded document.

    Works with the output structure of
    PDF, PPT/PPTX and DOCX loaders.
    """

    all_elements = []

    # PDF document
    if document.get("file_type") == "pdf":

        for page in document.get(
            "pages",
            []
        ):

            for element in page.get(
                "elements",
                []
            ):

                element["page_number"] = (
                    page["page_number"]
                )

                all_elements.append(element)

    # PPT/PPTX document
    elif document.get("file_type") == "pptx":

        for slide in document.get(
            "slides",
            []
        ):

            for element in slide.get(
                "elements",
                []
            ):

                element["slide_number"] = (
                    slide["slide_number"]
                )

                all_elements.append(element)

    # DOCX document
    elif document.get("file_type") == "docx":

        all_elements = document.get(
            "elements",
            []
        )

    else:

        raise ValueError(
            "Unsupported document type."
        )

    return chunk_elements(
        all_elements,
        chunk_size,
        chunk_overlap
    )