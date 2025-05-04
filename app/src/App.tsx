import React, { useState } from 'react';
import SentimentAnalysis from './components/SentimentAnalysis';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <SentimentAnalysis />
    </div>
  );
}

export default App;