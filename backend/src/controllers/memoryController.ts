/**
 * 🧠 CONTROLLERS/MEMORYCONTROLLER - The "Memory Waiter"
 *
 * This controller receives requests from the frontend, calls the
 * appropriate service, and sends a response back.
 */
import { Request, Response } from 'express';
import { MemoryService } from '../services/memoryService';

export class MemoryController {
  /**
   * Handles the request to add a new memory.
   */
  static async addMemory(req: Request, res: Response): Promise<void> {
    try {
      // The user object is attached by our `authenticateToken` middleware
      const user = req.user!;
      const { content } = req.body;

      // Call the service to handle the business logic
      const result = await MemoryService.addMemory(content, user.id);

      if (result.success) {
        res.status(201).json(result);
      } else {
        // Send a 400 Bad Request status if something was wrong with the input
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Add memory controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
  static async searchMemories(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const { query } = req.body; // We'll get the query from the request body

      const result = await MemoryService.searchMemories(query, user.id);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Search memories controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
    /**
   * Handles AI Q&A requests
   */
    static async askQuestion(req: Request, res: Response): Promise<void> {
      try {
        const user = req.user!;
        const { question } = req.body;
  
        if (!question || question.trim() === '') {
          res.status(400).json({
            success: false,
            message: 'Question is required.',
          });
          return;
        }
  
        const result = await MemoryService.askQuestion(question, user.id);
  
        if (result.success) {
          res.status(200).json(result);
        } else {
          res.status(400).json(result);
        }
      } catch (error) {
        console.error('Ask question controller error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error',
        });
      }
    }

    /**
     * Handles email schema generation requests
     */
    static async generateEmailSchema(req: Request, res: Response): Promise<void> {
      try {
        const user = req.user!;
        const { prompt } = req.body;
  
        if (!prompt || prompt.trim() === '') {
          res.status(400).json({
            success: false,
            message: 'Email generation prompt is required.',
          });
          return;
        }
  
        const result = await MemoryService.generateEmailSchema(prompt, user.id);
  
        if (result.success) {
          res.status(200).json(result);
        } else {
          res.status(400).json(result);
        }
      } catch (error) {
        console.error('Generate email schema controller error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error',
        });
      }
    }
}