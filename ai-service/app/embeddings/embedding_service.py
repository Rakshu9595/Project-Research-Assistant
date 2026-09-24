from sentence_transformers import SentenceTransformer


# Default embedding model
MODEL_NAME = "all-MiniLM-L6-v2"


class EmbeddingService:
    """
    Service responsible for converting text into embeddings.
    """

    def __init__(self, model_name=MODEL_NAME):
        try:
            print(f"🔄 Loading embedding model: {model_name}")

            self.model = SentenceTransformer(model_name)

            print("✅ Embedding model loaded successfully")

        except Exception as error:
            print("❌ Embedding Model Loading Error:", error)
            raise Exception(
                f"Failed to load embedding model: {str(error)}"
            )

    def generate_embedding(self, text):
        """
        Generate an embedding for a single piece of text.
        """

        try:
            if not text or not text.strip():
                raise ValueError(
                    "Text cannot be empty."
                )

            embedding = self.model.encode(
                text,
                convert_to_numpy=True
            )

            return embedding.tolist()

        except Exception as error:
            print(
                "❌ Embedding Generation Error:",
                error
            )

            raise Exception(
                f"Failed to generate embedding: {str(error)}"
            )

    def generate_embeddings(self, texts):
        """
        Generate embeddings for multiple text chunks.
        """

        try:
            if not texts:
                return []

            cleaned_texts = [
                text.strip()
                for text in texts
                if text and text.strip()
            ]

            if not cleaned_texts:
                return []

            embeddings = self.model.encode(
                cleaned_texts,
                convert_to_numpy=True
            )

            return embeddings.tolist()

        except Exception as error:
            print(
                "❌ Multiple Embedding Generation Error:",
                error
            )

            raise Exception(
                f"Failed to generate embeddings: {str(error)}"
            )


# Create one reusable embedding service
embedding_service = EmbeddingService()