/**
 * 🧠 SERVICES/MEMORYSERVICE - The "Memory Kitchen"
 *
 * This service handles all the business logic for interacting
 * with the Supermemory.ai API.
 */
import Supermemory from 'supermemory';
import { config } from '../config/environment';
import { ApiResponse } from '../models/types';

// Initialize the Supermemory client once
const memoryClient = new Supermemory({
  apiKey: config.supermemory.apiKey,
});

export class MemoryService {
  /**
   * Adds a new memory to Supermemory.ai
   * @param content - The text content to save as a memory.
   * @param userId - The ID of the user who is creating the memory.
   * @returns A response object indicating success or failure.
   */
  static async addMemory(content: string, userId: string): Promise<ApiResponse<{ memoryId: string }>> {
    // Basic validation
    if (!content || content.trim() === '') {
      return { success: false, message: 'Memory content cannot be empty.' };
    }

    try {
      console.log(`Sending memory to Supermemory for user: ${userId}`);

      // Call the Supermemory API
      const response = await memoryClient.memories.add({
        content: content,
        containerTags: [userId],
      });

      console.log('Successfully added memory with ID:', response.id);

      return {
        success: true,
        message: 'Memory added successfully!',
        data: { memoryId: response.id },
      };
    } catch (error) {
      console.error('Error adding memory to Supermemory:', error);
      return { success: false, message: 'Failed to add memory.' };
    }
  }

  static async searchMemories(query: string, userId: string): Promise<ApiResponse<any>> {
    if (!query || query.trim() === '') {
      return { success: false, message: 'Search query cannot be empty.' };
    }

    try {
      console.log(`Searching memories for query: "${query}" for user: ${userId}`);

      // Call the Supermemory search API.
      // We use `containerTags` to ensure the search is only for this specific user.
      const searchResults = await memoryClient.search.execute({
        q: query,
        containerTags: [userId], // ⬅️ IMPORTANT: This isolates the search to the user!
      });

      console.log(`Found ${searchResults.results.length} results.`);

      return {
        success: true,
        message: 'Search completed successfully!',
        data: searchResults,
      };
    } catch (error) {
      console.error('Error searching memories in Supermemory:', error);
      return { success: false, message: 'Failed to perform search.' };
    }
  }

// We also need to update the `addMemory` function to include the containerTag
// when saving a memory. This is crucial for the search to work per user.

  /**
   * Adds a new memory to Supermemory.ai
   * @param content - The text content to save as a memory.
   * @param userId - The ID of the user who is creating the memory.
   * @returns A response object indicating success or failure.
   */


}
