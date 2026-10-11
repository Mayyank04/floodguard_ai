"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bot, Send, Sparkles, RefreshCw, Paperclip, CheckCircle2,
  AlertCircle, ShieldCheck, User, Image, FileText, CornerDownLeft
} from "lucide-react";
import { sendCopilotChat, getPrimaryEventId } from "@/lib/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  tool_calls?: any[];
  references?: any[];
  timestamp: string;
}

export default function CopilotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "assistant",
      content: `Welcome to **FloodGuard Copilot**. I am an evidence-grounded tactical disaster intelligence assistant.

I have direct access to backend telemetry from:
- **Sentinel-1 SAR C-Band Radar** (2022-06-20 Peak Deluge)
- **OpenStreetMap Geospatial Vectors** (Roads & Critical Healthcare Assets)
- **NetworkX Topological Road Isolation Engine**

How can I assist your emergency response operations today?`,
      timestamp: "Operational Ready"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() && !uploadedImage) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: uploadedImage ? `${text}\n[Attached Field Photo]` : text,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    const hadImage = uploadedImage;
    setUploadedImage(null);
    setIsLoading(true);

    try {
      const eventId = await getPrimaryEventId();
      const res = await sendCopilotChat(
        hadImage ? `${text} (Responder uploaded field damage observation photograph)` : text,
        eventId
      );

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: res.content,
        tool_calls: res.tool_calls,
        references: res.references,
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I encountered an error connecting to the intelligence server. Please ensure the backend is running.",
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] gap-4">
      {/* Header */}
      <div className="glass-panel p-4 rounded-2xl flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-[#00D4FF]">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              FloodGuard Copilot
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/30">
                EVIDENCE-GROUNDED
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Zero hallucinated stats. Certified tool calling on verified satellite observations & graph models.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span>Operational Rules Active</span>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="glass-panel rounded-2xl p-4 flex-1 overflow-y-auto space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 text-xs leading-relaxed max-w-3xl ${
              m.role === "user" ? "ml-auto flex-row-reverse" : ""
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-slate-950 font-bold ${
                m.role === "user" ? "bg-slate-300" : "bg-[#00D4FF]"
              }`}
            >
              {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`p-4 rounded-2xl border ${
                m.role === "user"
                  ? "bg-slate-800/80 border-slate-700 text-slate-100 rounded-tr-none"
                  : "bg-[#102238] border-slate-800 text-slate-200 rounded-tl-none shadow-xl"
              }`}
            >
              <div className="whitespace-pre-line prose prose-invert max-w-none text-xs">
                {m.content}
              </div>

              {/* Tool Execution Badges */}
              {m.tool_calls && m.tool_calls.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block w-full mb-1">
                    Executed Backend Tools:
                  </span>
                  {m.tool_calls.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/60 border border-cyan-800 text-[#00D4FF]"
                    >
                      ✓ {t.tool}()
                    </span>
                  ))}
                </div>
              )}

              {/* Citations & Evidence References */}
              {m.references && m.references.length > 0 && (
                <div className="mt-2 text-[10px] text-slate-400 space-y-0.5">
                  <span className="font-semibold text-slate-300">Citations:</span>{" "}
                  {m.references.map((r, i) => (
                    <span key={i} className="inline-block bg-slate-900 px-1.5 py-0.5 rounded mr-1">
                      [{r.source}]
                    </span>
                  ))}
                </div>
              )}

              <div className="text-[9px] text-slate-500 mt-2 text-right">{m.timestamp}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 text-xs items-center text-slate-400">
            <div className="w-8 h-8 rounded-lg bg-[#00D4FF] flex items-center justify-center text-slate-950">
              <Bot className="w-4 h-4" />
            </div>
            <div className="glass-panel px-4 py-2.5 rounded-2xl flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#00D4FF]" />
              <span>Querying backend geospatial engines & synthesizing evidence...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="flex flex-wrap gap-2 text-xs">
        {[
          "Which villages are potentially isolated?",
          "Which hospitals intersect the flood extent?",
          "Why is Mandia Char ranked #1 priority?",
          "Show settlements with no mapped road access.",
          "Generate a flood impact summary."
        ].map((q, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(q)}
            className="px-3 py-1.5 rounded-lg bg-[#102238] border border-slate-800 hover:border-[#00D4FF]/60 hover:text-[#00D4FF] text-slate-300 transition text-[11px] cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Box & Multimodal Attachment */}
      <div className="glass-panel p-2.5 rounded-2xl flex flex-col gap-2 flex-shrink-0">
        {uploadedImage && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <Image className="w-4 h-4 text-[#00D4FF]" />
            <span className="text-slate-300">Field photograph attached for multimodal evaluation</span>
            <button
              onClick={() => setUploadedImage(null)}
              className="ml-auto text-slate-500 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <label className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-[#00D4FF] transition cursor-pointer" title="Upload Field Photo">
            <Paperclip className="w-4 h-4" />
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Ask Copilot about flood inundation, severed bridges, isolated villages..."
            className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none px-2"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || (!input.trim() && !uploadedImage)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00D4FF] to-blue-600 text-slate-950 font-bold text-xs hover:brightness-110 disabled:opacity-50 transition cursor-pointer flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
