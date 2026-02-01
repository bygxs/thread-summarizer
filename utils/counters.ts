
export const calculateStats = (text: string) => {
  const trimmedText = text.trim();
  if (!trimmedText) return { wordCount: 0, charCount: 0, tokenCountEstimate: 0 };

  const wordCount = trimmedText.split(/\s+/).length;
  const charCount = trimmedText.length;
  
  /**
   * Token estimation:
   * Most LLM tokenizers average roughly 4 characters per token for English.
   * Or roughly 0.75 words per token.
   * We'll use a weighted average approach for a more realistic estimate.
   */
  const tokenCountEstimate = Math.ceil((charCount / 4 + wordCount * 1.3) / 2);

  return {
    wordCount,
    charCount,
    tokenCountEstimate
  };
};
