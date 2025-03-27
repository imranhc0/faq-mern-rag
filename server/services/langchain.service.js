import { OpenAIEmbeddings } from "@langchain/openai";
import { MongoDBAtlasVectorSearch } from '@langchain/mongodb'
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import { logger } from '../utils/logger.js';

dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URI);
const dbName = "faq_rag";
const collectionName = "embeddings";
export const collection = mongoClient.db(dbName).collection(collectionName);

export const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-large",
  apiKey: process.env.OPENAI_API_KEY,
});

export const vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
  collection: collection,
  indexName: "vector_index",
  textKey: "text",
  embeddingKey: "embedding",
})

// 🔹 Function to Chunk & Store Embeddings
export const storeEmbeddings = async (docs, fileId) => {
  try {
    // Split text into chunks (optimal for retrieval)
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ["\n\n", "\n", " ", ""], // Custom separators for better chunking
      lengthFunction: (text) => text.length,
    });
    const chunks = await splitter.splitDocuments(docs);

    // Add metadata to each chunk
    const chunksWithMetadata = chunks.map(chunk => ({
      ...chunk,
      metadata: {
        ...chunk.metadata,
        fileId,
        timestamp: new Date().toISOString(),
      }
    }));

    // Store embeddings with metadata
    await vectorStore.addDocuments(chunksWithMetadata);
    logger.info(`Successfully stored ${chunks.length} embeddings for file ${fileId}`);
  } catch (error) {
    logger.error("Embedding storage failed:", error);
    throw error;
  }
};

export const retrieveEmbeddings = async (question, k = 3) => {
  try {
    // Generate embedding for the question
    const embedding = await embeddings.embedQuery(question);

    // Perform semantic search with score
    const results = await vectorStore.similaritySearchVectorWithScore(embedding, k);

    logger.info(`Retrieved ${results.length} relevant results for query: ${question}`);
    //logger.info(`Retrieved ${filteredResults.length} relevant results for query: ${question}`);

    return results;
  } catch (error) {
    logger.error("Error in retrieveEmbeddings:", error);
    throw error;
  }
}