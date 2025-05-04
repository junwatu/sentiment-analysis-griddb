import React, { useState } from 'react';
import { analyzeReviewSentiment } from '../services/sentimentService';
import ResultDisplay from './ResultDisplay';

export interface SentimentResult {
  label?: string;
  predicted_rating?: number;
  confidence?: number;
  error?: string;
}

const SentimentAnalysis: React.FC = () => {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [result, setResult] = useState<SentimentResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAnalyze() {
    if (!title.trim() && !text.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const data = await analyzeReviewSentiment(title, text);
      setResult(data);
    } catch (err: unknown) {
      let errorMessage = 'Failed to analyze sentiment';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setResult({ error: errorMessage });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
      <div className="bg-blue-600 p-6 text-white">
        <h1 className="text-3xl font-extrabold text-center">Sentiment Analyzer</h1>
        <p className="text-center mt-2 text-blue-100">See if a review is positive, neutral, or negative.</p>
      </div>
      
      <div className="p-8 space-y-6">
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Review Title</label>
          <input
            id="title"
            type="text"
            placeholder="Enter review title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="review" className="block text-sm font-medium text-gray-700">Review Text</label>
          <textarea
            id="review"
            className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            placeholder="Write your review here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading || (!text.trim() && !title.trim())}
          className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all duration-200 transform hover:translate-y-[-2px] active:translate-y-[0px]"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </span>
          ) : 'Check Sentiment'}
        </button>

        {result && <ResultDisplay result={result} />}
      </div>
    </div>
  );
};

export default SentimentAnalysis;