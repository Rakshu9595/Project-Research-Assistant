from datetime import datetime


def create_metadata(
    document_id,
    file_name,
    file_type,
    element,
):
    """
    Create metadata for an extracted document element.
    """

    metadata = {
        "document_id": str(document_id),
        "file_name": file_name,
        "file_type": file_type,
        "element_type": element.get(
            "element_type",
            "text"
        ),
        "created_at": datetime.utcnow().isoformat(),
    }

    # --------------------------------------------------
    # PDF METADATA
    # --------------------------------------------------

    if "page_number" in element:

        metadata["page_number"] = element[
            "page_number"
        ]

    # --------------------------------------------------
    # PPT / PPTX METADATA
    # --------------------------------------------------

    if "slide_number" in element:

        metadata["slide_number"] = element[
            "slide_number"
        ]

    # --------------------------------------------------
    # DOCX METADATA
    # --------------------------------------------------

    if "style" in element:

        metadata["style"] = element[
            "style"
        ]

    if "table_number" in element:

        metadata["table_number"] = element[
            "table_number"
        ]

    if "image_number" in element:

        metadata["image_number"] = element[
            "image_number"
        ]

    return metadata


def create_chunk_metadata(
    document_id,
    file_name,
    file_type,
    chunk,
    chunk_index,
    total_chunks,
):
    """
    Create metadata for a text chunk
    before storing it in the vector database.
    """

    metadata = {
        "document_id": str(document_id),
        "file_name": file_name,
        "file_type": file_type,

        "chunk_index": chunk_index,
        "total_chunks": total_chunks,

        "element_type": chunk.get(
            "element_type",
            "text"
        ),

        "created_at": datetime.utcnow().isoformat(),
    }

    # PDF page information
    if "page_number" in chunk:

        metadata["page_number"] = chunk[
            "page_number"
        ]

    # PPT slide information
    if "slide_number" in chunk:

        metadata["slide_number"] = chunk[
            "slide_number"
        ]

    # DOCX section/style information
    if "style" in chunk:

        metadata["style"] = chunk[
            "style"
        ]

    # Table information
    if "table_number" in chunk:

        metadata["table_number"] = chunk[
            "table_number"
        ]

    return metadata


def get_source_reference(metadata):
    """
    Create a human-readable source reference.
    """

    file_name = metadata.get(
        "file_name",
        "Unknown file"
    )

    file_type = metadata.get(
        "file_type",
        ""
    )

    # PDF source
    if "page_number" in metadata:

        return (
            f"{file_name}, "
            f"Page {metadata['page_number']}"
        )

    # PPT source
    if "slide_number" in metadata:

        return (
            f"{file_name}, "
            f"Slide {metadata['slide_number']}"
        )

    # DOCX source
    if metadata.get("style"):

        return (
            f"{file_name}, "
            f"Section: {metadata['style']}"
        )

    return file_name

