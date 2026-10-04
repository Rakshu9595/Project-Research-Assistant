from vectorstore.retriever import retrieve_documents

from llm.llm_client import generate_response

from rag.prompt import (
    RAG_SYSTEM_PROMPT,
    create_rag_prompt
)

from rag.citation import (
    create_citations,
    add_citations_to_answer
)


def run_rag_pipeline(
    question,
    top_k=5
):
    """
    Run the complete RAG pipeline.

    Flow:
    Question
        ↓
    Retriever
        ↓
    Retrieved Documents
        ↓
    RAG Prompt
        ↓
    LLM
        ↓
    Citations
        ↓
    Final Answer
    """

    try:

        # 1. Validate question
    

        if not question or not question.strip():

            raise ValueError(
                "Question cannot be empty."
            )

        question = question.strip()

       
        # 2. Retrieve relevant documents
        

        retrieved_documents = retrieve_documents(
            question,
            top_k=top_k
        )

      
        # 3. Check whether documents were retrieved
       

        if not retrieved_documents:

            return {
                "answer": (
                    "The information is not available "
                    "in the uploaded documents."
                ),
                "context": [],
                "sources": [],
                "source": "rag",
                "retrieved": False
            }

       
        # 4. Create RAG prompt
        

        rag_prompt = create_rag_prompt(
            question=question,
            context=retrieved_documents
        )

     
        # 5. Generate answer using LLM
        

        answer = generate_response(
            system_prompt=RAG_SYSTEM_PROMPT,
            user_prompt=rag_prompt
        )

       
        # 6. Create citations
        

        citations = create_citations(
            retrieved_documents
        )

       
        # 7. Add citations to answer
       

        final_answer = add_citations_to_answer(
            answer,
            citations
        )

   
        # 8. Return final result
       

        return {
            "answer": final_answer,
            "context": retrieved_documents,
            "sources": citations,
            "source": "rag",
            "retrieved": True
        }

    except Exception as error:

        print(
            "❌ RAG Pipeline Error:",
            error
        )

        raise Exception(
            f"RAG pipeline failed: {str(error)}"
        )