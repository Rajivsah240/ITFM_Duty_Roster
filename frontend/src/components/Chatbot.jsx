import { useState, useRef, useEffect } from 'react';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Welcome. Select a quick action or describe your technical issue.' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingStep, setThinkingStep] = useState('');
  const [turnCount, setTurnCount] = useState(0);
  const [lastQuery, setLastQuery] = useState('');
  
  const flowRef = useRef(null);
  const thinkingTimeoutsRef = useRef([]);

  const thinkingSteps = [
    "Establishing secure session...",
    "Querying ITFM internal database...",
    "Reranking verified solutions...",
    "Cross-referencing web docs...",
    "Finalizing troubleshooting steps..."
  ];

  const quickActions = [
    { emoji: '🔑', label: 'Password Reset', query: 'How do I reset my Windows password?' },
    { emoji: '🌐', label: 'VPN Help', query: 'VPN is not connecting' },
    { emoji: '🖨️', label: 'Printer Setup', query: 'Connect to office printer' }
  ];

  useEffect(() => {
    if (flowRef.current) {
      flowRef.current.scrollTop = flowRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const toggleChat = (open) => {
    setIsOpen(open);
  };

  const expand = () => {
    setIsExpanded(!isExpanded);
  };

  const startThinkingUI = () => {
    stopThinkingUI();
    setIsThinking(true);
    let step = 0;
    const updateStep = () => {
      if (step < thinkingSteps.length) {
        setThinkingStep(thinkingSteps[step]);
        step++;
        const timeout = setTimeout(updateStep, 1000 + Math.random() * 800);
        thinkingTimeoutsRef.current.push(timeout);
      }
    };
    updateStep();
  };

  const stopThinkingUI = () => {
    thinkingTimeoutsRef.current.forEach(t => clearTimeout(t));
    thinkingTimeoutsRef.current = [];
    setIsThinking(false);
    setThinkingStep('');
  };

  const formatText = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  };

  const sendMessage = async (customMsg = null) => {
    const msg = customMsg || inputValue.trim();
    if (!msg) return;

    setLastQuery(msg);
    setTurnCount(prev => prev + 1);
    setMessages(prev => [...prev, { type: 'user', text: msg }]);
    setInputValue('');
    startThinkingUI();

    try {
      const res = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg })
      });
      const data = await res.json();
      stopThinkingUI();
      
      let reply = data.reply;
      if (turnCount + 1 >= 4) {
        reply += "\n\n**ESCALATION:** If unresolved, please contact ITFM Helpdesk at **2252**.";
      }
      
      setMessages(prev => [...prev, { type: 'bot', text: reply, showFeedback: true, query: msg }]);
    } catch {
      stopThinkingUI();
      setMessages(prev => [...prev, { type: 'bot', text: "System Error: Unable to reach ITFM servers." }]);
    }
  };

  const useChip = (text) => {
    sendMessage(text);
  };

  const submitFeedback = async (query, response, isHelpful, messageIndex) => {
    setMessages(prev => prev.map((msg, idx) => 
      idx === messageIndex ? { ...msg, feedbackGiven: true } : msg
    ));
    
    try {
      await fetch('http://localhost:8000/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, response, is_helpful: isHelpful })
      });
    } catch (e) {
      console.error('Feedback submission failed:', e);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <>
      <style>{`
        .chatbot-widget-root {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .chatbot-bot-icon {
          width: 60px;
          height: 60px;
          background: #8A8AFF;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(0,0,0,.2);
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border: none;
          color: white;
        }
        .chatbot-bot-icon:hover { transform: scale(1.1); }

        .chatbot-chat-container {
          width: 380px;
          height: 650px;
          max-height: 85vh;
          background: radial-gradient(circle at 50% 100%, rgba(184,184,255,0.25) 50%, transparent 100%), #111315;
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,.1);
          box-shadow: 0 20px 50px rgba(0,0,0,.5);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: chatbot-slideIn 0.3s ease forwards;
        }

        .chatbot-chat-container.expanded {
          width: 850px;
          height: 750px;
        }

        @keyframes chatbot-slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 600px) {
          .chatbot-widget-root { bottom: 0; right: 0; width: 100%; }
          .chatbot-chat-container {
            width: 100vw !important;
            height: 100dvh !important;
            border-radius: 0;
            position: fixed;
            top: 0; left: 0;
          }
        }

        .chatbot-header {
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255,255,255,0.02);
          border-bottom: 1px solid rgba(255,255,255,.05);
        }

        .chatbot-header-title {
          color: white;
          display: flex;
          gap: 10px;
          align-items: center;
          font-size: 15px;
          font-weight: 500;
        }

        .chatbot-chat-flow {
          flex: 1;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          overflow-y: auto;
        }

        .chatbot-bubble {
          max-width: 85%;
          padding: 12px 16px;
          border-radius: 18px;
          font-size: 14px;
          line-height: 1.5;
          word-wrap: break-word;
        }

        .chatbot-bubble.bot { 
          align-self: flex-start; 
          background: rgba(255,255,255,0.05); 
          color: #ffffff; 
          border-bottom-left-radius: 4px; 
        }
        .chatbot-bubble.user { 
          align-self: flex-end; 
          background: #8A8AFF; 
          color: white; 
          border-bottom-right-radius: 4px; 
        }

        .chatbot-chip-container {
          display: flex;
          gap: 8px;
          padding: 12px 20px;
          background: rgba(0,0,0,0.2);
          border-top: 1px solid rgba(255,255,255,0.05);
          overflow-x: auto;
          scrollbar-width: none;
        }
        .chatbot-chip-container::-webkit-scrollbar { display: none; }
        
        .chatbot-action-chip {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #a0a0a0;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          white-space: nowrap;
          cursor: pointer;
          transition: 0.2s ease;
        }
        .chatbot-action-chip:hover {
          background: rgba(184, 184, 255, 0.15);
          color: #8A8AFF;
          border-color: #8A8AFF;
        }

        .chatbot-feedback-tray {
          display: flex;
          gap: 8px;
          margin-top: 12px;
          padding-top: 8px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        .chatbot-fb-btn {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
          color: #a0a0a0;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          cursor: pointer;
        }
        .chatbot-fb-btn:hover { background: rgba(184,184,255,0.1); color: #8A8AFF; }

        .chatbot-thinking {
          padding: 12px 20px;
          background: rgba(0,0,0,0.1);
        }

        .chatbot-thinking-text {
          display: block;
          font-size: 12px;
          color: #8A8AFF;
          margin-bottom: 6px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .chatbot-dot {
          width: 5px; height: 5px;
          background: #8A8AFF;
          border-radius: 50%;
          display: inline-block;
          margin-right: 4px;
          animation: chatbot-pulse 1.4s infinite;
        }

        @keyframes chatbot-pulse { 0%,100% { opacity:.2; } 50% { opacity:1; } }

        .chatbot-input-bar {
          padding: 15px 20px;
          display: flex;
          gap: 10px;
          background: rgba(0,0,0,0.3);
          padding-bottom: max(15px, env(safe-area-inset-bottom));
        }

        .chatbot-input {
          flex: 1;
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 12px;
          padding: 12px 16px;
          color: white;
          font-size: 16px;
          outline: none;
        }

        .chatbot-send-btn {
          width: 44px; height: 44px;
          border-radius: 12px;
          background: #8A8AFF;
          color: white;
          border: none;
          cursor: pointer;
          font-size: 16px;
        }

        .chatbot-header-btn {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
          color: #a0a0a0;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          cursor: pointer;
        }
        .chatbot-header-btn:hover { background: rgba(184,184,255,0.1); color: #8A8AFF; }

        .chatbot-feedback-done {
          font-size: 11px;
          color: #8A8AFF;
        }
      `}</style>

      <div className="chatbot-widget-root">
        {!isOpen && (
          <button className="chatbot-bot-icon" onClick={() => toggleChat(true)}>
            ✦
          </button>
        )}

        {isOpen && (
          <div className={`chatbot-chat-container ${isExpanded ? 'expanded' : ''}`}>
            <div className="chatbot-header">
              <div className="chatbot-header-title">
                <span style={{ color: '#8A8AFF', fontSize: '20px' }}>✦</span>
                ITFM Support Intelligence
              </div>
              <div>
                <button className="chatbot-header-btn" onClick={expand}>⤢</button>
                <button className="chatbot-header-btn" onClick={() => toggleChat(false)} style={{ marginLeft: '8px' }}>─</button>
              </div>
            </div>

            <div className="chatbot-chat-flow" ref={flowRef}>
              {messages.map((msg, index) => (
                <div key={index} className={`chatbot-bubble ${msg.type}`}>
                  <span dangerouslySetInnerHTML={{ __html: formatText(msg.text) }} />
                  {msg.showFeedback && !msg.feedbackGiven && (
                    <div className="chatbot-feedback-tray">
                      <button 
                        className="chatbot-fb-btn" 
                        onClick={() => submitFeedback(msg.query, msg.text, true, index)}
                      >
                        👍 Solved
                      </button>
                      <button 
                        className="chatbot-fb-btn" 
                        onClick={() => submitFeedback(msg.query, msg.text, false, index)}
                      >
                        👎 No
                      </button>
                    </div>
                  )}
                  {msg.feedbackGiven && (
                    <div className="chatbot-feedback-tray">
                      <span className="chatbot-feedback-done">✦ Contribution Saved.</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {isThinking && (
              <div className="chatbot-thinking">
                <span className="chatbot-thinking-text">{thinkingStep}</span>
                <span className="chatbot-dot" style={{ animationDelay: '0s' }}></span>
                <span className="chatbot-dot" style={{ animationDelay: '0.2s' }}></span>
                <span className="chatbot-dot" style={{ animationDelay: '0.4s' }}></span>
              </div>
            )}

            <div className="chatbot-chip-container">
              {quickActions.map((action, index) => (
                <button 
                  key={index} 
                  className="chatbot-action-chip" 
                  onClick={() => useChip(action.query)}
                >
                  {action.emoji} {action.label}
                </button>
              ))}
            </div>

            <div className="chatbot-input-bar">
              <input
                className="chatbot-input"
                placeholder="Type your issue..."
                autoComplete="off"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button className="chatbot-send-btn" onClick={() => sendMessage()}>
                ➤
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
