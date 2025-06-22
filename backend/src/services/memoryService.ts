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
   * Ask AI questions about your memories
   * @param question - The user's question
   * @param userId - The ID of the user asking the question
   * @returns AI-generated answer based on user's memories
   */
  static async askQuestion(question: string, userId: string): Promise<ApiResponse<{ answer: string; question: string }>> {
    if (!question || question.trim() === '') {
      return { success: false, message: 'Question cannot be empty.' };
    }

    try {
      console.log(`User ${userId} asked: "${question}"`);

      // Step 1: Search user's memories for relevant context
      const searchResult = await this.searchMemories(question, userId);
      
      if (!searchResult.success || !searchResult.data?.results?.length) {
        console.log(`❌ No memories found for question`);
        return { 
          success: false, 
          message: 'No relevant memories found to answer your question.' 
        };  
      }

   // Step 2: Optimize context - take only top 3 most relevant memories
      const allMemories = searchResult.data.results;
      console.log(`📚 Found ${allMemories.length} total memories`);
      
    // Take only the top 3 most relevant memories
    const sortedMemories = allMemories.sort((a: any, b: any) => (b.score || 0) - (a.score || 0));
    const topMemories = sortedMemories.slice(0, 3);
    let context = topMemories
      .map((memory: any) => {
        if (memory.chunks && memory.chunks.length > 0) {
          return memory.chunks.map((chunk: any) => chunk.content).join(' ');
        }
        return memory.content || '';
      })
      .filter(content => content.trim() !== '')
      .join('\n\n');

    // Ensure context is at least 1000 characters by adding more memories if needed
    if (context.length < 1000 && allMemories.length > 3) {
      const additionalMemories = allMemories.slice(3);
      for (const memory of additionalMemories) {
        const memoryContent = memory.chunks && memory.chunks.length > 0
          ? memory.chunks.map((chunk: any) => chunk.content).join(' ')
          : memory.content || '';
        
        if (memoryContent.trim() !== '') {
          context += '\n\n' + memoryContent;
          if (context.length >= 1000) break;
        }
      }
    }

    console.log(`\n📝 Optimized context (${context.length} chars):`);
    console.log(`"${context}"`);

      // Step 3: Call OpenRouter API directly

      const systemPrompt = `You are a helpful personal assistant that answers questions based on the user's personal memories.

      CONTEXT - User's memories:
      ${context}

      INSTRUCTIONS:
      - Use the information from the memories above to answer the question
      - Be specific and reference details from the memories when possible
      - If the memories contain relevant information, provide a helpful answer
      - If the memories don't contain enough information, say "I don't have enough information in your memories to answer that question completely"
      - Keep your answer concise and focused on what's in the memories`;

      const userPrompt = `Question: ${question}

      Please answer based ONLY on the memories provided above.`;
      
      console.log(`\n🤖 Sending to OpenRouter:`);
      console.log(`System prompt: "${systemPrompt.substring(0, 200)}..."`);
      console.log(`User prompt: "${userPrompt}"`);
      
      const openrouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.openrouter.apiKey}`,
          'HTTP-Referer': 'http://localhost:3000', // Your frontend URL
          'X-Title': 'Memory Q&A System', // Your app name
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-001', // Start with cheaper model
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user', 
              content: userPrompt
            }
          ],
          max_tokens: 500, // Limit response length
          temperature: 1, // Balanced creativity
        }),
      });

      if (!openrouterResponse.ok) {
        const errorText = await openrouterResponse.text();
        console.error(`❌ OpenRouter API error: ${openrouterResponse.status} - ${errorText}`);
        throw new Error(`OpenRouter API error: ${openrouterResponse.status}`);
      }

      const aiData = await openrouterResponse.json();
      const answer = aiData.choices?.[0]?.message?.content || 'Sorry, I could not generate an answer.';

      // Step 4: Save the question for future reference (optional but recommended) - DO ODKOMENTOWANIA EWENTUALNIE 
      // await this.saveQuestionHistory(question, userId);

      console.log(`Generated answer for user ${userId}:`, answer.substring(0, 100) + '...');

      return {
        success: true,
        message: 'Answer generated successfully!',
        data: { 
          answer,
          question // Changed from 'query' to 'question' for clarity
        },
      };
    } catch (error) {
      console.error('Error generating AI answer:', error);
      return { success: false, message: 'Failed to generate answer.' };
    }
  }
  
  static async saveQuestionHistory(question: string, userId: string): Promise<void> {
    try {
      // Save to a separate "questions" collection or with a special tag
      await memoryClient.memories.add({
        content: `Question: ${question}`,
        containerTags: [userId, 'question-history'], // Special tag for questions
      });
    } catch (error) {
      console.error('Failed to save question history:', error);
      // Don't fail the main request if this fails
    }
  }

}
