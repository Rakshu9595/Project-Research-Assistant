import os
import fitz  # PyMuPDF
from pptx import Presentation


def load_document(file_path):
    """
    Load PDF, PPT, or PPTX file and extract its elements.
    """

    if not os.path.exists(file_path):
        raise FileNotFoundError(
            f"File not found: {file_path}"
        )

    file_extension = os.path.splitext(
        file_path
    )[1].lower()

    if file_extension == ".pdf":
        return load_pdf(file_path)

    elif file_extension in [".ppt", ".pptx"]:
        return load_ppt(file_path)

    else:
        raise ValueError(
            "Unsupported file type. "
            "Only PDF, PPT and PPTX files are supported."
        )


# --------------------------------------------------
# PDF LOADER
# --------------------------------------------------

def load_pdf(file_path):
    """
    Extract text and tables from a PDF page by page.
    """

    try:
        document = fitz.open(file_path)

        pages = []

        for page_number, page in enumerate(
            document,
            start=1
        ):

            elements = []

            # Extract normal text
            text = page.get_text("text").strip()

            if text:
                elements.append({
                    "element_type": "text",
                    "content": text
                })

            # Extract tables
            try:
                tables = page.find_tables()

                for table in tables.tables:

                    table_data = table.extract()

                    if table_data:
                        elements.append({
                            "element_type": "table",
                            "content": table_data
                        })

            except Exception as table_error:
                print(
                    f"⚠️ Table extraction failed "
                    f"on PDF page {page_number}: "
                    f"{table_error}"
                )

            pages.append({
                "page_number": page_number,
                "elements": elements
            })

        document.close()

        return {
            "file_type": "pdf",
            "file_path": file_path,
            "pages": pages
        }

    except Exception as error:

        print(
            "❌ PDF Loading Error:",
            error
        )

        raise Exception(
            f"Failed to load PDF: {str(error)}"
        )


# --------------------------------------------------
# PPT / PPTX LOADER
# --------------------------------------------------

def load_ppt(file_path):
    """
    Extract text and tables from PPT/PPTX slides.
    """

    try:

        # python-pptx works directly with PPTX.
        # Old .ppt files should be converted to .pptx
        # before calling this function.

        if file_path.lower().endswith(".ppt"):
            raise ValueError(
                "Old .ppt format is not directly supported. "
                "Please convert the file to .pptx first."
            )

        presentation = Presentation(file_path)

        slides = []

        for slide_number, slide in enumerate(
            presentation.slides,
            start=1
        ):

            elements = []

            for shape in slide.shapes:

                # -------------------------------
                # TEXT
                # -------------------------------

                if hasattr(shape, "text"):

                    text = shape.text.strip()

                    if text:
                        elements.append({
                            "element_type": "text",
                            "content": text
                        })

                # -------------------------------
                # TABLE
                # -------------------------------

                if shape.has_table:

                    table_data = []

                    for row in shape.table.rows:

                        row_data = []

                        for cell in row.cells:

                            row_data.append(
                                cell.text.strip()
                            )

                        table_data.append(row_data)

                    if table_data:

                        elements.append({
                            "element_type": "table",
                            "content": table_data
                        })

            slides.append({
                "slide_number": slide_number,
                "elements": elements
            })

        return {
            "file_type": "pptx",
            "file_path": file_path,
            "slides": slides
        }

    except Exception as error:

        print(
            "❌ PPT/PPTX Loading Error:",
            error
        )

        raise Exception(
            f"Failed to load PPT/PPTX: {str(error)}"
        )
