import { Upload, Send, Loader2 } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useState, useRef, useEffect } from 'react';
import FileUploadModal from './FileUploadModal';

const MainContent = () => {
  const { currentAuditId } = useUIStore();
  const [message, setMessage] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message]);

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log('Sending:', message);
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (files: File[]) => {
    console.log('Files uploaded:', files);
    // TODO: Send files to backend
  };

  if (!currentAuditId) {
    return (
      <>
        <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="text-center max-w-md px-4">
            <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Upload className="w-10 h-10 text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Welcome to TrustGuard Nexus
            </h2>
            <p className="text-gray-600 mb-6">
              Start a new AI system audit by uploading your documentation, model artifacts, and configuration files.
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Upload Files to Start Audit
            </button>
          </div>
        </div>

        {showUploadModal && (
          <FileUploadModal
            onClose={() => setShowUploadModal(false)}
            onUpload={handleFileUpload}
          />
        )}
      </>
    );
  }

  const mockMessages = [
    {
      type: 'system',
      content: 'Audit session started. Please upload your AI system documentation.',
      timestamp: '10:30 AM',
    },
    {
      type: 'user',
      content: 'Uploaded: model_architecture.pdf, training_data.csv, deployment_config.json',
      timestamp: '10:32 AM',
    },
    {
      type: 'agent',
      content: 'Files received. Analyzing system architecture... Running governance module.',
      timestamp: '10:33 AM',
    },
    {
      type: 'system',
      content: '✓ Governance module completed (Score: 85/100)',
      timestamp: '10:35 AM',
    },
    {
      type: 'agent',
      content: 'Identified potential bias in training data distribution. Running fairness assessment...',
      timestamp: '10:36 AM',
    },
  ];

  return (
    <>
      <div className="h-full flex flex-col bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                FinanceBot AI System Audit
              </h2>
              <p className="text-sm text-gray-500">
                <span className="inline-flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Processing...
                </span>
              </p>
            </div>

            <button
              onClick={() => setShowUploadModal(true)}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
            >
              <Upload className="w-4 h-4" />
              Add Files
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {mockMessages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-3 ${msg.type === 'user'
                  ? 'bg-teal-600 text-white'
                  : msg.type === 'system'
                    ? 'bg-blue-50 text-blue-900 border border-blue-200'
                    : 'bg-gray-100 text-gray-900'
                  }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className={`text-xs mt-1 ${msg.type === 'user' ? 'text-teal-100' : 'text-gray-500'
                  }`}>
                  {msg.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex items-end gap-3">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question or provide additional context..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none overflow-hidden"
              style={{
                minHeight: '44px',
                maxHeight: '200px',
              }}
              rows={1}
            />
            <button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-colors flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>

      {showUploadModal && (
        <FileUploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={handleFileUpload}
        />
      )}
    </>
  );
};

export default MainContent;