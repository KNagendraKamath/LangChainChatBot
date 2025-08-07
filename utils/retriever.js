import { createClient } from '@supabase/supabase-js'
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase'
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";    

  
  const sbApiKey = import.meta.env.VITE_SUPABASE_API_KEY
  const sbUrl = import.meta.env.VITE_SUPABASE_URL
  const GeminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const client = createClient(sbUrl, sbApiKey)

  const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "models/gemini-embedding-001",
    apiKey: GeminiApiKey,
    taskType:TaskType.RETRIEVAL_DOCUMENT
  });

  const vectorStore = new SupabaseVectorStore(
    embeddings,
    {
        client,
        tableName: 'documents',
        queryName: 'match_documents'
    })

const retriever = vectorStore.asRetriever()

export { retriever };