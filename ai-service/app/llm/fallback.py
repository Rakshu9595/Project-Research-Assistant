from llm.llm_client import generate_response


def generate_fallback_answer(
    question,
    conversation_history=None
):
    """
    Generate an answer using the general LLM
    when the answer cannot be found in the
    uploaded documents.
    """

    try:

        # Validate question
        if not question or not question.strip():
            raise ValueError(
                "Question cannot be empty."
            )

        # Create system instruction
        system_prompt = """
You are a helpful AI assistant.

Answer the user's question using your
general knowledge.

Important rules:
1. Give a clear and useful answer.
2. Do not pretend that the answer came
   from the user's uploaded documents.
3. If you are uncertain about a fact,
   clearly mention the uncertainty.
4. Do not invent sources or citations.
5. Keep the answer relevant to the question.
"""

        # Create user prompt
        user_prompt = f"""
Question:

{question}
"""

        # Add previous conversation if available
        if conversation_history:

            user_prompt += """

Previous conversation:

"""

            user_prompt += str(
                conversation_history
            )

        # Generate response using LLM
        answer = generate_response(
            system_prompt=system_prompt,
            user_prompt=user_prompt
        )

        return {
            "answer": answer,
            "source": "general",
            "is_fallback": True
        }

    except Exception as error:

        print(
            "❌ Fallback Generation Error:",
            error
        )

        raise Exception(
            f"Failed to generate fallback answer: {str(error)}"
        )