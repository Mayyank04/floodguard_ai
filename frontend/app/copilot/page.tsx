"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bot, Send, RefreshCw, Paperclip, CheckCircle2,
  AlertCircle, ShieldCheck, User, Image, FileText,
  Copy, Check, Trash2, ArrowUpRight, Sparkles, MapPin
} from "lucide-react";
import { sendCopilotChat, getPrimaryEventId } from "@/lib/api";
import Link from "next/link";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  tool_calls?: any[];
  references?: any[];
  timestamp: string;
}

// Simple reliable Markdown formatter to avoid raw unformatted asterisks
function FormattedContent({ text }: { text: string }) {
  const lines = text.split("\n");

  return (
    <div className="space-y-1.5 text-xs text-slate-200 leading-relaxed font-sans">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        // Header ###
        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={idx} className="text-sm font-bold text-white pt-1">
              {trimmed.replace(/^###\s+/, "")}
            </h4>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h3 key={idx} className="text-base font-bold text-white pt-1">
              {trimmed.replace(/^##\s+/, "")}
            </h3>
          );
        }

        // Bullet point
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const itemText = trimmed.replace(/^[-*]\s+/, "");
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-[#2563EB] font-bold">•</span>
              <span>{renderInlineStyles(itemText)}</span>
            </div>
          );
        }

        // Operational Notice / Blockquote
        if (trimmed.startsWith("> ")) {
          return (
            <div key={idx} className="p-2.5 my-1.5 rounded bg-[#1E293B] border-l-2 border-l-amber-500 text-[11px] text-slate-300">
              {renderInlineStyles(trimmed.replace(/^>\s+/, ""))}
            </div>
          );
        }

        return <p key={idx}>{renderInlineStyles(trimmed)}</p>;
      })}
    </div>
  );
}

function renderInlineStyles(text: string) {
  // Replace bold **text** with <strong>
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="px-1 py-0.5 rounded bg-[#0B1220] border border-[#334155] text-[10px] font-mono text-[#06B6D4]">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export default function CopilotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "assistant",
      content: `Welcome to **FloodGuard Copilot**. I am an evidence-grounded tactical disaster response intelligence assistant.

I query verified backend geospatial telemetry including:
- **Sentinel-1 SAR C-Band Radar** (2022-06-20 Peak Deluge Extent)
- **OpenStreetMap Geospatial Vectors** (172.5 km mapped road network)
- **NetworkX Topological Road Isolation Engine**

Ask any operational question regarding flood extent, road severance, or isolated communities.`,
      timestamp: "Operational Ready"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() && !uploadedImage) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: uploadedImage ? `${text}\n[Attached Field Photo]` : text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    const hadImage = uploadedImage;
    setUploadedImage(null);
    setIsLoading(true);

    try {
      const eventId = await getPrimaryEventId();
      const res = await sendCopilotChat(
        hadImage ? `${text} (Responder attached field damage observation)` : text,
        eventId
      );

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: res.content,
        tool_calls: res.tool_calls,
        references: res.references,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Encountered a server communication error. Please ensure the backend is running.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: "cleared-init",
        role: "assistant",
        content: "Conversation history cleared. Ready for new tactical queries.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] gap-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="surface-card p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#2563EB]/15 border border-[#2563EB]/30 flex items-center justify-center text-[#2563EB]">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              FloodGuard Copilot
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#2563EB]/15 text-[#2563EB] border border-[#2563EB]/30">
                Grounded Tool Calling
              </span>
            </h1>
            <p className="text-xs text-[#94A3B8]">
              Queries verified satellite observations & graph connectivity. Zero hallucinated metrics.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearChat}
            className="btn-secondary text-xs p-2 text-slate-400 hover:text-white"
            title="Clear Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#10B981] bg-[#10B981]/10 px-3 py-1.5 rounded-lg border border-[#10B981]/20">
            <ShieldCheck className="w-4 h-4" />
            <span>Audit-Grounded</span>
          </div>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="surface-card rounded-xl p-4 flex-1 overflow-y-auto space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 text-xs leading-relaxed max-w-3xl ${
              m.role === "user" ? "ml-auto flex-row-reverse" : ""
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold text-xs ${
                m.role === "user" ? "bg-[#334155]" : "bg-[#2563EB]"
              }`}
            >
              {m.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`p-3.5 rounded-xl border ${
                m.role === "user"
                  ? "bg-[#1E293B] border-[#334155] text-white"
                  : "bg-[#172033] border-[#334155] text-slate-200 shadow-md"
              }`}
            >
              <FormattedContent text={m.content} />

              {/* Tool Execution Badges */}
              {m.tool_calls && m.tool_calls.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-[#334155] flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] text-slate-400 font-semibold block w-full">
                    Executed Backend Tools:
                  </span>
                  {m.tool_calls.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#0B1220] border border-[#334155] text-[#2563EB]"
                    >
                      ✓ {t.tool}()
                    </span>
                  ))}
                </div>
              )}

              {/* Citations & Evidence References */}
              {m.references && m.references.length > 0 && (
                <div className="mt-2 text-[10px] text-slate-400">
                  <span className="font-semibold text-slate-300">Citations:</span>{" "}
                  {m.references.map((r, i) => (
                    <span key={i} className="inline-block bg-[#0B1220] px-1.5 py-0.5 rounded mr-1 text-[10px]">
                      [{r.source}]
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2.5 pt-1.5 border-t border-[#334155]/40">
                <span>{m.timestamp}</span>
                <button
                  onClick={() => copyToClipboard(m.content, m.id)}
                  className="hover:text-white flex items-center gap-1 transition"
                  title="Copy response"
                >
                  {copiedId === m.id ? (
                    <>
                      <Check className="w-3 h-3 text-[#10B981]" />
                      <span className="text-[#10B981]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 text-xs items-center text-slate-400">
            <div className="w-7 h-7 rounded-lg bg-[#2563EB] flex items-center justify-center text-white">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="p-3 bg-[#172033] rounded-xl border border-[#334155] flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#2563EB]" />
              <span>Querying database metrics and executing grounded tools...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-slate-400 text-[11px] font-semibold px-1 whitespace-nowrap">Suggested:</span>
        {[
          "Which settlements have lost 100% of road access?",
          "Show affected hospitals and bridge crossings",
          "Why is Mandia Char ranked #1 urgency?",
          "What is the total inundated area from Sentinel-1?",
          "List active NDRF rescue staging bases"
        ].map((q, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(q)}
            className="px-2.5 py-1 rounded-lg bg-[#172033] hover:bg-[#1E293B] border border-[#334155] text-slate-300 hover:text-white transition whitespace-nowrap cursor-pointer text-[11px]"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="surface-card p-2 rounded-xl flex items-center gap-2 flex-shrink-0">
        <input
          type="text"
          placeholder="Ask Copilot about flood extent, cut-off villages, or critical bridges..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          className="flex-1 bg-transparent px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none"
        />

        <button
          onClick={() => handleSendMessage()}
          disabled={isLoading || !input.trim()}
          className="btn-primary text-xs px-4 py-2 disabled:opacity-40"
        >
          {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          <span>Send</span>
        </button>
      </div>
    </div>
  );
}
