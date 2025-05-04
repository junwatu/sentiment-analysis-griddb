import React, { useState } from 'react';
import { initializeOpenAI } from './sentimentService';

interface OpenAISetupProps {
  onSetup: () => void;
}

const OpenAISetup: React.FC<OpenAISetupProps> = ({ onSetup }) => {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!apiKey.trim().startsWith('sk-')) {
      setError('Please enter a valid OpenAI API key starting with "sk-"');
      return;
    }

    setIsLoading(true);
    
    try {
      initializeOpenAI(apiKey);
      onSetup();
    } catch (err: any) {
      setError(err.message || 'Failed to initialize OpenAI');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    // Skip OpenAI setup and use mock data
    onSetup();
  };

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6">Set Up OpenAI</h2>
      
      <p className="mb-4 text-gray-600">
        To analyze sentiment with OpenAI, please enter your API key below. 
        Your key is only stored locally in memory and is never sent to any server other than OpenAI.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
            OpenAI API Key
          </label>
          <input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="sk-..."
          />
        </div>
        
        {error && (
          <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
            {error}
          </div>
        )}
        
        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
          >
            {isLoading ? 'Setting Up...' : 'Continue'}
          </button>
          
          <button
            type="button"
            onClick={handleSkip}
            className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
          >
            Use Demo Mode
          </button>
        </div>
      </form>
      
      <p className="mt-4 text-xs text-gray-500">
        Don't have an API key? 
        <a 
          href="https://platform.openai.com/api-keys" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline ml-1"
        >
          Get one from OpenAI
        </a>
      </p>
    </div>
  );
};

export default OpenAISetup;