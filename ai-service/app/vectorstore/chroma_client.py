import os
import uuid

import chromadb

from embeddings.embedding_service import embedding_service


# ChromaDB configuration

CHROMA_DB_PATH = os.getenv(
    "CHROMA_DB_PATH",
    "./chroma_db"
)

COLLECTION_NAME = "project_documents"


class ChromaClient:
    """
    Handles ChromaDB operations.

    Features:
    1. Connect to ChromaDB
    2. Create or load collection
    3. Store document chunks
    4. Search relevant chunks
    5. Delete document embeddings
    6. Get collection information
    """

    def __init__(self):

        try:

            # Create persistent ChromaDB client

            self.client = chromadb.PersistentClient(
                path=CHROMA_DB_PATH
            )

            # Create collection if it does not exist

            self.collection = (
                self.client.get_or_create_collection(
                    name=COLLECTION_NAME,
                    metadata={
                        "hnsw:space": "cosine"
                    }
                )
            )

            print(
                "✅ ChromaDB connected successfully"
            )

        except Exception as error:

            print(
                "❌ ChromaDB Connection Error:",
                error
            )

            raise


    def add_documents(
        self,
        document_id,
        chunks,
        file_name,
        file_type,
        user_id=None
    ):
        """
        Store document chunks and embeddings.

        Each chunk contains:
        - Unique chunk ID
        - Text content
        - Embedding
        - Metadata
        """

        try:

            if not document_id:
                raise ValueError(
                    "Document ID is required."
                )

            if not chunks:
                raise ValueError(
                    "No chunks provided."
                )

            documents = []
            metadatas = []
            ids = []

            for index, chunk in enumerate(chunks):

                content = chunk.get(
                    "content",
                    ""
                )

                if not isinstance(content, str):
                    content = str(content)

                content = content.strip()

                if not content:
                    continue

                # Generate unique chunk ID

                chunk_id = (
                    f"{document_id}_"
                    f"{index}_"
                    f"{uuid.uuid4().hex[:8]}"
                )

                # Create metadata

                metadata = {
                    "document_id": str(document_id),
                    "file_name": str(file_name),
                    "file_type": str(file_type),
                    "chunk_index": index
                }

                if user_id is not None:
                    metadata["user_id"] = str(
                        user_id
                    )

                # Copy supported chunk metadata

                for key in [
                    "page_number",
                    "slide_number",
                    "element_type",
                    "style",
                    "table_number",
                    "image_number"
                ]:

                    value = chunk.get(key)

                    if isinstance(
                        value,
                        (str, int, float, bool)
                    ):
                        metadata[key] = value

                documents.append(content)

                metadatas.append(metadata)

                ids.append(chunk_id)

            if not documents:
                raise ValueError(
                    "No valid text chunks found."
                )

            # Generate embeddings for all chunks

            embeddings = (
                embedding_service.generate_embeddings(
                    documents
                )
            )

            # Store in ChromaDB

            self.collection.add(
                ids=ids,
                documents=documents,
                embeddings=embeddings,
                metadatas=metadatas
            )

            print(
                f"✅ Stored {len(documents)} chunks "
                f"for document {document_id}"
            )

            return {
                "success": True,
                "document_id": str(document_id),
                "chunks_stored": len(documents),
                "chunk_ids": ids
            }

        except Exception as error:

            print(
                "❌ ChromaDB Add Documents Error:",
                error
            )

            raise


    def search_documents(
        self,
        query,
        top_k=5,
        document_id=None,
        user_id=None
    ):
        """
        Search relevant document chunks.

        Supports filtering by:
        - Document ID
        - User ID
        """

        try:

            if not query or not query.strip():
                raise ValueError(
                    "Search query cannot be empty."
                )

            if top_k < 1:
                raise ValueError(
                    "top_k must be at least 1."
                )

            if self.collection.count() == 0:
                return []

            # Generate query embedding

            query_embedding = (
                embedding_service.generate_embedding(
                    query
                )
            )

            # Create metadata filters

            filters = []

            if document_id is not None:

                filters.append({
                    "document_id": str(document_id)
                })

            if user_id is not None:

                filters.append({
                    "user_id": str(user_id)
                })

            where_filter = None

            if len(filters) == 1:
                where_filter = filters[0]

            elif len(filters) > 1:
                where_filter = {
                    "$and": filters
                }

            # Query ChromaDB

            results = self.collection.query(
                query_embeddings=[
                    query_embedding
                ],
                n_results=top_k,
                where=where_filter,
                include=[
                    "documents",
                    "metadatas",
                    "distances"
                ]
            )

            retrieved_documents = []

            result_ids = results.get(
                "ids",
                [[]]
            )[0]

            result_documents = results.get(
                "documents",
                [[]]
            )[0]

            result_metadatas = results.get(
                "metadatas",
                [[]]
            )[0]

            result_distances = results.get(
                "distances",
                [[]]
            )[0]

            for index, content in enumerate(
                result_documents
            ):

                distance = result_distances[index]

                # Cosine distance:
                # Lower distance means more similar.

                similarity = max(
                    0.0,
                    min(1.0, 1.0 - distance)
                )

                retrieved_documents.append({
                    "id": result_ids[index],
                    "content": content,
                    "metadata": result_metadatas[index],
                    "distance": distance,
                    "similarity_score": round(
                        similarity,
                        4
                    )
                })

            return retrieved_documents

        except Exception as error:

            print(
                "❌ ChromaDB Search Error:",
                error
            )

            raise


    def get_document_chunks(
        self,
        document_id,
        user_id=None
    ):
        """
        Retrieve all stored chunks
        belonging to a document.
        """

        try:

            filters = [
                {
                    "document_id": str(document_id)
                }
            ]

            if user_id is not None:

                filters.append({
                    "user_id": str(user_id)
                })

            where_filter = (
                filters[0]
                if len(filters) == 1
                else {"$and": filters}
            )

            results = self.collection.get(
                where=where_filter,
                include=[
                    "documents",
                    "metadatas"
                ]
            )

            chunks = []

            for index, chunk_id in enumerate(
                results["ids"]
            ):

                chunks.append({
                    "id": chunk_id,
                    "content": results["documents"][index],
                    "metadata": results["metadatas"][index]
                })

            return chunks

        except Exception as error:

            print(
                "❌ Get Document Chunks Error:",
                error
            )

            raise


    def delete_document(
        self,
        document_id,
        user_id=None
    ):
        """
        Delete all embeddings and chunks
        associated with a document.
        """

        try:

            if not document_id:
                raise ValueError(
                    "Document ID is required."
                )

            filters = [
                {
                    "document_id": str(document_id)
                }
            ]

            if user_id is not None:

                filters.append({
                    "user_id": str(user_id)
                })

            where_filter = (
                filters[0]
                if len(filters) == 1
                else {"$and": filters}
            )

            # Delete matching document chunks

            self.collection.delete(
                where=where_filter
            )

            print(
                f"✅ Deleted document {document_id} "
                "from ChromaDB"
            )

            return {
                "success": True,
                "document_id": str(document_id),
                "message": "Document chunks deleted."
            }

        except Exception as error:

            print(
                "❌ ChromaDB Delete Error:",
                error
            )

            raise


    def get_collection_info(self):
        """
        Return ChromaDB collection details.
        """

        try:

            return {
                "collection_name": COLLECTION_NAME,
                "total_chunks": self.collection.count(),
                "database_path": CHROMA_DB_PATH
            }

        except Exception as error:

            print(
                "❌ Collection Info Error:",
                error
            )

            raise


# Create a reusable ChromaDB instance

chroma_client = ChromaClient()