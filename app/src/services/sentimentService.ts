import OpenAI from 'openai';

// Define the type for sentiment analysis result
export interface SentimentAnalysisResult {
  label?: string;
  predicted_rating?: number;
  confidence?: number;
  error?: string;
}

// This would typically come from environment variables
// For demo purposes, it will be provided by the user
let OPENAI_API_KEY: string | null = null;

const SYSTEM_PROMPT = `You are a sentiment‑analysis classifier for Amazon user‑review records. You will receive one JSON object that contains the fields "title" and "text" (and sometimes "rating" which you must ignore). Your task:\n1. Read the natural‑language content (title + text).\n2. Predict the sentiment label and an estimated star rating without looking at any numeric "rating" field.\n3. Respond ONLY with a JSON object in this schema:\n{\n  "label": "positive | neutral | negative",\n  "predicted_rating": 1 | 2 | 3 | 4 | 5,\n  "confidence": 0-1\n}\nMapping rule (aligned to the Amazon Reviews dataset):\n• 1–2 stars ⇒ negative\n• 3 stars   ⇒ neutral\n• 4–5 stars ⇒ positive\nIf the review text is empty, off‑topic, or nonsense, return:\n{"label":"neutral","predicted_rating":3,"confidence":0.0}\nNever add commentary or extra keys.`;

const FEW_SHOTS = [
  {
    role: 'user',
    content: JSON.stringify({
      title: 'Rock‑solid mount',
      text:
        'I&#39;ve tried dozens of phone mounts—this one finally stays put on bumpy roads. Five minutes to install and rock‑solid!',
    }),
  },
  {
    role: 'assistant',
    content: '{"label":"positive","predicted_rating":5,"confidence":0.96}',
  },
  {
    role: 'user',
    content: JSON.stringify({
      title: 'Broke in a week',
      text:
        'Looks nice, but the zipper broke after one week and Amazon wouldn\'t replace it.',
    }),
  },
  {
    role: 'assistant',
    content: '{"label":"negative","predicted_rating":1,"confidence":0.93}',
  },
  {
    role: 'user',
    content: JSON.stringify({
      title: 'Meh',
      text:
        'These were lightweight and soft but much too small for my liking. I would have preferred two of these together to make one loc.',
    }),
  },
  {
    role: 'assistant',
    content: '{"label":"neutral","predicted_rating":3,"confidence":0.55}',
  },
];

// Function to initialize the OpenAI client with user's API key
export function initializeOpenAI(apiKey: string): void {
  OPENAI_API_KEY = apiKey;
}

// Function to analyze review sentiment
export async function analyzeReviewSentiment(
  title: string, 
  text: string
): Promise<SentimentAnalysisResult> {
  // For demo purposes, use mockResponse if no API key is set
  if (!OPENAI_API_KEY) {
    return mockSentimentAnalysis(title, text);
  }

  if (!text.trim() && !title.trim()) {
    throw new Error('Please supply at least a review title or body text.');
  }

  try {
    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
      dangerouslyAllowBrowser: true // Required for client-side usage
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...FEW_SHOTS,
        {
          role: 'user',
          content: JSON.stringify({ title, text }),
        },
      ],
    });

    const raw = completion.choices[0].message.content?.trim() || '{}';

    try {
      return JSON.parse(raw);
    } catch {
      return { error: 'Model returned invalid JSON', raw };
    }
  } catch (error: any) {
    console.error('[Sentiment API] Error:', error);
    return { error: error.message || 'Failed to analyze sentiment.' };
  }
}

// Mock sentiment analysis function for demo purposes when no API key is provided
function mockSentimentAnalysis(title: string, text: string): SentimentAnalysisResult {
  const combinedText = (title + " " + text).toLowerCase();
  
  // Simple keyword-based mock analysis
  const positiveWords = ['great', 'excellent', 'good', 'love', 'amazing', 'perfect', 'best'];
  const negativeWords = ['bad', 'terrible', 'poor', 'hate', 'worst', 'broke', 'disappointed'];
  
  let positiveScore = 0;
  let negativeScore = 0;
  
  positiveWords.forEach(word => {
    if (combinedText.includes(word)) positiveScore++;
  });
  
  negativeWords.forEach(word => {
    if (combinedText.includes(word)) negativeScore++;
  });
  
  if (positiveScore > negativeScore) {
    const rating = positiveScore > 2 ? 5 : 4;
    const confidence = 0.5 + (positiveScore * 0.1);
    return { label: 'positive', predicted_rating: rating, confidence: Math.min(confidence, 0.95) };
  } else if (negativeScore > positiveScore) {
    const rating = negativeScore > 2 ? 1 : 2;
    const confidence = 0.5 + (negativeScore * 0.1);
    return { label: 'negative', predicted_rating: rating, confidence: Math.min(confidence, 0.95) };
  } else {
    return { label: 'neutral', predicted_rating: 3, confidence: 0.5 };
  }
}