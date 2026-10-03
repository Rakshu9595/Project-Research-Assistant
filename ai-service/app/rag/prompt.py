# RAG System Prompt


RAG_SYSTEM_PROMPT = """
You are a document-based research assistant.

Your task is to answer the user's question using
the retrieved information from the uploaded documents.

Rules:

1. Use only the provided document context.

2. Do not invent information that is not present
   in the provided context.

3. If the answer is not available in the context,
   clearly say:
   "The information is not available in the
   uploaded documents."

4. Give a clear and concise answer.

5. Preserve important technical terms from the
   source documents.

6. When the retrieved context contains multiple
   relevant sources, combine them carefully.

7. Do not create fake citations.

8. Do not claim that information came from a
   document if it is not present in the context.

9. If the context is insufficient, do not guess.
"""


# -------------------------------------------------
# Create RAG Prompt
# -------------------------------------------------

def create_rag_prompt(question, context):
    """
    Create the final prompt sent to the LLM.

    Parameters:
        question: User's question
        context: Retrieved document chunks

    Returns:
        A formatted RAG prompt
    """

    if not question or not question.strip():
        raise ValueError(
            "Question cannot be empty."
        )

    if not context:
        context = "No relevant document context was retrieved."

    # Convert context into text
    if isinstance(context, list):

        formatted_context = ""

        for index, item in enumerate(
            context,
            start=1
        ):

            if isinstance(item, dict):

                content = item.get(
                    "content",
                    ""
                )

                metadata = item.get(
                    "metadata",
                    {}
                )

                formatted_context += (
                    f"\n--- Context {index} ---\n"
                )

                formatted_context += (
                    f"{content}\n"
                )

                if metadata:
                    formatted_context += (
                        f"Metadata: {metadata}\n"
                    )

            else:

                formatted_context += (
                    f"\n--- Context {index} ---\n"
                )

                formatted_context += (
                    f"{str(item)}\n"
                )

    else:

        formatted_context = str(context)

    # Create final prompt
    prompt = f"""
{RAG_SYSTEM_PROMPT}


RETRIEVED DOCUMENT CONTEXT


{formatted_context}


USER QUESTION


{question}


ANSWER


Answer the user's question using only
the retrieved document context.
"""

    return prompt.strip()