import os


def load_text(file_path):
    """
    Load a plain text file and extract its content.
    """

    try:
        # Check if the file exists
        if not os.path.exists(file_path):
            raise FileNotFoundError(
                f"File not found: {file_path}"
            )

        # Open the text file
        with open(
            file_path,
            "r",
            encoding="utf-8"
        ) as file:

            text = file.read()

        # Remove unnecessary spaces
        text = text.strip()

        # Check if the file is empty
        if not text:
            return {
                "file_type": "txt",
                "file_path": file_path,
                "elements": []
            }

        # Store extracted text
        elements = [
            {
                "element_type": "text",
                "content": text
            }
        ]

        # Return extracted document
        return {
            "file_type": "txt",
            "file_path": file_path,
            "elements": elements
        }

    except Exception as error:

        print(
            "❌ Text Loading Error:",
            error
        )

        raise Exception(
            f"Failed to load text file: {str(error)}"
        )

