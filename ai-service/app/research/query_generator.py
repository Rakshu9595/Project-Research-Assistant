from llm.llm_client import generate_response
from llm.prompts import RESEARCH_SYSTEM_PROMPT


def create_query_prompt(topic):
    """
    Create a prompt for generating
    academic research search queries.
    """

    if not topic or not topic.strip():
        raise ValueError(
            "Research topic cannot be empty."
        )

    prompt = f"""
Generate academic research search queries
for the following project topic.

Project Topic:
{topic}

Generate 5 different and useful
academic search queries.

The queries should cover:

1. Main research topic
2. Important technical concepts
3. Methods or algorithms
4. Applications
5. Recent research directions

Rules:

- Keep each query concise.
- Use technical and academic keywords.
- Make every query different.
- Do not invent research papers.
- Do not invent authors or citations.
- Return only the queries.
- Number the queries from 1 to 5.
"""

    return prompt


def generate_research_queries(topic):
    """
    Generate multiple academic research
    queries from a project topic.
    """

    try:

        if not topic or not topic.strip():
            raise ValueError(
                "Research topic cannot be empty."
            )

        prompt = create_query_prompt(
            topic
        )

        response = generate_response(
            system_prompt=RESEARCH_SYSTEM_PROMPT,
            user_prompt=prompt
        )

        if not response:
            raise ValueError(
                "LLM returned an empty response."
            )

        queries = parse_queries(
            response
        )

        if not queries:
            raise ValueError(
                "No research queries were generated."
            )

        return queries

    except Exception as error:

        print(
            "❌ Research Query Generation Error:",
            error
        )

        raise Exception(
            f"Failed to generate research queries: {str(error)}"
        )


def parse_queries(response):
    """
    Convert the LLM response into
    a clean list of research queries.
    """

    if not response:
        return []

    queries = []

    lines = response.splitlines()

    for line in lines:

        line = line.strip()

        if not line:
            continue

        # Remove numbering such as:
        # 1. Query
        # 2. Query
        # 3) Query

        if line[0].isdigit():

            if len(line) >= 3:

                if line[1:3] == ". ":
                    line = line[3:]

                elif line[1:3] == ") ":
                    line = line[3:]

        line = line.strip()

        if line:
            queries.append(line)

    # Return maximum 5 queries

    return queries[:5]


def generate_query_variations(topic):
    """
    Generate research query variations
    and return them with basic information.
    """

    try:

        queries = generate_research_queries(
            topic
        )

        return {
            "topic": topic,
            "queries": queries,
            "query_count": len(queries)
        }

    except Exception as error:

        print(
            "❌ Query Variation Error:",
            error
        )

        raise Exception(
            f"Failed to generate query variations: {str(error)}"
        )