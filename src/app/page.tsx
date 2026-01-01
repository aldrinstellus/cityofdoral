"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import {
  Send,
  Bot,
  User,
  Loader2,
  MessageCircle,
  X,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Globe,
  Phone,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { type Language, getLabels } from "@/lib/i18n";

interface Source {
  title: string;
  url: string;
  section: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: Source[];
  sentiment?: string;
  escalate?: boolean;
  feedback?: "positive" | "negative" | null;
}

export default function ChatPage() {
  const [language, setLanguage] = useState<Language>("en");
  const labels = getLabels(language);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: labels.welcome,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update welcome message when language changes
  useEffect(() => {
    setMessages((prev) => {
      const newMessages = [...prev];
      if (newMessages[0]?.id === "welcome") {
        newMessages[0] = {
          ...newMessages[0],
          content: getLabels(language).welcome,
        };
      }
      return newMessages;
    });
  }, [language]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          language,
        }),
      });

      const data = await response.json();

      // Update language if response detected a different one
      if (data.language && data.language !== language) {
        setLanguage(data.language);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          data.message ||
          (language === "es"
            ? "Lo siento, hubo un problema. Por favor intente de nuevo."
            : "I apologize, but I encountered an issue. Please try again."),
        timestamp: new Date(),
        sources: data.sources,
        sentiment: data.sentiment,
        escalate: data.escalate,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          language === "es"
            ? "Lo siento, tengo problemas para conectarme. Por favor intente de nuevo."
            : "I apologize, but I'm having trouble connecting. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleFeedback = (messageId: string, feedback: "positive" | "negative") => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, feedback } : m
      )
    );
    // TODO: Send feedback to analytics API
    console.log("Feedback:", { messageId, feedback });
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "es" : "en"));
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-[#1e3a5f] hover:bg-[#2a4a73] shadow-lg"
          aria-label={language === "es" ? "Abrir chat" : "Open chat"}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] to-[#2a4a73] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl h-[700px] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#1e3a5f] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <Bot className="h-6 w-6 text-[#1e3a5f]" aria-hidden="true" />
            </div>
            <div>
              <h1 className="font-semibold">{labels.title}</h1>
              <p className="text-xs text-blue-200">{labels.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="text-white hover:bg-white/10 gap-1"
              aria-label={`${labels.language}: ${language === "en" ? labels.spanish : labels.english}`}
            >
              <Globe className="h-4 w-4" aria-hidden="true" />
              <span className="text-xs">{language.toUpperCase()}</span>
            </Button>
            <Link href="/admin">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
              >
                {labels.admin}
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/10"
              aria-label={language === "es" ? "Cerrar chat" : "Close chat"}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea ref={scrollRef} className="flex-1 p-4" aria-live="polite">
          <div className="space-y-4" role="log" aria-label={language === "es" ? "Historial del chat" : "Chat history"}>
            {messages.map((message) => (
              <div key={message.id}>
                <div
                  className={`flex gap-3 ${
                    message.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <Avatar
                    className={`h-8 w-8 ${
                      message.role === "assistant"
                        ? "bg-[#1e3a5f]"
                        : "bg-gray-200"
                    } flex items-center justify-center`}
                  >
                    {message.role === "assistant" ? (
                      <Bot className="h-5 w-5 text-white" aria-hidden="true" />
                    ) : (
                      <User className="h-5 w-5 text-gray-600" aria-hidden="true" />
                    )}
                  </Avatar>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.role === "user"
                        ? "bg-[#1e3a5f] text-white rounded-tr-sm"
                        : "bg-gray-100 text-gray-800 rounded-tl-sm"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.role === "user" ? "text-blue-200" : "text-gray-400"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                {/* Sources */}
                {message.sources && message.sources.length > 0 && (
                  <div className="ml-11 mt-2">
                    <p className="text-xs text-gray-500 mb-1">{labels.sources}:</p>
                    <div className="flex flex-wrap gap-1">
                      {message.sources.slice(0, 3).map((source, idx) => (
                        <a
                          key={idx}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" aria-hidden="true" />
                          {source.title.length > 30
                            ? source.title.substring(0, 30) + "..."
                            : source.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Escalation Alert */}
                {message.escalate && (
                  <div className="ml-11 mt-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-amber-800">
                      <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                      <span className="text-sm font-medium">{labels.escalateMessage}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 text-amber-700 border-amber-300 hover:bg-amber-100"
                      onClick={() => window.location.href = "tel:+13055936725"}
                    >
                      <Phone className="h-4 w-4 mr-1" aria-hidden="true" />
                      {labels.escalate}
                    </Button>
                  </div>
                )}

                {/* Feedback Buttons */}
                {message.role === "assistant" && message.id !== "welcome" && (
                  <div className="ml-11 mt-2 flex items-center gap-2">
                    <span className="text-xs text-gray-400">{labels.feedback}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-6 w-6 p-0 ${
                        message.feedback === "positive"
                          ? "text-green-600"
                          : "text-gray-400 hover:text-green-600"
                      }`}
                      onClick={() => handleFeedback(message.id, "positive")}
                      aria-label={labels.yes}
                      aria-pressed={message.feedback === "positive"}
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-6 w-6 p-0 ${
                        message.feedback === "negative"
                          ? "text-red-600"
                          : "text-gray-400 hover:text-red-600"
                      }`}
                      onClick={() => handleFeedback(message.id, "negative")}
                      aria-label={labels.no}
                      aria-pressed={message.feedback === "negative"}
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 bg-[#1e3a5f] flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" aria-hidden="true" />
                </Avatar>
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                  <Loader2
                    className="h-5 w-5 animate-spin text-[#1e3a5f]"
                    aria-label={language === "es" ? "Cargando..." : "Loading..."}
                  />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Suggested Questions */}
        {messages.length === 1 && (
          <div className="px-4 pb-2">
            <p className="text-xs text-gray-500 mb-2">{labels.suggested}</p>
            <div className="flex flex-wrap gap-2">
              {labels.suggestedQuestions.map((question) => (
                <Button
                  key={question}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    setInput(question);
                    inputRef.current?.focus();
                  }}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={labels.placeholder}
              className="flex-1"
              disabled={isLoading}
              aria-label={labels.placeholder}
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-[#1e3a5f] hover:bg-[#2a4a73]"
              aria-label={labels.send}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            {labels.disclaimer}
          </p>
        </form>
      </Card>
    </div>
  );
}
