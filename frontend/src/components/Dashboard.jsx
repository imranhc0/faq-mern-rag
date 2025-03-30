import { useState, useRef, useEffect } from 'react';
import TypingIndicator from './TypingIndicator';

const Dashboard = () => {
  const [files, setFiles] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedFiles, setProcessedFiles] = useState(new Set());
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Auto scroll to bottom when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    setFiles([...files, ...uploadedFiles]);
    // Reset processed status for new files
    uploadedFiles.forEach(file => {
      processedFiles.delete(file.name);
    });
    setProcessedFiles(new Set(processedFiles));
  };

  const handleProcessFiles = async () => {
    setIsProcessing(true);
    try {
      // TODO: Implement file processing API call
      for (const file of files) {
        if (!processedFiles.has(file.name)) {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Add success message
          setMessages(prev => [...prev, {
            text: `Successfully processed ${file.name}`,
            sender: 'system',
            timestamp: new Date().toISOString(),
          }]);
          
          // Mark file as processed
          setProcessedFiles(prev => new Set([...prev, file.name]));
        }
      }
    } catch (error) {
      console.error('File processing error:', error);
      setMessages(prev => [...prev, {
        text: 'Error processing files. Please try again.',
        sender: 'system',
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const simulateTyping = async (text) => {
    const words = text.split(' ');
    let currentText = '';
    
    for (const word of words) {
      currentText += word + ' ';
      setMessages(prev => [
        ...prev.slice(0, -1),
        { ...prev[prev.length - 1], text: currentText.trim() }
      ]);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMessage = {
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, newMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // TODO: Implement chat API call
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const botMessage = {
        text: 'This is a sample response from the RAG system.',
        sender: 'bot',
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
      
      // Simulate typing animation for bot's response
      await simulateTyping(botMessage.text);
    } catch (error) {
      console.error('Chat error:', error);
      setIsTyping(false);
    }
  };

  const unprocessedFiles = files.filter(file => !processedFiles.has(file.name));

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-4 sm:py-6 px-2 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="px-2 sm:px-4 py-4 sm:py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>

        {/* File Upload Section */}
        <div className="mt-4 sm:mt-8 px-2 sm:px-4 py-4 sm:py-6 bg-white shadow sm:rounded-lg">
          <div className="px-2 sm:px-4 py-3 sm:py-5">
            <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900">
              Upload Files
            </h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Upload PDF, DOC, or text files for RAG processing</p>
            </div>
            <div className="mt-4 sm:mt-5 space-y-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                multiple
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Select Files
              </button>
              {unprocessedFiles.length > 0 && (
                <button
                  onClick={handleProcessFiles}
                  disabled={isProcessing}
                  className="w-full sm:w-auto ml-0 sm:ml-3 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Extract Text & Store in Vector DB'
                  )}
                </button>
              )}
            </div>
            {files.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900">Uploaded Files:</h4>
                <ul className="mt-2 divide-y divide-gray-200">
                  {files.map((file, index) => (
                    <li key={index} className="py-2 flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-gray-500 break-all">{file.name}</span>
                      {processedFiles.has(file.name) && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Processed
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Chat Section */}
        <div className="mt-4 sm:mt-8 px-2 sm:px-4 py-4 sm:py-6 bg-white shadow sm:rounded-lg">
          <div className="px-2 sm:px-4 py-3 sm:py-5">
            <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900">
              Chat with RAG
            </h3>
            <div 
              ref={chatContainerRef}
              className="mt-4 h-[60vh] sm:h-96 overflow-y-auto border rounded-lg p-2 sm:p-4 scroll-smooth"
            >
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-3 sm:mb-4 ${
                    message.sender === 'user' ? 'text-right' : 'text-left'
                  }`}
                >
                  <div
                    className={`inline-block p-2 sm:p-3 rounded-lg max-w-[85%] sm:max-w-[70%] break-words ${
                      message.sender === 'user'
                        ? 'bg-indigo-600 text-white'
                        : message.sender === 'system'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <span className="text-sm sm:text-base">{message.text}</span>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="text-left mb-3 sm:mb-4">
                  <TypingIndicator />
                </div>
              )}
            </div>
            <form onSubmit={handleSendMessage} className="mt-4">
              <div className="flex space-x-2 sm:space-x-3">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 min-w-0 block w-full px-2 sm:px-3 py-2 text-sm sm:text-base rounded-md border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  disabled={isTyping}
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 