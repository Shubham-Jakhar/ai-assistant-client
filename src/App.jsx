import { useState, useEffect, useRef } from 'react';
import './App.css';

const SUGGESTED_QUERIES = [
  "What is Shubham's tech stack?",
  "Tell me about Shubham's work experience",
  "What are Shubham's top projects?",
  "Where did Shubham study?",
];

export default function App() {
  const [userQue, setUserQue] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      sender: 'assistant',
      text: "System initialized. I have indexed Shubham's resume, work history, and project portfolio. Type a command or ask a question below.",
      timeStamp: Date.now(),
    },
  ]);
  const [assistantState, setAssistantState] = useState('idle'); // 'idle' | 'listening' | 'thinking' | 'speaking'
  const [errorMessage, setErrorMessage] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to latest output
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, assistantState]);

  const fetchAnsOfUser = async (queryText) => {
    setAssistantState('thinking');
    setErrorMessage(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/ask-ai-assistant`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ data: queryText }),
        }
      );

      if (response.ok) {
        const rawData = await response.json();
        console.log(rawData.data);
        // Switch to speaking state
        setAssistantState('speaking');

        const replyText =
          typeof rawData.data === 'string'
            ? rawData.data
            : rawData.data?.answer || JSON.stringify(rawData.data);

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: 'assistant',
            text: replyText,
            timeStamp: Date.now(),
          },
        ]);

        // Return to idle after speech/rendering animation settles
        setTimeout(() => setAssistantState('idle'), 2500);
      } else {
        setErrorMessage('ERR_500: Server error, please try again shortly.');
        setAssistantState('idle');
      }
    } catch (err) {
      setErrorMessage(`ERR_NET: ${err?.message || 'Connection error'}`);
      setAssistantState('idle');
    }
  };

  const handleSendQue = (query) => {
    const textToSend = (query || userQue).trim();
    if (!textToSend || assistantState === 'thinking') return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'user',
        text: textToSend,
        timeStamp: Date.now(),
      },
    ]);

    setUserQue('');
    fetchAnsOfUser(textToSend);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendQue();
    }
  };

  // State badge style config
  const stateConfig = {
    idle: {
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      dot: 'bg-emerald-400',
      label: 'READY',
    },
    listening: {
      color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 animate-pulse',
      dot: 'bg-cyan-400 animate-ping',
      label: 'LISTENING',
    },
    thinking: {
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse',
      dot: 'bg-amber-400 animate-bounce',
      label: 'PROCESSING QUERY',
    },
    speaking: {
      color: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
      dot: 'bg-violet-400 animate-pulse',
      label: 'STREAMING OUTPUT',
    },
  }[assistantState] || {
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    dot: 'bg-emerald-400',
    label: 'READY',
  };

  return (
    <div className="min-h-screen bg-neutral-950 p-3 sm:p-6 lg:p-10 font-mono text-neutral-200 flex flex-col items-center justify-center selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Outer Terminal Container */}
      <div className="w-full max-w-4xl bg-neutral-900/95 border border-neutral-800 rounded-xl shadow-2xl shadow-black/80 backdrop-blur-md overflow-hidden flex flex-col h-[85vh]">
        
        {/* Terminal Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-neutral-950/90 border-b border-neutral-800 select-none">
          {/* Traffic Dots */}
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 border border-rose-600 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-600 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-600 inline-block" />
            <span className="ml-3 text-xs text-neutral-400 tracking-wide hidden sm:inline">
              Shubham's Ai Assistant
            </span>
          </div>

          {/* Dynamic Status Pill */}
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold border ${stateConfig.color}`}>
              <span className={`w-2 h-2 rounded-full ${stateConfig.dot}`} />
              <span>{stateConfig.label}</span>
            </div>
          </div>
        </div>

        {/* Message Log Console - Custom Dark Slim Scrollbar */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-sm leading-relaxed [scrollbar-width:thin] [scrollbar-color:#262626_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-neutral-800 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-neutral-700">
          <div className="text-xs text-neutral-500 border-b border-neutral-800/80 pb-3">
            Type commands or queries regarding skills, work history, projects, or education.
          </div>

          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <span>{isUser ? 'guest@terminal:~$' : 'shubham-ai:~$'}</span>
                  <span>
                    {new Date(msg.timeStamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div
                  className={`max-w-[85%] rounded-lg p-3 sm:p-4 text-sm whitespace-pre-wrap ${
                    isUser
                      ? 'bg-emerald-950/40 text-emerald-200 border border-emerald-800/50 shadow-sm'
                      : 'bg-neutral-800/50 text-neutral-200 border border-neutral-700/50'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}

          {/* Thinking State Indicator */}
          {assistantState === 'thinking' && (
            <div className="flex items-center gap-3 text-amber-400 bg-amber-950/20 border border-amber-900/40 rounded-lg p-3 text-xs w-fit">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="animate-pulse">Searching resume context & processing prompt...</span>
            </div>
          )}

          {/* Speaking State Indicator */}
          {assistantState === 'speaking' && (
            <div className="flex items-center gap-2 text-violet-400 bg-violet-950/20 border border-violet-900/40 rounded-lg px-3 py-2 text-xs w-fit">
              <div className="flex items-center gap-1 h-3">
                <span className="w-1 bg-violet-400 animate-pulse h-full rounded-full"></span>
                <span className="w-1 bg-violet-400 animate-pulse delay-75 h-2/3 rounded-full"></span>
                <span className="w-1 bg-violet-400 animate-pulse delay-150 h-full rounded-full"></span>
              </div>
              <span>Streaming answer...</span>
            </div>
          )}

          {errorMessage && (
            <div className="text-xs text-rose-400 bg-rose-950/30 border border-rose-900/50 p-3 rounded-lg">
              {errorMessage}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips - Hidden Horizontal Scrollbar */}
        <div className="px-4 py-2 bg-neutral-950/40 border-t border-neutral-800/80 flex gap-2 overflow-x-auto text-xs [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <span className="text-neutral-500 self-center text-[11px] whitespace-nowrap">Suggestions:</span>
          {SUGGESTED_QUERIES.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendQue(q)}
              className="px-2.5 py-1 rounded bg-neutral-800/70 hover:bg-neutral-800 text-neutral-300 hover:text-emerald-400 border border-neutral-700/60 transition whitespace-nowrap text-xs cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Terminal Input Line */}
        <div className="p-3 sm:p-4 bg-neutral-950 border-t border-neutral-800">
          <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-700/80 rounded-lg px-3 py-2.5 focus-within:border-emerald-500/80 focus-within:ring-1 focus-within:ring-emerald-500/50 transition">
            <input
              ref={inputRef}
              type="text"
              value={userQue}
              onChange={(e) => setUserQue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={assistantState === 'thinking'}
              placeholder="Ask anything about Shubham's resume..."
              className="flex-1 bg-transparent text-sm text-neutral-100 placeholder-neutral-500 outline-none disabled:opacity-50"
            />

            <button
              type="button"
              onClick={() => handleSendQue()}
              disabled={!userQue.trim() || assistantState === 'thinking'}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition flex items-center gap-1.5 ${
                userQue.trim() && assistantState !== 'thinking'
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-sm cursor-pointer'
                  : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
              }`}
            >
              <span>Run</span>
              <span className="text-[10px] opacity-75">↵</span>
            </button>
          </div>

          <div className="mt-2 flex justify-between items-center text-[11px] text-neutral-500 px-1">
            <span>Press <kbd className="px-1 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700 text-[10px]">Enter ↵</kbd> to execute</span>
            <span>v1.0.0-shubham's-agent</span>
          </div>
        </div>

      </div>
    </div>
  );
}
