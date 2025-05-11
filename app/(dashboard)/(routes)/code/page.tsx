// app/(dashboard)/(routes)/code/page.tsx
"use client";

import * as z from "zod";
import axios from "axios";
import { 
  Code, 
  Send, 
  Loader2, 
  Copy, 
  Check, 
  Download,
  Trash2,
  Plus,
  Menu,
  MoreVertical,
  Pencil,
  X,
  AlertCircle,
  Terminal,
  FileCode,
  Sparkles,
  Zap
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { formSchema } from "./constants";
import { useProModal } from "@/hooks/use-pro-modal";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/user-avatar";
import { BotAvatar } from "@/components/bot-avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

interface CodeSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

const CodePage = () => {
  const router = useRouter();
  const proModal = useProModal();
  const [sessions, setSessions] = useState<CodeSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSlowWarning, setShowSlowWarning] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const currentSession = sessions.find(s => s.id === currentSessionId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  useEffect(() => {
    const savedSessions = localStorage.getItem('code-sessions');
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    }
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('code-sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  const createNewSession = () => {
    const newSession: CodeSession = {
      id: Date.now().toString(),
      title: "New Code Session",
      messages: [],
      createdAt: new Date(),
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setIsSidebarOpen(false);
  };

  const deleteSession = (sessionId: string) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
      }
      toast.success('Session deleted');
    }
  };

  const startEditingSession = (session: CodeSession) => {
    setEditingSessionId(session.id);
    setEditTitle(session.title);
  };

  const saveEditSession = (sessionId: string) => {
    if (editTitle.trim()) {
      setSessions(prev => prev.map(session => 
        session.id === sessionId ? { ...session, title: editTitle.trim() } : session
      ));
      toast.success('Session renamed');
    }
    setEditingSessionId(null);
  };

  const copyToClipboard = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    toast.success("Code copied to clipboard");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (!currentSessionId) {
        createNewSession();
        setTimeout(() => {
          onSubmit(values);
        }, 100);
        return;
      }

      const userMessage: Message = {
        role: "user",
        content: values.prompt,
        timestamp: new Date(),
      };

      setSessions(prev => prev.map(session => 
        session.id === currentSessionId 
          ? { ...session, messages: [...session.messages, userMessage] }
          : session
      ));

      form.reset();
      setIsLoading(true);
      setShowSlowWarning(false);

      timeoutRef.current = setTimeout(() => {
        setShowSlowWarning(true);
      }, 5000);

      const currentMessages = currentSession?.messages || [];
      const response = await axios.post("/api/code", {
        messages: [...currentMessages, userMessage],
      });

      clearTimeout(timeoutRef.current);

      const assistantMessage: Message = {
        role: "assistant",
        content: response.data.content,
        timestamp: new Date(),
      };

      setSessions(prev => prev.map(session => {
        if (session.id === currentSessionId) {
          const updatedMessages = [...session.messages, assistantMessage];
          const shouldUpdateTitle = session.title === "New Code Session" && updatedMessages.length === 2;
          
          return {
            ...session,
            messages: updatedMessages,
            title: shouldUpdateTitle ? values.prompt.slice(0, 30) + "..." : session.title,
          };
        }
        return session;
      }));

    } catch (error: any) {
      if (error?.response?.status === 403) {
        proModal.onOpen();
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setIsLoading(false);
      setShowSlowWarning(false);
      clearTimeout(timeoutRef.current);
      router.refresh();
    }
  };

  const SessionActionsMenu = ({ session }: { session: CodeSession }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="p-2 opacity-0 group-hover:opacity-100 hover:bg-gray-700 rounded transition-opacity"
        >
          <MoreVertical className="h-4 w-4 text-gray-400" />
        </button>
        
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-50"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg border border-gray-700 z-50">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startEditingSession(session);
                  setIsOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Rename
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSession(session.id);
                  setIsOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-gray-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  const SessionSidebar = () => (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="p-4">
        <Button 
          onClick={createNewSession} 
          className="w-full bg-green-600 hover:bg-green-700"
        >
          <Plus className="mr-2 h-4 w-4" /> New Code Session
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {sessions.map(session => (
          <div
            key={session.id}
            className={cn(
              "group flex items-center",
              currentSessionId === session.id && "bg-gray-800"
            )}
          >
            {editingSessionId === session.id ? (
              <div className="flex-1 flex items-center p-3 gap-2">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="flex-1 bg-gray-700 px-2 py-1 rounded text-sm text-white border border-gray-600 focus:outline-none focus:border-green-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      saveEditSession(session.id);
                    } else if (e.key === 'Escape') {
                      setEditingSessionId(null);
                    }
                  }}
                />
                <button
                  onClick={() => saveEditSession(session.id)}
                  className="p-1 hover:bg-gray-600 rounded"
                >
                  <Check className="h-4 w-4 text-green-500" />
                </button>
                <button
                  onClick={() => setEditingSessionId(null)}
                  className="p-1 hover:bg-gray-600 rounded"
                >
                  <X className="h-4 w-4 text-red-500" />
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => {
                    setCurrentSessionId(session.id);
                    setIsSidebarOpen(false);
                  }}
                  className={cn(
                    "flex-1 text-left p-3 hover:bg-gray-800 transition-colors flex items-center gap-2",
                    currentSessionId === session.id && "border-l-2 border-green-500"
                  )}
                >
                  <Code className="h-4 w-4 text-gray-400" />
                  <span className="truncate text-sm text-gray-300">{session.title}</span>
                </button>
                
                <SessionActionsMenu session={session} />
              </>
            )}
          </div>
        ))}
        
        {sessions.length === 0 && (
          <div className="p-4 text-center text-gray-400 text-sm">
            No code sessions yet. Start a new one!
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-72px)] flex bg-gray-950">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-20 left-4 z-50">
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="bg-gray-900 border-gray-700">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-80">
            <SessionSidebar />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-80 border-r border-gray-800">
        <SessionSidebar />
      </div>

      {/* Main Code Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {currentSessionId ? (
          <>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-4 lg:p-6">
              <div className="max-w-3xl mx-auto">
                {currentSession?.messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg mb-4",
                      message.role === "user" ? "bg-gray-900/50" : "bg-gray-800/30"
                    )}
                  >
                    {message.role === "user" ? (
                      <UserAvatar />
                    ) : (
                      <BotAvatar gradient="code" size="sm" />
                    )}
                    
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="font-semibold text-sm">
                        {message.role === "user" ? "You" : "Code AI"}
                      </div>
                      <div className="text-gray-300 break-words">
                        {message.role === "assistant" ? (
                          <ReactMarkdown
                            className="prose prose-invert prose-sm max-w-none"
                            components={{
                              pre: ({ node, children, ...props }) => {
                                return (
                                  <pre className="relative my-4" {...props}>
                                    <div className="absolute top-2 right-2 flex gap-2 z-10">
                                      <button
                                        onClick={() => {
                                          const codeElement = (children as any)?.props?.children;
                                          if (codeElement) {
                                            copyToClipboard(codeElement, index);
                                          }
                                        }}
                                        className="p-2 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
                                      >
                                        {copiedIndex === index ? (
                                          <Check className="h-4 w-4 text-green-500" />
                                        ) : (
                                          <Copy className="h-4 w-4" />
                                        )}
                                      </button>
                                    </div>
                                    <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-[600px]">
                                      {children}
                                    </div>
                                  </pre>
                                );
                              },
                              code: ({ node, inline, className, children, ...props }) => {
                                return inline ? (
                                  <code className="bg-gray-800 px-1 py-0.5 rounded text-sm" {...props}>
                                    {children}
                                  </code>
                                ) : (
                                  <code className="block text-sm" {...props}>
                                    {children}
                                  </code>
                                );
                              }
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        ) : (
                          <p>{message.content}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex items-start gap-4 p-4">
                    <BotAvatar gradient="code" size="sm" pulse />
                    <div className="flex-1">
                      <div className="font-semibold text-sm mb-2">Code AI</div>
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-gray-400">Generating code...</span>
                      </div>
                    </div>
                  </div>
                )}

                {showSlowWarning && (
                  <div className="flex items-center justify-center p-4">
                    <div className="bg-yellow-900/20 text-yellow-500 px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>Response is taking longer than usual...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-800 p-2 sm:p-4">
              <div className="max-w-3xl mx-auto">
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2 sm:gap-4">
                  <input
                    {...form.register("prompt")}
                    placeholder="Ask me to generate any code..."
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    disabled={isLoading || !form.watch("prompt")}
                    className="bg-green-600 hover:bg-green-700 px-3 sm:px-4"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center max-w-2xl mx-auto">
              {/* Animated Logo Section */}
              <div className="mb-8 relative">
                <div className="w-32 h-32 mx-auto relative">
                  {/* Rotating gradient background */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 opacity-20 blur-xl animate-pulse"></div>
                  
                  {/* Rotating logo container */}
                  <div className="relative w-full h-full animate-[spin_10s_linear_infinite]">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 p-0.5">
                      <div className="w-full h-full rounded-full bg-gray-950 flex items-center justify-center">
                        <Code className="w-16 h-16 text-green-500" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Orbiting icons */}
                  <div className="absolute inset-0 animate-[spin_15s_linear_infinite]">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="p-2 bg-gray-900 rounded-full border border-green-500/20">
                        <Terminal className="w-4 h-4 text-green-400" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                      <div className="p-2 bg-gray-900 rounded-full border border-emerald-500/20">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                      </div>
                    </div>
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2">
                      <div className="p-2 bg-gray-900 rounded-full border border-teal-500/20">
                        <Zap className="w-4 h-4 text-teal-400" />
                      </div>
                    </div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2">
                      <div className="p-2 bg-gray-900 rounded-full border border-lime-500/20">
                        <FileCode className="w-4 h-4 text-lime-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Welcome Text */}
              <h1 className="text-3xl sm:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-emerald-500">
                Code Generation AI
              </h1>
              
              <p className="text-xl text-gray-300 mb-8">
                Transform ideas into code with AI assistance
              </p>

              {/* Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                  <h3 className="font-semibold text-green-400 mb-2">Multi-Language Support</h3>
                  <p className="text-sm text-gray-400">
                    Generate code in Python, JavaScript, Java, C++, and more
                  </p>
                </div>
                <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                  <h3 className="font-semibold text-emerald-400 mb-2">Intelligent Debugging</h3>
                  <p className="text-sm text-gray-400">
                    Get help fixing bugs and optimizing your code
                  </p>
                </div>
                <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                  <h3 className="font-semibold text-teal-400 mb-2">Code Explanations</h3>
                  <p className="text-sm text-gray-400">
                    Understand complex code with detailed explanations
                  </p>
                </div>
                <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                  <h3 className="font-semibold text-lime-400 mb-2">Best Practices</h3>
                  <p className="text-sm text-gray-400">
                    Learn industry standards and coding best practices
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <Button 
                onClick={createNewSession} 
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-6 text-lg"
              >
                <Plus className="mr-2 h-5 w-5" /> Start Coding Now
              </Button>

              {/* SEO-friendly text */}
              <div className="mt-12 text-sm text-gray-400 max-w-lg mx-auto">
                <p className="mb-2">
                  Ready to code with AI? Our advanced code generation AI helps you:
                </p>
                <ul className="space-y-1">
                  <li>• Generate production-ready code in seconds</li>
                  <li>• Debug and optimize existing code</li>
                  <li>• Learn new programming languages and frameworks</li>
                  <li>• Create complex algorithms and data structures</li>
                  <li>• Build full-stack applications with best practices</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom animations */}
      <style jsx global>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default CodePage;