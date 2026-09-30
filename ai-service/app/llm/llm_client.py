import os

from google import genai


# -------------------------------------------------
# Gemini Configuration
# -------------------------------------------------

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError(
        "GEMINI_API_KEY is missing from environment variables."
    )


# Create Gemini client
client = genai.Client(
    api_key=GEMINI_API_KEY
)


# Gemini model
MODEL_NAME = "gemini-2.5-flash"


# -------------------------------------------------
# Generate Response
# -------------------------------------------------

def generate_response(
    system_prompt,
    user_prompt
):
    """
    Generate a response using Gemini.
    """

    try:

        if not user_prompt or not user_prompt.strip():
            raise ValueError(
                "User prompt cannot be empty."
            )

        # Combine system instructions and user prompt
        prompt = f"""
System Instructions:

{system_prompt}

User Question:

{user_prompt}
"""

        # Send request to Gemini
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt
        )

        # Get generated text
        answer = response.text

        if not answer:
            raise ValueError(
                "Gemini returned an empty response."
            )

        return answer.strip()

    except Exception as error:

        print(
            "❌ LLM Generation Error:",
            error
        )

        raise Exception(
            f"Failed to generate LLM response: {str(error)}"
        )