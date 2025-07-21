import { useState, useCallback } from 'react';
import { generateContent } from '../services/geminiService';

export const useGemini = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [response, setResponse] = useState<string>('');

  const generate = useCallback(async (prompt: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await generateContent(prompt);
      setResponse(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to generate content');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    generate,
    response,
    isLoading,
    error,
  };
};
