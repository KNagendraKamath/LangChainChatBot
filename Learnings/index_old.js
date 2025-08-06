import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { createClient } from '@supabase/supabase-js'
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase'
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import 'dotenv/config'
import * as fs from 'fs/promises'
import path from 'path'

try {
  // Read the local file using fs instead of fetch
  const filePath = path.join(process.cwd(), 'cockpit.txt')
  const text = await fs.readFile(filePath, 'utf-8')

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize:500,
    chunkOverlap:50,
    separators: ['\n\n', '\n', ' ', '']})
  const output = await splitter.createDocuments([text])
  
  const sbApiKey = process.env.SUPABASE_API_KEY
  const sbUrl = process.env.SUPABASE_URL
  
  const client = createClient(sbUrl, sbApiKey)

  const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "models/gemini-embedding-001",
    apiKey: process.env.GEMINI_API_KEY,
    taskType:TaskType.RETRIEVAL_DOCUMENT
  });

  await SupabaseVectorStore.fromDocuments(
    output,
    embeddings,
    {
        client,
        tableName: 'documents',
    })

  console.log("Documents successfully embedded and stored in Supabase");

} catch (err) {
  console.log(err)
}