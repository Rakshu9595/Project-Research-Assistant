import os
import logging
from contextlib import asynccontextmanager

from dotenv import load_dotenv

# Load environment variables before importing
# modules that may require API keys.
load_dotenv()

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from api.routes_ingestion import router as ingestion_router
from api.routes_chat import router as chat_router
from api.routes_research import router as research_router


# --------------------------------------------------
# Logging configuration
# --------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)


# --------------------------------------------------
# Application configuration
# --------------------------------------------------

APP_NAME = "Project Research Assistant AI Service"

APP_VERSION = "1.0.0"

APP_DESCRIPTION = """
AI-powered Project Research Assistant using:

- Retrieval Augmented Generation (RAG)
- Google Gemini LLM
- ChromaDB Vector Database
- Document Processing
- Academic Research Paper Search
- Adaptive Question Routing
"""


# --------------------------------------------------
# Application lifespan
# --------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):

    logger.info(
        "Starting Project Research Assistant AI Service..."
    )

    # Validate environment configuration

    gemini_api_key = os.getenv(
        "GEMINI_API_KEY"
    )

    if not gemini_api_key:
        logger.warning(
            "GEMINI_API_KEY is missing. "
            "LLM features may not work."
        )

    # Create required directories

    directories = [
        "uploads/pdf",
        "uploads/pptx",
        "uploads/docx",
        "chroma_db"
    ]

    for directory in directories:

        os.makedirs(
            directory,
            exist_ok=True
        )

    logger.info(
        "Required directories initialized."
    )

    logger.info(
        "AI Service startup completed."
    )

    yield

    # Application shutdown

    logger.info(
        "Shutting down Project Research Assistant AI Service..."
    )


# --------------------------------------------------
# Create FastAPI application
# --------------------------------------------------

app = FastAPI(
    title=APP_NAME,
    description=APP_DESCRIPTION,
    version=APP_VERSION,
    lifespan=lifespan
)


# --------------------------------------------------
# CORS configuration
# --------------------------------------------------

allowed_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,"
    "http://127.0.0.1:3000,"
    "http://localhost:5500,"
    "http://127.0.0.1:5500"
).split(",")

allowed_origins = [
    origin.strip()
    for origin in allowed_origins
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=[
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "OPTIONS"
    ],
    allow_headers=["*"]
)


# --------------------------------------------------
# Global exception handler
# --------------------------------------------------

@app.exception_handler(Exception)
async def global_exception_handler(
    request: Request,
    exc: Exception
):

    logger.exception(
        "Unhandled error on %s %s",
        request.method,
        request.url.path
    )

    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "Internal AI service error."
        }
    )


# --------------------------------------------------
# Register API routes
# --------------------------------------------------

app.include_router(
    ingestion_router,
    prefix="/ingestion",
    tags=["Document Ingestion"]
)

app.include_router(
    chat_router,
    prefix="/chat",
    tags=["AI Chat"]
)

app.include_router(
    research_router,
    prefix="/research",
    tags=["Academic Research"]
)


# --------------------------------------------------
# Root route
# --------------------------------------------------

@app.get("/")
async def root():

    return {
        "success": True,
        "message": (
            "Welcome to Project Research "
            "Assistant AI Service"
        ),
        "version": APP_VERSION,
        "status": "running"
    }


# --------------------------------------------------
# Health check route
# --------------------------------------------------

@app.get("/health")
async def health_check():

    return {
        "success": True,
        "service": "ai-service",
        "status": "healthy",
        "version": APP_VERSION
    }


# --------------------------------------------------
# Service information route
# --------------------------------------------------

@app.get("/info")
async def service_info():

    return {
        "success": True,
        "application": APP_NAME,
        "version": APP_VERSION,
        "features": [
            "Document Ingestion",
            "PDF Processing",
            "PPTX Processing",
            "DOCX Processing",
            "RAG Question Answering",
            "Gemini LLM Fallback",
            "Adaptive Question Routing",
            "Academic Paper Search",
            "ChromaDB Vector Search"
        ],
        "endpoints": {
            "root": "/",
            "health": "/health",
            "documentation": "/docs",
            "ingestion": "/ingestion",
            "chat": "/chat",
            "research": "/research"
        }
    }


# --------------------------------------------------
# Run application
# --------------------------------------------------

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=int(
            os.getenv("AI_SERVICE_PORT", 8000)
        ),
        reload=True
    )