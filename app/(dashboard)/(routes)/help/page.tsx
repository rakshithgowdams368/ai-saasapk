// app/(dashboard)/(routes)/help/page.tsx
"use client";

import { useState } from "react";
import { faqData } from "./constants";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HelpCircle, 
  Search, 
  MessageSquare, 
  FileText, 
  Video, 
  BookOpen,
  ChevronDown,
  ChevronUp,
  Mail,
  User,
  Send,
  Sparkles,
  PhoneCall,
  Clock,
  Zap,
  CheckCircle,
  ExternalLink,
  Github,
  Twitter,
  Youtube,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Categories for better organization
  const categories = [
    { id: "all", name: "All Topics", icon: BookOpen },
    { id: "account", name: "Account", icon: User },
    { id: "billing", name: "Billing", icon: FileText },
    { id: "api", name: "API", icon: Zap },
    { id: "features", name: "Features", icon: Sparkles }
  ];

  // Quick links for common issues
  const quickLinks = [
    { title: "Getting Started Guide", href: "#", icon: BookOpen },
    { title: "API Documentation", href: "#", icon: FileText },
    { title: "Video Tutorials", href: "#", icon: Video },
    { title: "Community Forum", href: "#", icon: MessageSquare }
  ];

  // Contact methods
  const contactMethods = [
    { icon: Mail, title: "Email Support", description: "Get help via email", response: "24-48 hours" },
    { icon: MessageSquare, title: "Live Chat", description: "Chat with our team", response: "5-10 minutes" },
    { icon: PhoneCall, title: "Phone Support", description: "Call us directly", response: "Immediate" }
  ];

  const filteredFaqs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Message sent successfully! We'll get back to you soon.");
      setName("");
      setEmail("");
      setMessage("");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white">
      {/* Hero Section */}
      <div className="relative border-b border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-transparent to-purple-600/20 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-xl opacity-50 animate-pulse" />
                <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-2xl">
                  <HelpCircle className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              How can we{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                help you?
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              Search our knowledge base or contact our support team
            </p>
            
            {/* Search Bar */}
            <div className="max-w-3xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search for help articles, documentation, or FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-lg bg-gray-900/50 border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Links */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-semibold mb-6">Quick Links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map((link, index) => (
              <motion.a
                key={link.title}
                href={link.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -5 }}
                className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-xl border border-gray-800 hover:border-gray-700 transition-all group"
              >
                <div className="p-3 bg-gray-800 rounded-lg group-hover:bg-gray-700">
                  <link.icon className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium">{link.title}</h3>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {/* Categories Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <h2 className="text-2xl font-semibold mb-6">Categories</h2>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                    activeCategory === category.id
                      ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      : "bg-gray-900/50 text-gray-300 hover:bg-gray-800 border border-transparent"
                  }`}
                >
                  <category.icon className="w-5 h-5" />
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* FAQ List */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <AnimatePresence>
                {filteredFaqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card 
                      className={`bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-all cursor-pointer ${
                        expandedFaq === index ? 'border-blue-500/50' : ''
                      }`}
                      onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg">{faq.question}</h3>
                          {expandedFaq === index ? (
                            <ChevronUp className="w-5 h-5 text-blue-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <AnimatePresence>
                          {expandedFaq === index && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <p className="mt-4 text-gray-400">{faq.answer}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Contact Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-semibold mb-8 text-center">Get in Touch</h2>
          
          {/* Contact Methods */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {contactMethods.map((method, index) => (
              <motion.div
                key={method.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -5 }}
                className="p-6 bg-gray-900/50 rounded-xl border border-gray-800 hover:border-gray-700 transition-all"
              >
                <method.icon className="w-10 h-10 text-blue-400 mb-4" />
                <h3 className="font-semibold text-lg mb-2">{method.title}</h3>
                <p className="text-gray-400 mb-3">{method.description}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>Response time: {method.response}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact Form */}
          <Card className="max-w-2xl mx-auto bg-gray-900/50 border-gray-800">
            <div className="p-8">
              <h3 className="text-2xl font-semibold mb-6 text-center">Send us a Message</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="pl-10 bg-gray-800 border-gray-700 focus:ring-2 focus:ring-blue-500"
                        placeholder="Your name"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10 bg-gray-800 border-gray-700 focus:ring-2 focus:ring-blue-500"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Message
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      className="pl-10 pt-3 bg-gray-800 border-gray-700 focus:ring-2 focus:ring-blue-500 min-h-[150px]"
                      placeholder="How can we help you?"
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Sending...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="w-5 h-5" />
                      Send Message
                    </div>
                  )}
                </Button>
              </form>
            </div>
          </Card>
        </motion.div>

        {/* Footer Resources */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <h2 className="text-xl font-semibold mb-6">Additional Resources</h2>
          <div className="flex justify-center gap-6">
            <a href="#" className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors">
              <Github className="w-5 h-5" />
              <span>GitHub</span>
            </a>
            <a href="#" className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors">
              <Twitter className="w-5 h-5" />
              <span>Twitter</span>
            </a>
            <a href="#" className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors">
              <Youtube className="w-5 h-5" />
              <span>YouTube</span>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}