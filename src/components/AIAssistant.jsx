import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, X, RotateCcw, Key, Trash2, Mic } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AIAssistant.css';

// ── Gemini API call ──────────────────────────────────────────────────────────
async function callGemini(apiKey, history, userMessage) {
  const SYSTEM_PROMPT = `You are KisanAI, an expert agricultural and financial advisor for Indian farmers.
You specialize in:
- Crop prices and market trends (Mandi rates)
- Weather impact on agriculture
- Farming best practices for crops like wheat, rice, cotton, maize, chilli, groundnut
- Government schemes: PM-KISAN, PMFBY, Kisan Credit Card, NABARD loans
- Farm income and expense management
- Pest control and crop disease advice
- Soil health and organic farming tips

Always respond in 2-3 short paragraphs maximum. Use bullet points for lists. Be practical and actionable.
If a question is not farming/agriculture/finance related, politely steer back to farming topics.
Address the farmer warmly (use "Kisan ji" occasionally). Use ₹ for amounts.
Keep responses concise — this is a mobile chat interface.`;

  const contents = [
    ...history.map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    })),
    { role: 'user', parts: [{ text: userMessage }] },
  ];

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: { maxOutputTokens: 400, temperature: 0.7 },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err?.error?.message || `API error ${res.status}`;
    throw new Error(msg);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
}

// ── Fallback smart responses (no API key) ────────────────────────────────────
const FALLBACK = [
  { keys: ['price', 'rate', 'mandi', 'market', 'today'], reply: '📊 **Today\'s approximate Mandi prices:**\n\n• Wheat: ₹2,250/Qtl (↑2.4%)\n• Cotton: ₹7,400/Qtl (↑5.2%)\n• Rice: ₹2,100/Qtl (↓1.1%)\n• Maize: ₹1,850/Qtl (↑0.8%)\n\nCheck the **Crop Prices** page for live updates from all markets.' },
  { keys: ['weather', 'rain', 'monsoon', 'forecast'], reply: '🌧️ **Weather Advisory:**\n\nModerate to heavy rain is expected in the next 48 hours in Telangana/AP region.\n\n• Delay pesticide & fertilizer application\n• Cover harvested crops securely\n• Check drainage channels around fields\n\nGo to the **Weather** tab for a full 5-day forecast.' },
  { keys: ['loan', 'credit', 'kcc', 'nabard', 'borrow', 'finance'], reply: '🏦 **Available Farming Loans:**\n\n• **Kisan Credit Card (KCC):** ₹3 Lakh @ 4% p.a. — best for seasonal inputs\n• **Land Development Loan (NABARD):** Up to ₹10 Lakh @ 6% for infrastructure\n• **Equipment Finance:** Up to ₹5 Lakh @ 8.5% for machinery\n\nVisit the **Loans & Insurance** tab to apply instantly!' },
  { keys: ['insurance', 'pmfby', 'cover', 'claim'], reply: '🛡️ **Crop Insurance Options:**\n\n• **PMFBY Season Guard:** 2% premium, covers 100% crop loss\n• **Weather Shield:** 1.5% premium, auto-payout on weather thresholds\n\nBoth schemes are subsidized by the Government. Apply before your sowing season begins.' },
  { keys: ['sell', 'buyer', 'market', 'middleman', 'direct'], reply: '🛒 **Direct Market Tips:**\n\nTo get the best price for your produce:\n\n• Use our **Marketplace** tab to connect with verified buyers\n• Compare current Mandi rates vs buyer offers\n• Cotton buyers in Warangal currently offering ₹7,600/Qtl\n\nAvoid middlemen — sell directly and earn 15-25% more!' },
  { keys: ['wheat', 'gehu'], reply: '🌾 **Wheat — Current Insights:**\n\n• Current price: ₹2,250/Qtl in Hyderabad\n• AI Prediction: Price may rise to ₹2,400 by June 2026\n• Best markets: Hyderabad, Warangal, Karimnagar\n\n**Advice:** Hold 30-40% of your stock until May-June for better returns if you have adequate storage.' },
  { keys: ['cotton', 'kapas'], reply: '🌿 **Cotton — Strong Bull Trend:**\n\n• Current: ₹7,400/Qtl (↑5.2% today)\n• Predicted: ₹8,100/Qtl by July (confidence: 91%)\n• Demand driver: Textile export season\n\n**Advice:** Excellent time to grow cotton next season. Consider selling current stock in stages rather than all at once.' },
  { keys: ['pest', 'disease', 'insect', 'spray', 'fungus'], reply: '🐛 **Pest & Disease Management:**\n\nFor most common issues:\n\n• **Aphids/Whitefly:** Neem oil spray (5ml/litre) every 10 days\n• **Fungal disease:** Mancozeb or Carbendazim spray in the morning\n• **Stem borer:** Pheromone traps + Chlorpyrifos spray if >5% infestation\n\n⚠️ Avoid spraying 48 hours before or after rain. Spray in early morning or evening.' },
  { keys: ['soil', 'fertilizer', 'urea', 'dap', 'compost', 'organic'], reply: '🌱 **Soil Health Tips:**\n\n• Test soil every 2 years (free at KVK centers)\n• Use DAP + Urea in recommended ratio — over-use causes soil acidification\n• Add 2-3 tonnes of farmyard manure per acre annually\n• Vermicompost can reduce fertilizer cost by 40%\n\nHealthy soil = higher yields + lower input costs!' },
  { keys: ['subsidy', 'government', 'scheme', 'pm kisan', 'benefit'], reply: '🏛️ **Key Government Schemes for You:**\n\n• **PM-KISAN:** ₹6,000/year directly to your bank account\n• **PMFBY:** Subsidized crop insurance at 1.5-2% premium\n• **Kisan Credit Card:** Revolving credit at 4% interest\n• **Soil Health Card:** Free soil testing at KVK/Agriculture Dept.\n\nContact your nearest Agriculture Officer or use the Loans & Insurance section to apply.' },
];

function getFallbackReply(input) {
  const lower = input.toLowerCase();
  for (const f of FALLBACK) {
    if (f.keys.some((k) => lower.includes(k))) return f.reply;
  }
  return '🌾 **KisanAI is here to help!**\n\nI can assist you with:\n• Crop prices & market trends\n• Weather alerts & farming advice\n• Loan & insurance information\n• Pest management & soil health\n• Government schemes & subsidies\n\nPlease add your **Gemini API key** (free at aistudio.google.com) for full AI-powered answers. What would you like to know?';
}

// ── Suggested questions ──────────────────────────────────────────────────────
const SUGGESTIONS = [
  '🌾 Today\'s wheat price?',
  '🌧️ Should I spray pesticide today?',
  '🏦 KCC loan eligibility?',
  '🤖 Cotton price next month?',
  '🐛 How to treat aphids?',
  '🏛️ PM-KISAN scheme details?',
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(date) {
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function renderText(text) {
  // Simple markdown: **bold**, bullet lists
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^• (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>(\n|$))+/g, (m) => `<ul>${m}</ul>`)
    .replace(/\n/g, '<br/>');
}

// ── Main Component ────────────────────────────────────────────────────────────
const STORAGE_KEY = 'agrismart_gemini_key';

export default function AIAssistant() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'ai',
      content: `Namaste ${user?.firstName || 'Kisan ji'}! 🙏 I'm **KisanAI**, your personal farming assistant.\n\nI can help you with crop prices, weather advice, loans, pest control, and much more. What can I help you with today?`,
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(STORAGE_KEY) || '');
  const [keyInput, setKeyInput] = useState('');
  const [showKeyPrompt, setShowKeyPrompt] = useState(() => !localStorage.getItem(STORAGE_KEY));
  
  // Voice Recognition State
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Initialize SpeechRecognition safely
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  if (recognition) {
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN'; // Default to Indian English, can process mix of Hindi/Telugu natively

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (e) => {
      console.error('Speech recognition error', e.error);
      setIsListening(false);
      if (e.error === 'not-allowed') {
        alert('Microphone access denied. Please allow microphone permissions in your browser.');
      }
    };
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(prev => prev + (prev ? ' ' : '') + transcript);
      setIsListening(false);
    };
  }

  const toggleListen = () => {
    if (!recognition) {
      alert('Your browser does not support Voice Search. Please use Chrome.');
      return;
    }
    if (isListening) recognition.stop();
    else recognition.start();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const saveKey = () => {
    if (!keyInput.trim()) return;
    const k = keyInput.trim();
    localStorage.setItem(STORAGE_KEY, k);
    setApiKey(k);
    setShowKeyPrompt(false);
    setKeyInput('');
  };

  const addMessage = (role, content) => {
    setMessages((prev) => [...prev, { id: Date.now(), role, content, time: new Date() }]);
  };

  const sendMessage = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    addMessage('user', msg);
    setLoading(true);

    try {
      let reply;
      if (apiKey) {
        const history = messages.map((m) => ({ role: m.role, content: m.content }));
        reply = await callGemini(apiKey, history, msg);
      } else {
        await new Promise((r) => setTimeout(r, 800));
        reply = getFallbackReply(msg);
      }
      addMessage('ai', reply);
    } catch (err) {
      addMessage('ai', `⚠️ **Error:** ${err.message}\n\nPlease check your Gemini API key and try again. You can get a free key at [aistudio.google.com](https://aistudio.google.com).`);
    } finally {
      setLoading(false);
    }
  }, [input, loading, apiKey, messages]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: Date.now(),
      role: 'ai',
      content: `Chat cleared! How can I help you today, ${user?.firstName || 'Kisan ji'}? 🌾`,
      time: new Date(),
    }]);
  };

  const userInitials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : 'U';

  return (
    <>
      {/* Floating Action Button */}
      <button
        className={`ai-fab ${open ? 'open' : ''}`}
        onClick={() => setOpen(!open)}
        aria-label="Open AI Assistant"
        title="KisanAI Assistant"
      >
        {!open && <span className="ai-fab-pulse" />}
        {!open && <span className="ai-badge">AI</span>}
        <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{open ? '✕' : '🤖'}</span>
      </button>

      {/* Chat Panel */}
      {open && (
        <div className="ai-panel">
          {/* Header */}
          <div className="ai-header">
            <div className="ai-avatar">🤖</div>
            <div className="ai-header-info">
              <div className="ai-header-name">KisanAI Assistant</div>
              <div className="ai-header-status">
                <span className="status-dot" />
                {apiKey ? 'Powered by Gemini AI' : 'Smart Fallback Mode'}
              </div>
            </div>
            <div className="ai-header-actions">
              <button className="ai-header-btn" title="Change API Key" onClick={() => setShowKeyPrompt(!showKeyPrompt)}>
                <Key size={14} />
              </button>
              <button className="ai-header-btn" title="Clear Chat" onClick={clearChat}>
                <Trash2 size={14} />
              </button>
              <button className="ai-header-btn" title="Close" onClick={() => setOpen(false)}>
                <X size={14} />
              </button>
            </div>
          </div>

          {/* API Key Prompt */}
          {showKeyPrompt && (
            <div className="ai-key-prompt">
              <p>🔑 Add your free <strong>Gemini API key</strong> for full AI answers. Get one at <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" style={{ color: '#6d28d9', fontWeight: 700 }}>aistudio.google.com</a></p>
              <div className="ai-key-row">
                <input
                  type="password"
                  className="ai-key-input"
                  placeholder="Paste your Gemini API key..."
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveKey()}
                />
                <button className="ai-key-save-btn" onClick={saveKey}>Save</button>
              </div>
              {apiKey && (
                <p style={{ marginTop: '0.4rem', color: '#059669', fontSize: '0.75rem', fontWeight: 600 }}>
                  ✅ API key is set. Using full Gemini AI.
                  <button onClick={() => { localStorage.removeItem(STORAGE_KEY); setApiKey(''); }} style={{ marginLeft: '0.5rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 700 }}>Remove</button>
                </p>
              )}
            </div>
          )}

          {/* Messages */}
          <div className="ai-messages">
            {/* Welcome card on first message */}
            {messages.length === 1 && (
              <div className="ai-welcome">
                <div className="ai-welcome-icon">🌾</div>
                <h4>Your Personal Farm Advisor</h4>
                <p>Ask me anything about crops, prices, loans, weather, pest control, or government schemes.</p>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id}>
                <div className={`msg-row ${msg.role}`}>
                  <div className={`msg-icon ${msg.role === 'ai' ? 'ai-icon' : 'user-icon'}`}>
                    {msg.role === 'ai' ? '🤖' : userInitials}
                  </div>
                  <div
                    className="msg-bubble"
                    dangerouslySetInnerHTML={{ __html: renderText(msg.content) }}
                  />
                </div>
                <div className={`msg-time ${msg.role === 'user' ? 'msg-row user' : ''}`}>
                  {formatTime(msg.time)}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="msg-row ai">
                <div className="msg-icon ai-icon">🤖</div>
                <div className="typing-bubble">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          <div className="ai-suggestions">
            {SUGGESTIONS.map((s) => (
              <button key={s} className="suggestion-chip" onClick={() => sendMessage(s)} disabled={loading}>
                {s}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="ai-input-area">
            <textarea
              ref={textareaRef}
              className="ai-textarea"
              rows={1}
              placeholder="Ask KisanAI anything about farming..."
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
              }}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              className={`ai-mic-btn ${isListening ? 'listening' : ''}`}
              onClick={toggleListen}
              disabled={loading}
              title={isListening ? 'Listening... click to stop' : 'Tap to speak'}
              aria-label="Voice input"
              style={{
                background: 'none', border: 'none', color: isListening ? 'var(--color-danger)' : 'var(--color-text-muted)',
                cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s', borderRadius: '50%', flexShrink: 0,
                ...(isListening && { animation: 'pulse-record 1.5s infinite', background: 'rgba(239, 68, 68, 0.1)' })
              }}
            >
              <Mic size={20} />
            </button>
            
            <button
              className="ai-send-btn"
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              aria-label="Send message"
            >
              {loading ? (
                <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
