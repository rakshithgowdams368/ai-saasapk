// app/(dashboard)/(routes)/conversation/page.tsx
"use client";

import * as z from "zod";
import axios from "axios";
import { 
  MessageSquare, 
  Plus, 
  Loader2, 
  Send, 
  AlertCircle, 
  Menu,
  MoreVertical,
  Pencil,
  Trash,
  X,
  Check,
  Bot,
  Sparkles,
  Brain,
  Zap
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formSchema } from "./constants";
import { useProModal } from "@/hooks/use-pro-modal";
import { toast } from "sonner";
import ReactMarkdown from 'react-markdown';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/user-avatar";
import { BotAvatar } from "@/components/bot-avatar";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: Date;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

const ConversationPage = () => {
  const router = useRouter();
  const proModal = useProModal();
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSlowWarning, setShowSlowWarning] = useState(false);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const currentChat = chats.find(chat => chat.id === currentChatId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages]);

  useEffect(() => {
    // Load chats from localStorage
    const savedChats = localStorage.getItem('ai-chats');
    if (savedChats) {
      setChats(JSON.parse(savedChats));
    }
  }, []);

  useEffect(() => {
    // Save chats to localStorage
    if (chats.length > 0) {
      localStorage.setItem('ai-chats', JSON.stringify(chats));
    }
  }, [chats]);

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
    };
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    setIsSidebarOpen(false);
  };

  const deleteChat = (chatId: string) => {
    if (window.confirm('Are you sure you want to delete this chat?')) {
      setChats(prev => prev.filter(chat => chat.id !== chatId));
      if (currentChatId === chatId) {
        setCurrentChatId(null);
      }
      toast.success('Chat deleted');
    }
  };

  const startEditingChat = (chat: Chat) => {
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
  };

  const saveEditChat = (chatId: string) => {
    if (editTitle.trim()) {
      setChats(prev => prev.map(chat => 
        chat.id === chatId ? { ...chat, title: editTitle.trim() } : chat
      ));
      toast.success('Chat renamed');
    }
    setEditingChatId(null);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (!currentChatId) {
        createNewChat();
        // Wait for the next render cycle to ensure the chat is created
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

      // Update current chat with user message
      setChats(prev => prev.map(chat => 
        chat.id === currentChatId 
          ? { ...chat, messages: [...chat.messages, userMessage] }
          : chat
      ));

      form.reset();
      setIsLoading(true);
      setShowSlowWarning(false);

      // Set timeout for slow response warning
      timeoutRef.current = setTimeout(() => {
        setShowSlowWarning(true);
      }, 5000);

      const currentMessages = currentChat?.messages || [];
      const response = await axios.post("/api/conversation", {
        messages: [...currentMessages, userMessage],
      });

      clearTimeout(timeoutRef.current);

      const assistantMessage: Message = {
        role: "assistant",
        content: response.data.content,
        timestamp: new Date(),
      };

      // Update chat with assistant response and title if needed
      setChats(prev => prev.map(chat => {
        if (chat.id === currentChatId) {
          const updatedMessages = [...chat.messages, assistantMessage];
          const shouldUpdateTitle = chat.title === "New Chat" && updatedMessages.length === 2;
          
          return {
            ...chat,
            messages: updatedMessages,
            title: shouldUpdateTitle ? values.prompt.slice(0, 30) + "..." : chat.title,
          };
        }
        return chat;
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

  // Dropdown Menu Component
  const ChatActionsMenu = ({ chat }: { chat: Chat }) => {
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
                  startEditingChat(chat);
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
                  deleteChat(chat.id);
                  setIsOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-gray-700"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  const ChatSidebar = () => (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="p-4">
        <Button 
          onClick={createNewChat} 
          className="w-full bg-violet-600 hover:bg-violet-700"
        >
          <Plus className="mr-2 h-4 w-4" /> New Chat
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {chats.map(chat => (
          <div
            key={chat.id}
            className={cn(
              "group flex items-center",
              currentChatId === chat.id && "bg-gray-800"
            )}
          >
            {editingChatId === chat.id ? (
              <div className="flex-1 flex items-center p-3 gap-2">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="flex-1 bg-gray-700 px-2 py-1 rounded text-sm text-white border border-gray-600 focus:outline-none focus:border-violet-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      saveEditChat(chat.id);
                    } else if (e.key === 'Escape') {
                      setEditingChatId(null);
                    }
                  }}
                />
                <button
                  onClick={() => saveEditChat(chat.id)}
                  className="p-1 hover:bg-gray-600 rounded"
                >
                  <Check className="h-4 w-4 text-green-500" />
                </button>
                <button
                  onClick={() => setEditingChatId(null)}
                  className="p-1 hover:bg-gray-600 rounded"
                >
                  <X className="h-4 w-4 text-red-500" />
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => {
                    setCurrentChatId(chat.id);
                    setIsSidebarOpen(false);
                  }}
                  className={cn(
                    "flex-1 text-left p-3 hover:bg-gray-800 transition-colors flex items-center gap-2",
                    currentChatId === chat.id && "border-l-2 border-violet-500"
                  )}
                >
                  <MessageSquare className="h-4 w-4 text-gray-400" />
                  <span className="truncate text-sm text-gray-300">{chat.title}</span>
                </button>
                
                <ChatActionsMenu chat={chat} />
              </>
            )}
          </div>
        ))}
        
        {chats.length === 0 && (
          <div className="p-4 text-center text-gray-400 text-sm">
            No chats yet. Start a new conversation!
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
            <ChatSidebar />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-80 border-r border-gray-800">
        <ChatSidebar />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {currentChatId ? (
          <>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-4 lg:p-6">
              <div className="max-w-3xl mx-auto">
                {currentChat?.messages.map((message, index) => (
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
                      <BotAvatar gradient="conversation" size="sm" />
                    )}
                    
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="font-semibold text-sm">
                        {message.role === "user" ? "You" : "5ModelAI"}
                      </div>
                      <div className="text-gray-300 break-words">
                        {message.role === "assistant" ? (
                          <ReactMarkdown
                            className="prose prose-invert prose-sm max-w-none"
                            components={{
                              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                              ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                              li: ({ children }) => <li className="mb-1">{children}</li>,
                              code: ({ inline, children }) => 
                                inline ? (
                                  <code className="bg-gray-800 px-1 py-0.5 rounded text-sm">{children}</code>
                                ) : (
                                  <code className="block bg-gray-900 p-4 rounded-lg my-2 text-sm overflow-x-auto">{children}</code>
                                ),
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
                    <BotAvatar gradient="conversation" size="sm" pulse />
                    <div className="flex-1">
                      <div className="font-semibold text-sm mb-2">5ModelAI</div>
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-gray-400">Thinking...</span>
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
                    placeholder="Send a message..."
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm sm:text-base"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    disabled={isLoading || !form.watch("prompt")}
                    className="bg-violet-600 hover:bg-violet-700 px-3 sm:px-4"
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
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 opacity-20 blur-xl animate-pulse"></div>
                  
                  {/* Rotating logo container */}
                  <div className="relative w-full h-full animate-[spin_10s_linear_infinite]">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 p-0.5">
                      <div className="w-full h-full rounded-full bg-gray-950 flex items-center justify-center">
                        <Bot className="w-16 h-16 text-violet-500" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Orbiting icons */}
                  <div className="absolute inset-0 animate-[spin_15s_linear_infinite]">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="p-2 bg-gray-900 rounded-full border border-violet-500/20">
                        <Brain className="w-4 h-4 text-violet-400" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                      <div className="p-2 bg-gray-900 rounded-full border border-indigo-500/20">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                      </div>
                    </div>
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2">
                      <div className="p-2 bg-gray-900 rounded-full border border-blue-500/20">
                        <Zap className="w-4 h-4 text-blue-400" />
                      </div>
                    </div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2">
                      <div className="p-2 bg-gray-900 rounded-full border border-purple-500/20">
                        <MessageSquare className="w-4 h-4 text-purple-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Welcome Text */}
              <h1 className="text-3xl sm:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-indigo-500">
                Welcome to 5ModleAI Chat
              </h1>
              
              <p className="text-xl text-gray-300 mb-8">
                Experience the future of AI conversation
              </p>

              {/* Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                  <h3 className="font-semibold text-violet-400 mb-2">Smart Conversations</h3>
                  <p className="text-sm text-gray-400">
                    Engage in intelligent dialogues with our advanced AI assistant
                  </p>
                </div>
                <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                  <h3 className="font-semibold text-indigo-400 mb-2">Multi-Purpose AI</h3>
                  <p className="text-sm text-gray-400">
                    Get help with coding, writing, analysis, and creative tasks
                  </p>
                </div>
                <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                  <h3 className="font-semibold text-blue-400 mb-2">Context Awareness</h3>
                  <p className="text-sm text-gray-400">
                    Our AI remembers your conversation context for better responses
                  </p>
                </div>
                <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                  <h3 className="font-semibold text-purple-400 mb-2">Instant Responses</h3>
                  <p className="text-sm text-gray-400">
                    Get quick, accurate answers to your questions 24/7
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <Button 
                onClick={createNewChat} 
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-8 py-6 text-lg"
              >
                <Plus className="mr-2 h-5 w-5" /> Start Your AI Journey
              </Button>

              {/* SEO-friendly text */}
              <div className="mt-12 text-sm text-gray-400 max-w-lg mx-auto">
                <p className="mb-2">
                  Ready to communicate with AI? Start your conversation with 5Model AI - your intelligent AI assistant for:
                </p>
                <ul className="space-y-1">
                  <li>• Writing SEO-friendly content and marketing copy</li>
                  <li>• Generating code and debugging solutions</li>
                  <li>• Creative brainstorming and idea generation</li>
                  <li>• Learning and educational support</li>
                  <li>• Data analysis and insights</li>
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

export default ConversationPage;