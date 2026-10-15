from app.vectorstore.retriever import (
    retrieve_documents,
    retrieve_relevant_documents,
    retrieve_document_context
)


question = "What is Retrieval Augmented Generation?"


# Retrieve document chunks

documents = retrieve_documents(
    question=question,
    top_k=5,
    document_id="test_document_1",
    user_id="test_user_1"
)

print("Retrieved Documents:", documents)


# Retrieve relevant documents

relevant_documents = retrieve_relevant_documents(
    question=question,
    top_k=5,
    document_id="test_document_1",
    user_id="test_user_1"
)

print("Relevant Documents:", relevant_documents)


# Retrieve combined context

context = retrieve_document_context(
    question=question,
    top_k=5,
    document_id="test_document_1",
    user_id="test_user_1"
)

print("Context:", context)