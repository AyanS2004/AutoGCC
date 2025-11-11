"use client"

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Send, Bot, User, Sparkles, RefreshCw, Lightbulb, Download, Trash2 } from 'lucide-react'
import axios from 'axios'

interface Message {
  role: 'user' | 'assistant'
  content: string
  sources?: Array<{ company: string; content: string }>
  timestamp: Date
}

interface ChatInterfaceProps {
  apiUrl?: string
}

export function ChatInterface({ apiUrl = 'http://localhost:5000' }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSources, setShowSources] = useState<{ [key: number]: boolean }>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load suggestions
    loadSuggestions()
    
    // Add welcome message
    setMessages([{
      role: 'assistant',
      content: '👋 Hello! I\'m your GCC Data Assistant powered by AI. I can help you discover insights about Global Capability Centers in our database.\n\nTry asking me about:\n• Specific companies and their operations\n• Comparisons between companies\n• Industry trends and statistics\n• Location analysis\n• Functional capabilities\n\nWhat would you like to know?',
      timestamp: new Date()
    }])
  }, [])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadSuggestions = async () => {
    try {
      const response = await axios.get(`${apiUrl}/chat/suggestions`)
      setSuggestions(response.data.suggestions || [])
    } catch (error) {
      console.error('Error loading suggestions:', error)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await axios.post(`${apiUrl}/chat/ask`, {
        question: input
      })

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.answer,
        sources: response.data.sources || [],
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error: any) {
      // Get more specific error message from response
      const errorDetails = error.response?.data?.error || error.message || 'Unknown error'
      
      const errorMessage: Message = {
        role: 'assistant',
        content: `❌ Sorry, I encountered an error processing your question:\n\n**Error:** ${errorDetails}\n\n**Possible causes:**\n• Ollama service is not running with NVIDIA GPU (run: \`start_ollama_nvidia.bat\`)\n• The tinyllama model is not installed (run: \`ollama pull tinyllama\`)\n• The RAG system is still initializing (wait a moment and try again)\n• Backend connection issue (check if backend is running on port 5000)\n\nPlease check the backend terminal for detailed logs.`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
      console.error('Chat error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
  }

  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      await axios.post(`${apiUrl}/chat/refresh`)
      const successMessage: Message = {
        role: 'assistant',
        content: '✅ Chat index has been refreshed with the latest data from the database!',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, successMessage])
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: '❌ Error refreshing the index. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearChat = () => {
    if (confirm('Are you sure you want to clear the chat history?')) {
      setMessages([{
        role: 'assistant',
        content: '👋 Chat cleared! How can I help you today?',
        timestamp: new Date()
      }])
    }
  }

  const exportChatHistory = () => {
    const chatHistory = messages.map(m => ({
      role: m.role,
      content: m.content,
      timestamp: m.timestamp.toISOString(),
      sources: m.sources
    }))
    
    const blob = new Blob([JSON.stringify(chatHistory, null, 2)], {
      type: 'application/json'
    })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chat-history-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const toggleSources = (index: number) => {
    setShowSources(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  return (
    <Card className="h-[700px] flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bot className="h-8 w-8 text-primary" />
              <Sparkles className="h-3 w-3 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Talk with the Data
                <Badge variant="secondary" className="text-xs">
                  AI Powered
                </Badge>
              </CardTitle>
              <CardDescription>
                Ask questions about GCC data in natural language
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={exportChatHistory}
              title="Export chat history"
              disabled={messages.length <= 1}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearChat}
              title="Clear chat"
              disabled={messages.length <= 1}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isLoading}
              title="Refresh data index"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-4">
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/20">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                </div>
              )}
              
              <div className={`flex-1 max-w-[85%] ${message.role === 'user' ? 'flex justify-end' : ''}`}>
                <div
                  className={`rounded-2xl p-4 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <button
                        onClick={() => toggleSources(idx)}
                        className="text-xs font-medium mb-2 opacity-70 hover:opacity-100 transition-opacity flex items-center gap-1"
                      >
                        <Sparkles className="h-3 w-3" />
                        {showSources[idx] ? 'Hide' : 'Show'} Sources ({message.sources.length})
                      </button>
                      
                      {showSources[idx] && (
                        <div className="space-y-2 mt-2">
                          {message.sources.map((source, sidx) => (
                            <div
                              key={sidx}
                              className="text-xs bg-background/50 rounded-lg p-2"
                            >
                              <Badge variant="outline" className="text-xs mb-1">
                                {source.company}
                              </Badge>
                              <p className="text-xs opacity-70 line-clamp-2">
                                {source.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {!showSources[idx] && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {message.sources.map((source, sidx) => (
                            <Badge key={sidx} variant="secondary" className="text-xs">
                              {source.company}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <p className="text-xs opacity-50 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {message.role === 'user' && (
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center ring-2 ring-secondary/20">
                    <User className="h-5 w-5" />
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/20">
                  <Bot className="h-5 w-5 text-primary animate-pulse" />
                </div>
              </div>
              <div className="bg-muted rounded-2xl p-4">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && suggestions.length > 0 && (
          <div className="mb-4 p-4 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-xl border border-primary/10">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-yellow-600" />
              <p className="text-sm font-medium">Try asking these questions:</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {suggestions.slice(0, 6).map((suggestion, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-xs justify-start text-left h-auto py-2 px-3 hover:bg-primary/5"
                >
                  <span className="line-clamp-2">{suggestion}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask about companies, locations, functions, or trends..."
            disabled={isLoading}
            className="flex-1 rounded-xl"
          />
          <Button 
            onClick={handleSend} 
            disabled={isLoading || !input.trim()}
            size="icon"
            className="rounded-xl"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Powered by AI • Responses may take a few seconds
        </p>
      </CardContent>
    </Card>
  )
}


