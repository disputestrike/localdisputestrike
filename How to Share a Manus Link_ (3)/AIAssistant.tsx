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
