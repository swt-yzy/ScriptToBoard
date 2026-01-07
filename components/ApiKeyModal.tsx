
import React from 'react';

interface ApiKeyModalProps {
  onConfirm: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onConfirm }) => {
  const handleSelectKey = async () => {
    try {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      onConfirm();
    } catch (err) {
      console.error("Failed to open key selection", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="max-w-md w-full glass p-8 rounded-2xl shadow-2xl border border-blue-500/30">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-key text-2xl text-white"></i>
          </div>
          <h2 className="text-2xl font-bold mb-2">API Key Required</h2>
          <p className="text-slate-400 text-sm">
            To generate high-quality storyboard images with Gemini 3 Pro, you must select an API key from a paid Google Cloud project.
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={handleSelectKey}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <i className="fas fa-external-link-alt"></i>
            Select API Key
          </button>
          
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block text-center text-xs text-blue-400 hover:underline"
          >
            Learn about Gemini API billing
          </a>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
