import React from 'react';
import { SentimentResult } from './SentimentAnalysis';
import StarRating from './StarRating';

interface ResultDisplayProps {
  result: SentimentResult;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  if (result.error) {
    return (
      <div className="text-center p-4 bg-red-50 border border-red-100 rounded-lg">
        <p className="text-red-600 font-medium">{result.error}</p>
      </div>
    );
  }

  if (!result.label) return null;

  const getLabelColor = () => {
    switch (result.label) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const getConfidenceColor = () => {
    const confidence = result.confidence || 0;
    if (confidence > 0.8) return 'bg-green-500';
    if (confidence > 0.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="mt-6 space-y-6 animate-fadeIn">
      <div className="p-6 bg-gray-50 rounded-xl">
        <div className="text-center space-y-6">
          <div>
            <div className="text-lg font-semibold text-gray-600">Sentiment</div>
            <p className={`text-3xl font-bold capitalize mt-1 ${getLabelColor()}`}>
              {result.label}
            </p>
          </div>

          <div>
            <div className="text-lg font-semibold text-gray-600">Rating</div>
            <div className="flex justify-center gap-1 mt-2">
              <StarRating rating={result.predicted_rating || 0} />
            </div>
          </div>

          <div>
            <div className="text-lg font-semibold text-gray-600">Confidence</div>
            <div className="mt-2 flex flex-col items-center">
              <p className="text-xl font-bold">
                {((result.confidence || 0) * 100).toFixed(1)}%
              </p>
              <div className="w-full max-w-xs h-3 bg-gray-200 rounded-full mt-2 overflow-hidden">
                <div 
                  className={`h-full ${getConfidenceColor()} transition-all duration-500 ease-out`}
                  style={{ width: `${(result.confidence || 0) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;