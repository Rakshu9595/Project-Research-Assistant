from llm.llm_client import generate_response

from llm.prompts import RESEARCH_SYSTEM_PROMPT


def create_summary_prompt(paper):
    """
    Create a prompt for summarizing one research paper.
    """

    title = paper.get(
        "title",
        "Unknown title"
    )

    authors = paper.get(
        "authors",
        []
    )

    abstract = paper.get(
        "abstract",
        ""
    )

    publication_year = paper.get(
        "publication_year",
        "Unknown"
    )

    # Convert authors list to text
    if authors:
        author_text = ", ".join(authors)
    else:
        author_text = "Unknown authors"

    if not abstract:
        abstract = "No abstract is available."

    return f"""
Summarize the following academic research paper.

Title:
{title}

Authors:
{author_text}

Publication Year:
{publication_year}

Abstract:
{abstract}

Provide the summary using this structure:

1. Research Problem
2. Main Approach
3. Key Findings
4. Relevance to the Project
5. Limitations

Keep the summary concise and easy to understand.

Important:
- Use only the information provided above.
- Do not invent results or findings.
- If information is not available, say
  "Not available in the provided information."
"""


def summarize_paper(paper):
    """
    Generate a summary for a single research paper.
    """

    try:

        if not paper:
            raise ValueError(
                "Paper information cannot be empty."
            )

        prompt = create_summary_prompt(
            paper
        )

        summary = generate_response(
            system_prompt=RESEARCH_SYSTEM_PROMPT,
            user_prompt=prompt
        )

        return {
            "title": paper.get(
                "title",
                "Unknown title"
            ),
            "summary": summary,
            "url": paper.get(
                "url",
                ""
            ),
            "publication_year": paper.get(
                "publication_year"
            ),
            "authors": paper.get(
                "authors",
                []
            ),
            "relevance_score": paper.get(
                "relevance_score"
            )
        }

    except Exception as error:

        print(
            "❌ Paper Summarization Error:",
            error
        )

        raise Exception(
            f"Failed to summarize paper: {str(error)}"
        )


def summarize_papers(papers):
    """
    Generate summaries for multiple papers.
    """

    if not papers:
        return []

    summaries = []

    for paper in papers:

        try:

            summary = summarize_paper(
                paper
            )

            summaries.append(
                summary
            )

        except Exception as error:

            print(
                "⚠️ Skipping paper:",
                error
            )

    return summaries