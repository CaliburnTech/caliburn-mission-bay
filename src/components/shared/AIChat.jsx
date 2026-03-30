/**
 * AI Chat Panel for SV-2 Diagram Editor
 *
 * Lets users conversationally modify their architecture diagram.
 * The AI reads the current Mermaid source as context and outputs
 * modified Mermaid that gets applied to the editor.
 *
 * Uses Claude API via Anthropic SDK.
 * API key stored in localStorage (user enters once).
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Key, X, Bot, User, Sparkles, AlertCircle } from 'lucide-react';
import Anthropic from '@anthropic-ai/sdk';

const STORAGE_KEY = 'caliburn-anthropic-api-key';
const MODEL = 'claude-sonnet-4-20250514';

const SYSTEM_PROMPT = `You are an expert defense systems architect helping configure autonomous vessel architectures in the Caliburn Mission Bay platform.

You are editing a Mermaid diagram that represents an SV-2 (Systems Viewpoint 2) — a DoDAF systems communication description showing how software and hardware components connect on an autonomous maritime vessel.

The diagram has two sections separated by a "%% ENGINEER ADDITIONS" marker:
1. AUTO-GENERATED section (top) — reflects the equipped capabilities from the loadout
2. ENGINEER ADDITIONS section (bottom) — custom detail added by engineers

When modifying, place new sub-protocols, internal buses, and custom detail in the ENGINEER ADDITIONS section. Keep the AUTO-GENERATED section structure intact.

Architecture layers (top to bottom):
- Shore Environments (TAK servers, Avalon dev environment, ground stations)
- Cloud Services (remote control, data collection relay)
- Mission Bay (the capability marketplace — equipped payloads/software live here)
- Equipment (physical hardware — radios, sensors, weapons)
- Applications (on-vessel software — navigation autonomy, C2 clients)
- TempestOS (operating system + TMS integration layer)
- Compute (processors, RAM, storage, MCU)

Key technical context:

TempestOS:
- Uses bootable containers (bootc) — atomic, read-only filesystem
- RHEL build model, heavily debloated, STIG'd, SELinux enforcing
- Podman container runtime, KVM virtualization (if needed)
- Apps run via K8s or systemd depending on redundancy needs

TMS (Tempest Messaging Service):
- The integration layer — runs as containerized services
- Built on Protobuf + NATS JetStream for scalable pub/sub messaging
- Handles protocol conversions: CAN, NMEA 0183, STANAG 4817, MAVLink, CoT
- Payloads subscribe and produce data on STATEFUL, TOPIC-BASED STREAMS
- Integration pattern: sensor → NMEA stream → TMS server → payload subscribes → processes → publishes back on respective stream → other subscribers receive in their format

Other key systems:
- TAK (Team Awareness Kit) — DoD standard C2, Cloud TAK server + Vehicle TAK client
- Avalon — TempestOS development environment
- Mission Bay — capability marketplace, manages configurations and deployments
- MOOS-IvP — MIT behavior-based autonomy (pHelmIvP, pMarinePID, MOOSDB)

When the user asks you to modify the diagram:
1. Output ONLY the complete updated Mermaid source code
2. Wrap it in a \`\`\`mermaid code fence
3. Keep ALL existing content unless the user specifically asks to remove something
4. Place custom additions in the ENGINEER ADDITIONS section
5. Add brief comments with %% to explain changes
6. If the user asks a question (not a modification), answer conversationally WITHOUT outputting mermaid

Always maintain valid Mermaid syntax. Use subgraphs for layers, quoted labels for node names.`;

const AIChat = ({ mermaidSource, onApplyMermaid, diagramName }) => {
  const [apiKey, setApiKey] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) || ''; } catch { return ''; }
  });
  const [showKeyInput, setShowKeyInput] = useState(!apiKey);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveApiKey = useCallback((key) => {
    setApiKey(key);
    setShowKeyInput(false);
    setError(null);
    try { localStorage.setItem(STORAGE_KEY, key); } catch { /* */ }
  }, []);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || !apiKey || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    setError(null);

    try {
      const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

      // Build conversation with current diagram context
      const contextMessage = `Here is the current Mermaid diagram source:\n\n\`\`\`mermaid\n${mermaidSource}\n\`\`\`\n\nDiagram: ${diagramName || 'SV-2 Architecture'}`;

      const conversationMessages = [
        { role: 'user', content: contextMessage },
        { role: 'assistant', content: 'I can see the current architecture diagram. How would you like to modify it?' },
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMessage }
      ];

      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: conversationMessages
      });

      const assistantContent = response.content[0]?.text || 'No response';

      // Check if response contains a mermaid code block
      const mermaidMatch = assistantContent.match(/```mermaid\n([\s\S]*?)```/);

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: assistantContent,
        hasMermaid: !!mermaidMatch,
        mermaidSource: mermaidMatch ? mermaidMatch[1].trim() : null
      }]);

      // Auto-apply the mermaid if it was a modification request
      if (mermaidMatch && onApplyMermaid) {
        onApplyMermaid(mermaidMatch[1].trim());
      }

    } catch (err) {
      const errorMsg = err.message || 'Failed to get response';
      if (errorMsg.includes('401') || errorMsg.includes('authentication')) {
        setError('Invalid API key. Please check and re-enter.');
        setShowKeyInput(true);
      } else {
        setError(errorMsg);
      }
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${errorMsg}`,
        isError: true
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, apiKey, loading, mermaidSource, messages, diagramName, onApplyMermaid]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // API Key input screen
  if (showKeyInput) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', backgroundColor: '#fafaf5' }}>
        <Key size={24} style={{ color: '#d4a843', marginBottom: '12px' }} />
        <h3 style={{ color: '#333', fontSize: '14px', fontWeight: 700, margin: '0 0 4px 0' }}>Claude API Key</h3>
        <p style={{ color: '#888', fontSize: '11px', margin: '0 0 16px 0', textAlign: 'center' }}>
          Enter your Anthropic API key to enable AI chat.<br />Stored locally in your browser.
        </p>
        <input
          type="password"
          placeholder="sk-ant-..."
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') saveApiKey(apiKey); }}
          style={{ width: '100%', maxWidth: '280px', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', fontFamily: 'monospace', outline: 'none' }}
        />
        <button
          onClick={() => saveApiKey(apiKey)}
          disabled={!apiKey.startsWith('sk-')}
          style={{
            marginTop: '10px', padding: '8px 20px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
            border: 'none', cursor: apiKey.startsWith('sk-') ? 'pointer' : 'not-allowed',
            backgroundColor: apiKey.startsWith('sk-') ? '#d4a843' : '#e5e5e5',
            color: apiKey.startsWith('sk-') ? '#fff' : '#aaa'
          }}
        >
          Save & Connect
        </button>
        {error && (
          <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '8px' }}>{error}</p>
        )}
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#fafaf5' }}>
      {/* Header */}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid #e5e5e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={14} style={{ color: '#d4a843' }} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#555' }}>AI ARCHITECT</span>
        </div>
        <button
          onClick={() => setShowKeyInput(true)}
          title="Change API key"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
        >
          <Key size={12} style={{ color: '#aaa' }} />
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Bot size={28} style={{ color: '#ddd', margin: '0 auto 8px' }} />
            <p style={{ color: '#999', fontSize: '12px', margin: 0 }}>Ask me to modify the diagram</p>
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                'Add a Starlink relay between cloud and vessel',
                'What would a MetalShark recon config look like?',
                'Move MOOS-IvP under TempestOS',
                'Add data flow labels between TMS and sensors'
              ].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(suggestion); inputRef.current?.focus(); }}
                  style={{
                    padding: '6px 10px', backgroundColor: '#f5f5f0', border: '1px solid #e5e5e5',
                    borderRadius: '6px', fontSize: '11px', color: '#666', cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: '12px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <div style={{
              width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: msg.role === 'user' ? '#e0e7ff' : msg.isError ? '#fee2e2' : '#fef3c7'
            }}
            >
              {msg.role === 'user'
                ? <User size={12} style={{ color: '#4f46e5' }} />
                : msg.isError
                  ? <AlertCircle size={12} style={{ color: '#ef4444' }} />
                  : <Bot size={12} style={{ color: '#d4a843' }} />
              }
            </div>
            <div style={{ flex: 1 }}>
              {msg.hasMermaid ? (
                <>
                  <p style={{ fontSize: '12px', color: '#333', margin: '0 0 6px 0', lineHeight: '1.5' }}>
                    {msg.content.replace(/```mermaid[\s\S]*?```/, '').trim() || 'Updated the diagram:'}
                  </p>
                  <div style={{ padding: '6px 10px', backgroundColor: '#ecfdf5', border: '1px solid #86efac', borderRadius: '6px', fontSize: '11px', color: '#166534' }}>
                    ✓ Diagram updated automatically
                  </div>
                </>
              ) : (
                <p style={{
                  fontSize: '12px', margin: 0, lineHeight: '1.5',
                  color: msg.isError ? '#ef4444' : '#333',
                  whiteSpace: 'pre-wrap'
                }}
                >
                  {msg.content}
                </p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '8px 0' }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={12} style={{ color: '#d4a843' }} />
            </div>
            <span style={{ fontSize: '12px', color: '#999' }}>Thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '8px 12px', borderTop: '1px solid #e5e5e5' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe a change or ask a question..."
            rows={2}
            style={{
              flex: 1, padding: '8px 10px', border: '1px solid #ddd', borderRadius: '6px',
              fontSize: '12px', fontFamily: 'inherit', resize: 'none', outline: 'none',
              lineHeight: '1.4'
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            style={{
              padding: '8px 12px', borderRadius: '6px', border: 'none',
              backgroundColor: input.trim() && !loading ? '#d4a843' : '#e5e5e5',
              color: input.trim() && !loading ? '#fff' : '#aaa',
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center'
            }}
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
