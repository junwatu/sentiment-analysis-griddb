import React, { useState } from 'react';
import SentimentAnalysis from './components/SentimentAnalysis';
import OpenAISetup from './services/OpenAISetup';

function App() {
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  const handleSetupComplete = () => {
    setIsSetupComplete(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      {!isSetupComplete ? (
        <OpenAISetup onSetup={handleSetupComplete} />
      ) : (
        <SentimentAnalysis />
      )}
    </div>
  );
}

export default App;