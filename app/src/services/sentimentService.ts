// Define the type for sentiment analysis result
export interface SentimentAnalysisResult {
  label?: string;
  predicted_rating?: number;
  confidence?: number;
  error?: string;
}

// Function to analyze review sentiment
export async function analyzeReviewSentiment(
  title: string, 
  text: string
): Promise<SentimentAnalysisResult> {
  if (!text.trim() && !title.trim()) {
    throw new Error('Please supply at least a review title or body text.');
  }

  try {
    const response = await fetch('http://localhost:3001/api/sentiment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, text })
    });
    const data = await response.json();
    return data;
  } catch (error: unknown) {
    let errorMessage = 'Failed to analyze sentiment.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    console.error('[Sentiment API] Error:', errorMessage);
    return { error: errorMessage };
  }
}