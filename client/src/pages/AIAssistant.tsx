import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { Bot, Send, User, Loader2, Paperclip, Mic, MicOff, X, FileText, File, AlertCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: { name: string; type: string }[];
}

export default function AIAssistant() {
  const { isAuthenticated, user } = useAuth();
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    window.location.href = "/login";
    return null;
  }

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello ${user?.name || 'there'}! I'm your AI credit monitoring assistant powered by DisputeStrike. I have expert knowledge of FCRA law, cross-bureau conflict detection, and documentation-driven dispute strategies.\n\nI can help you with:\n- **Analyzing your credit reports** - Upload a PDF or text file\n- **Identifying cross-bureau conflicts**\n- **Explaining FCRA violations**\n- **Reviewing Dispute letters**\n- **Answering credit monitoring questions**\n\n📎 You can attach documents (PDF, TXT) for analysis\n🎤 You can use voice input by clicking the microphone\n\nWhat would you like help with today?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; type: string; base64: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const sendMessage = trpc.ai.chat.useMutation();
  const analyzeDocument = trpc.ai.analyzeDocument.useMutation();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle file attachment
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large. Max 10MB.`);
        continue;
      }

      const allowedTypes = ['application/pdf', 'text/plain', 'text/csv'];
      const allowedExtensions = ['.txt', '.pdf', '.csv'];
      const hasValidType = allowedTypes.includes(file.type);
      const hasValidExtension = allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
      
      if (!hasValidType && !hasValidExtension) {
        toast.error(`File type not supported. Please upload PDF or TXT files.`);
        continue;
      }

      try {
        // Convert file to base64
        const arrayBuffer = await file.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );

        setAttachedFiles(prev => [...prev, {
          name: file.name,
          type: file.type || 'application/pdf',
          base64: base64
        }]);
        
        toast.success(`Attached: ${file.name}`);
      } catch (error) {
        console.error('File read error:', error);
        toast.error(`Failed to read file: ${file.name}`);
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove attached file
  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Voice recording using Web Speech API
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Speech recognition not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
      toast.info('🎤 Listening... Speak now');
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setInput(prev => prev + (prev ? ' ' : '') + finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      
      if (event.error === 'not-allowed') {
        toast.error('Microphone access denied. Please allow microphone access in your browser settings.');
      } else if (event.error === 'no-speech') {
        toast.info('No speech detected. Please try again.');
      } else {
        toast.error(`Speech recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      if (recognitionRef.current === recognition) {
        toast.success('Speech captured');
      }
    };

    try {
      recognition.start();
    } catch (error) {
      console.error('Failed to start recognition:', error);
      toast.error('Failed to start speech recognition');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
  };

  const handleSend = async () => {
    if ((!input.trim() && attachedFiles.length === 0) || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input || 'Please analyze the attached document(s)',
      timestamp: new Date(),
      attachments: attachedFiles.length > 0 ? attachedFiles.map(f => ({ name: f.name, type: f.type })) : undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    const currentFiles = [...attachedFiles];
    setInput('');
    setAttachedFiles([]);
    setIsLoading(true);

    try {
      let response: { response: string };

      if (currentFiles.length > 0) {
        // If there are attachments, use the document analysis endpoint
        const fileData = currentFiles.map(f => ({
          name: f.name,
          type: f.type,
          base64: f.base64
        }));

        response = await analyzeDocument.mutateAsync({
          message: currentInput || 'Please analyze this document and identify any negative accounts, FCRA violations, or issues that could be disputed.',
          files: fileData,
          conversationHistory: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content,
          })),
        });
      } else {
        // Regular chat without attachments
        response = await sendMessage.mutateAsync({
          message: currentInput,
          conversationHistory: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content,
          })),
        });
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to get response: ${errorMessage}`);
      
      // Add error message to chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `I apologize, but I encountered an error processing your request. Please try again. Error: ${errorMessage}`,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bot className="h-6 w-6 text-orange-500" />
            AI Assistant
          </h1>
          <p className="text-gray-500 mt-1">
            Get expert advice on credit disputes, FCRA law, and dispute strategies. Upload documents or use voice input.
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardTitle className="text-xl">Credit Dispute AI Assistant</CardTitle>
            <CardDescription className="text-blue-100">
              Powered by DisputeStrike AI - Expert FCRA Knowledge | 📎 Attach Documents | 🎤 Voice Input
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[450px] p-6" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-2">
                          {message.attachments.map((file, i) => (
                            <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 rounded text-sm">
                              <FileText className="h-3 w-3" />
                              {file.name}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-orange-200' : 'text-gray-500'}`}>
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                    {message.role === 'user' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-lg p-4">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Attached Files Preview */}
            {attachedFiles.length > 0 && (
              <div className="px-6 py-2 border-t bg-gray-50">
                <div className="flex flex-wrap gap-2">
                  {attachedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 px-3 py-1 bg-white border rounded-full text-sm">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="max-w-[150px] truncate">{file.name}</span>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                {/* File Attachment Button */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".pdf,.txt,.csv"
                  multiple
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  title="Attach credit reports (PDF, TXT)"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>

                {/* Voice Input Button */}
                <Button
                  variant={isRecording ? "destructive" : "outline"}
                  size="icon"
                  onClick={toggleRecording}
                  disabled={isLoading}
                  title={isRecording ? "Stop recording" : "Start voice input"}
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>

                {/* Text Input */}
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about credit, FCRA law, or attach a document..."
                  disabled={isLoading}
                  className="flex-1"
                />

                {/* Send Button */}
                <Button
                  onClick={handleSend}
                  disabled={(!input.trim() && attachedFiles.length === 0) || isLoading}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                📎 Attach credit reports (PDF, TXT) | 🎤 Click mic for voice input | Press Enter to send
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
