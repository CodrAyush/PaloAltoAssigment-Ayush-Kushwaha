// AI Service — centralized Gemini API client with fallback logic
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class AIService {
  constructor() {
    this.available = true;
    this.retryCount = 0;
    this.maxRetries = 2;
  }

  async call(prompt, options = {}) {
    try {
      const response = await fetch(`${API_URL}/api/ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          maxTokens: options.maxTokens || 2048,
          temperature: options.temperature || 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI service responded with ${response.status}`);
      }

      const data = await response.json();
      this.available = true;
      this.retryCount = 0;
      return { success: true, data: data.result };
    } catch (error) {
      console.warn('AI service error:', error.message);
      this.retryCount++;
      if (this.retryCount >= this.maxRetries) {
        this.available = false;
      }
      return { success: false, error: error.message };
    }
  }

  isAvailable() {
    return this.available;
  }

  reset() {
    this.available = true;
    this.retryCount = 0;
  }
}

export const aiService = new AIService();
export default aiService;
