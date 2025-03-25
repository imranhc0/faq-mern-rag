import { OpenAIEmbeddings } from "@langchain/openai";
import { MongoDBAtlasVectorSearch } from '@langchain/mongodb'
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URI);
const dbName = "faq_rag";
const collectionName = "embeddings";
export const collection = mongoClient.db(dbName).collection(collectionName);

// 🔹 Function to Chunk & Store Embeddings
export const storeEmbeddings = async (docs, fileId) => {
  try {
    // Split text into chunks (optimal for retrieval)
    const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
    const chunks = await splitter.splitDocuments(docs);

    console.log(chunks);

    // Convert chunks to embeddings
    const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-large",
      apiKey: process.env.OPENAI_API_KEY,
    });
    const vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
      collection: collection,
      indexName: "vector_index",
      textKey: "text",
      embeddingKey: "embedding",
    })

    // Store embeddings with metadata (file reference)
    await vectorStore.addDocuments(chunks);

    console.log("Embeddings stored successfully.");
  } catch (error) {
    console.error(error);
    console.error("Embedding storage failed:", error);
  }
};
