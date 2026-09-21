import os

from dotenv import load_dotenv


# Load variables from .env file and use
load_dotenv()


class Settings:
    """
    Application configuration settings.
    """

    # -----------------------------
    # Application
    # -----------------------------

    APP_NAME = os.getenv(
        "APP_NAME",
        "Project Research Assistant"
    )

    APP_VERSION = os.getenv(
        "APP_VERSION",
        "1.0.0"
    )

    DEBUG = os.getenv(
        "DEBUG",
        "False"
    ).lower() == "true"


    # -----------------------------
    # FastAPI Server
    # -----------------------------

    HOST = os.getenv(
        "HOST",
        "0.0.0.0"
    )

    PORT = int(
        os.getenv(
            "PORT",
            "8000"
        )
    )


    # -----------------------------
    # Node.js Backend
    # -----------------------------

    BACKEND_URL = os.getenv(
        "BACKEND_URL",
        "http://localhost:5000"
    )


    # -----------------------------
    # LLM Configuration
    # -----------------------------

    LLM_PROVIDER = os.getenv(
        "LLM_PROVIDER",
        "openai"
    )

    LLM_MODEL = os.getenv(
        "LLM_MODEL",
        "gpt-4o-mini"
    )

    OPENAI_API_KEY = os.getenv(
        "OPENAI_API_KEY",
        ""
    )


    # -----------------------------
    # Embedding Configuration
    # -----------------------------

    EMBEDDING_MODEL = os.getenv(
        "EMBEDDING_MODEL",
        "sentence-transformers/all-MiniLM-L6-v2"
    )


    # -----------------------------
    # ChromaDB Configuration
    # -----------------------------

    CHROMA_PERSIST_DIRECTORY = os.getenv(
        "CHROMA_PERSIST_DIRECTORY",
        "./chroma_db"
    )

    CHROMA_COLLECTION_NAME = os.getenv(
        "CHROMA_COLLECTION_NAME",
        "project_documents"
    )


    # -----------------------------
    # Research API Configuration
    # -----------------------------

    OPENALEX_BASE_URL = os.getenv(
        "OPENALEX_BASE_URL",
        "https://api.openalex.org"
    )

    SEMANTIC_SCHOLAR_BASE_URL = os.getenv(
        "SEMANTIC_SCHOLAR_BASE_URL",
        "https://api.semanticscholar.org/graph/v1"
    )

    SEMANTIC_SCHOLAR_API_KEY = os.getenv(
        "SEMANTIC_SCHOLAR_API_KEY",
        ""
    )


    # -----------------------------
    # RAG Configuration 
    # -----------------------------

    CHUNK_SIZE = int(
        os.getenv(
            "CHUNK_SIZE",
            "800"
        )
    )

    CHUNK_OVERLAP = int(
        os.getenv(
            "CHUNK_OVERLAP",
            "100"
        )
    )

    TOP_K = int(
        os.getenv(
            "TOP_K",
            "5"
        )
    )

    MIN_RETRIEVAL_SCORE = float(
        os.getenv(
            "MIN_RETRIEVAL_SCORE",
            "0.50"
        )
    )


# Create one settings object
settings = Settings()

