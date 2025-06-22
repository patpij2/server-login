/**
 * 🧠 MEMORY-RELATED TYPES
 * 
 * This file defines all memory-related TypeScript interfaces
 */

/**
 * Memory - Basic memory structure
 */
export interface Memory {
  id: string;
  content: string;
  userId: string;
  created_at: string;
}

/**
 * MemoryRequest - What the frontend sends when adding a memory
 */
export interface MemoryRequest {
  content: string;
}

/**
 * SearchRequest - What the frontend sends when searching memories
 */
export interface SearchRequest {
  query: string;
}

/**
 * QuestionRequest - What the frontend sends when asking a question
 */
export interface QuestionRequest {
  question: string;
}

/**
 * MemoryResponse - What we send back for memory operations
 */
export interface MemoryResponse {
  success: boolean;
  message: string;
  data?: {
    memoryId?: string;
    memories?: any[];
    answer?: string;
    question?: string;
  };
}

/**
 * SearchResult - Structure of search results from Supermemory
 */
export interface SearchResult {
  results: Array<{
    id: string;
    content: string;
    score: number;
    chunks?: Array<{
      content: string;
    }>;
  }>;
} 