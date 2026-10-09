from llm.llm_client import generate_response
from llm.prompts import RESEARCH_SYSTEM_PROMPT


def create_topic_extraction_prompt(text):
    """
    Create a prompt to extract research topics
    from project-related text.
    """

    if not text or not text.strip():
        raise ValueError(
            "Input text cannot be empty."
        )

    prompt = f"""
Analyze the following project information
and extract its important research topics.

Project Information:
{text}

Identify the following:

1. Main Project Topic
2. Important Technical Concepts
3. Algorithms and Methods
4. Technologies Used
5. Research Areas
6. Academic Keywords

Rules:
- Extract information relevant to the project.
- Preserve important technical terms.
- Do not invent technologies or algorithms.
- Do not add information that is not supported
  by the provided text.
- Keep the output clear and concise.
- Use headings for each section.
"""

    return prompt


def extract_topics(text):
    """
    Extract research topics and technical concepts
    from the provided project information.
    """

    try:

        if not text or not text.strip():
            raise ValueError(
                "Input text cannot be empty."
            )

        prompt = create_topic_extraction_prompt(
            text
        )

        response = generate_response(
            system_prompt=RESEARCH_SYSTEM_PROMPT,
            user_prompt=prompt
        )

        if not response:
            raise ValueError(
                "LLM returned an empty response."
            )

        return {
            "input_text": text,
            "extracted_topics": response.strip()
        }

    except Exception as error:

        print(
            "❌ Topic Extraction Error:",
            error
        )

        raise Exception(
            f"Failed to extract research topics: {str(error)}"
        )


def extract_topics_from_document(document):
    """
    Extract research topics from a loaded document.

    Supports the output structures of:
    - PDF loader
    - PPT/PPTX loader
    - DOCX loader
    """

    try:

        if not document:
            raise ValueError(
                "Document cannot be empty."
            )

        file_type = document.get(
            "file_type"
        )

        extracted_text = []

        # Extract text from PDF pages

        if file_type == "pdf":

            for page in document.get(
                "pages",
                []
            ):

                for element in page.get(
                    "elements",
                    []
                ):

                    content = element.get(
                        "content",
                        ""
                    )

                    if isinstance(content, list):
                        content = convert_table_to_text(
                            content
                        )

                    if content:
                        extracted_text.append(
                            str(content)
                        )

        # Extract text from PPTX slides

        elif file_type == "pptx":

            for slide in document.get(
                "slides",
                []
            ):

                for element in slide.get(
                    "elements",
                    []
                ):

                    content = element.get(
                        "content",
                        ""
                    )

                    if isinstance(content, list):
                        content = convert_table_to_text(
                            content
                        )

                    if content:
                        extracted_text.append(
                            str(content)
                        )

        # Extract text from DOCX documents

        elif file_type == "docx":

            for element in document.get(
                "elements",
                []
            ):

                content = element.get(
                    "content",
                    ""
                )

                if isinstance(content, list):
                    content = convert_table_to_text(
                        content
                    )

                if content:
                    extracted_text.append(
                        str(content)
                    )

        else:

            raise ValueError(
                "Unsupported document type. "
                "Only PDF, PPTX and DOCX are supported."
            )

        if not extracted_text:
            raise ValueError(
                "No text was found in the document."
            )

        full_text = "\n".join(
            extracted_text
        )

        return extract_topics(
            full_text
        )

    except Exception as error:

        print(
            "❌ Document Topic Extraction Error:",
            error
        )

        raise Exception(
            f"Failed to extract topics from document: {str(error)}"
        )


def convert_table_to_text(table_data):
    """
    Convert extracted table data into readable text.
    """

    rows = []

    for row in table_data:

        if isinstance(row, list):

            rows.append(
                " | ".join(
                    str(cell)
                    for cell in row
                )
            )

        else:

            rows.append(
                str(row)
            )

    return "\n".join(rows)