import React, { useState, useRef, useEffect, type KeyboardEvent, type DragEvent, type ClipboardEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send,
  Leaf,
  Recycle,
  User,
  ShieldCheck,
  HelpCircle,
  Loader2,
  Trash2,
  Camera,
  Image as ImageIcon,
  X,
  UploadCloud,
  Maximize2,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { classifyWasteItem } from '../services/classifier';
import { ResultCard } from '../components/ResultCard';
import { compressAndReadImage, SAMPLE_WASTE_PHOTOS, type SampleWasteImage } from '../utils/imageHelper';
import type { ClassificationResult, WasteCategory } from '../types';

export const ClassifyPage: React.FC = () => {
  const { authMode, messages, addMessage, clearMessages, incrementEcoScore, addToHistory } = useApp();
  const [inputValue, setInputValue] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ src: string; title: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, selectedImage]);

  // Quick Test Suggestions (both text and photo)
  const sampleItems: { label: string; cat: WasteCategory }[] = [
    { label: 'Marigold flowers (Pooja waste)', cat: 'Wet' },
    { label: 'Rinsed milk pouch (Amul / Mother Dairy)', cat: 'Dry' },
    { label: 'Broken CFL bulb', cat: 'Harmful' },
    { label: 'Used Tetra Pak juice carton', cat: 'Recyclable' },
    { label: 'Chai patti (Used tea leaves)', cat: 'Wet' },
    { label: 'Expired paracetamol strip', cat: 'Harmful' },
    { label: 'Old smartphone / charger', cat: 'E-Waste' },
  ];

  const handleProcessImageFile = async (file: File) => {
    try {
      setErrorMessage(null);
      const dataUrl = await compressAndReadImage(file);
      setSelectedImage(dataUrl);
      setSelectedImageName(file.name || 'Uploaded Photo');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load image. Please select a valid JPEG or PNG file.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessImageFile(file);
    }
    // reset input so the same file can be chosen again
    e.target.value = '';
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleProcessImageFile(file);
    } else if (file) {
      setErrorMessage('Please drop an image file (JPEG, PNG, WebP).');
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          handleProcessImageFile(file);
          break;
        }
      }
    }
  };

  const handleSelectSamplePhoto = (sample: SampleWasteImage) => {
    const dataUrl = sample.getDataUrl();
    setSelectedImage(dataUrl);
    setSelectedImageName(`${sample.name} (${sample.categoryHint})`);
    setErrorMessage(null);
  };

  const clearSelectedImage = () => {
    setSelectedImage(null);
    setSelectedImageName(null);
  };

  const handleSend = async (forcedText?: string, forcedImage?: string) => {
    const query = (forcedText !== undefined ? forcedText : inputValue).trim();
    const imageToSubmit = forcedImage !== undefined ? forcedImage : selectedImage;

    if ((!query && !imageToSubmit) || isLoading) return;

    setErrorMessage(null);
    setInputValue('');
    setSelectedImage(null);
    setSelectedImageName(null);

    // Add User Message
    const userMsgId = `user-${Date.now()}`;
    addMessage({
      id: userMsgId,
      sender: 'user',
      text: query || (imageToSubmit ? 'Classify this waste item image' : undefined),
      image: imageToSubmit || undefined,
      timestamp: Date.now(),
    });

    setIsLoading(true);

    try {
      const result: ClassificationResult = await classifyWasteItem(query, imageToSubmit || undefined);

      // Add AI Response Message
      const aiMsgId = `ai-${Date.now()}`;
      addMessage({
        id: aiMsgId,
        sender: 'ai',
        result,
        timestamp: Date.now(),
      });

      // Update EcoScore and persistent history if logged in
      if (authMode === 'login') {
        incrementEcoScore(3);
        addToHistory(result);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Classification failed. Please try again.');
    } finally {
      setIsLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="flex-1 flex flex-col min-h-screen bg-[#F8FAF8] text-neutral-800 relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden File Inputs for Camera and Gallery */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Drag and drop overlay indicator */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-emerald-950/60 backdrop-blur-xs flex items-center justify-center pointer-events-none p-6"
          >
            <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border-2 border-dashed border-emerald-500 flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <UploadCloud className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-1">Drop Image to Classify</h3>
              <p className="text-sm text-neutral-500">
                We will scan and classify it into Dry, Wet, Harmful, Recyclable, or E-Waste streams.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox / Enlarged Image Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
          >
            <div className="relative max-w-2xl max-h-[85vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="absolute -top-12 right-0 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 cursor-pointer transition-colors"
                title="Close preview"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={lightboxImage.src}
                alt={lightboxImage.title}
                className="rounded-2xl max-h-[80vh] w-auto object-contain shadow-2xl border border-white/20"
              />
              <p className="text-white text-xs font-medium mt-3 bg-black/40 px-3 py-1 rounded-full">
                {lightboxImage.title}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Page Header Bar */}
      <div className="bg-white border-b border-neutral-200/80 px-4 sm:px-6 py-3.5 sticky top-16 z-20 shadow-2xs">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
              Classify Waste
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer border border-emerald-200"
              title="Take photo with camera"
            >
              <Camera className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Camera</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer border border-neutral-200"
              title="Upload photo from device"
            >
              <ImageIcon className="w-3.5 h-3.5 text-neutral-600" />
              <span className="hidden sm:inline">Upload Image</span>
            </button>

            {messages.length > 0 && (
              <button
                type="button"
                onClick={clearMessages}
                className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-rose-200 ml-1"
                title="Clear conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Conversation Feed Area */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-6 pt-6 pb-56 flex flex-col">
        {/* Empty State */}
        <AnimatePresence>
          {messages.length === 0 && !isLoading && (
            <motion.div
              id="chat-empty-state"
              key="chat-empty-state"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -16, transition: { duration: 0.2 } }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 my-auto flex flex-col items-center justify-center text-center p-6 sm:p-10 max-w-xl mx-auto"
            >
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-4 shadow-xs">
                <Recycle className="w-8 h-8 text-[#10B981]" />
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 mb-2 tracking-tight">
                Classify by Text or Image
              </h2>

              <p className="text-sm text-neutral-600 leading-relaxed max-w-md mb-6">
                Take a photo, upload an image, or type an item to get instant AI classification into <strong>Dry</strong>, <strong>Wet</strong>, <strong>Harmful</strong>, <strong>Recyclable</strong>, or <strong>E-Waste</strong>.
              </p>

              {/* Action Buttons in Empty State */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 mb-6">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs shadow-sm cursor-pointer transition-transform active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  <span>Snap Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-50 text-neutral-800 font-bold text-xs border border-neutral-300 shadow-2xs cursor-pointer transition-transform active:scale-95"
                >
                  <ImageIcon className="w-4 h-4 text-emerald-600" />
                  <span>Upload Waste Image</span>
                </button>
              </div>

              {/* Sample Photo Tryout Row */}
              <div className="w-full bg-white rounded-2xl p-4 border border-neutral-200/90 shadow-2xs text-left">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                    Try Sample Waste Images:
                  </span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium">
                    1-Click Test
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SAMPLE_WASTE_PHOTOS.map((sample) => (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => handleSelectSamplePhoto(sample)}
                      className="flex items-center gap-2 p-2 rounded-xl bg-neutral-50 hover:bg-emerald-50/70 border border-neutral-200/80 hover:border-emerald-300 text-left transition-all cursor-pointer group"
                    >
                      <span className="text-xl shrink-0 group-hover:scale-110 transition-transform">
                        {sample.icon}
                      </span>
                      <div className="overflow-hidden">
                        <p className="text-xs font-semibold text-neutral-800 truncate group-hover:text-emerald-900">
                          {sample.name}
                        </p>
                        <span className="text-[10px] font-medium text-neutral-500 group-hover:text-emerald-700">
                          ({sample.categoryHint})
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message Feed */}
        <div className="space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{
                  opacity: 0,
                  y: msg.sender === 'user' ? 14 : 18,
                  scale: 0.97,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 380,
                  damping: 28,
                  mass: 0.8,
                }}
              >
                {msg.sender === 'user' ? (
                  /* User Bubble */
                  <div className="flex justify-end gap-2.5 max-w-2xl ml-auto">
                    <div className="flex flex-col items-end">
                      <div className="bg-[#10B981] text-white p-3 rounded-2xl rounded-tr-xs shadow-sm font-medium text-sm sm:text-base leading-relaxed break-words max-w-md sm:max-w-lg">
                        {msg.image && (
                          <div className="mb-2 relative group">
                            <img
                              src={msg.image}
                              alt="Uploaded waste item"
                              className="w-48 sm:w-56 h-36 sm:h-40 object-cover rounded-xl border border-white/30 shadow-inner cursor-pointer"
                              onClick={() => setLightboxImage({ src: msg.image!, title: msg.text || 'Waste Item' })}
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center pointer-events-none">
                              <span className="bg-black/60 text-white text-[11px] px-2 py-0.5 rounded-md flex items-center gap-1">
                                <Maximize2 className="w-3 h-3" /> Click to enlarge
                              </span>
                            </div>
                            <span className="inline-flex items-center gap-1 text-[10px] bg-black/30 text-white/90 px-2 py-0.5 rounded-md mt-1 font-sans">
                              <Camera className="w-3 h-3" /> Image Classification Request
                            </span>
                          </div>
                        )}
                        {msg.text && (
                          <p className={msg.image ? 'text-xs text-white/95 mt-1' : ''}>
                            {msg.text}
                          </p>
                        )}
                      </div>
                      <span className="text-[10px] text-neutral-400 mt-1 mr-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200 shadow-2xs">
                      <User className="w-4 h-4" />
                    </div>
                  </div>
                ) : (
                  /* AI Response Bubble */
                  <div className="flex gap-3 max-w-3xl mr-auto">
                    <div className="w-8 h-8 rounded-xl bg-white border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
                      <Recycle className="w-4 h-4 text-[#10B981]" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-neutral-800">
                          Eco Scan AI
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {msg.result && (
                        <ResultCard result={msg.result} />
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* AI Loading Bubble */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                key="ai-loading"
                initial={{ opacity: 0, y: 14, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 30,
                }}
                className="flex gap-3 max-w-xl mr-auto"
              >
                <div className="w-8 h-8 rounded-xl bg-white border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
                  <Loader2 className="w-4 h-4 text-[#10B981] animate-spin" />
                </div>
                <div className="bg-white border border-emerald-100 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span className="text-xs font-medium text-neutral-600">
                    Scanning visual item into Dry, Wet, Harmful streams...
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Fixed Bottom Input Bar Area */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-[#F8FAF8] via-[#F8FAF8]/95 to-transparent pt-3 pb-4 sm:pb-6 px-4">
        <div className="max-w-3xl mx-auto flex flex-col gap-2">
          {/* Quick Suggestions (Text & Photos) */}
          <div
            id="quick-test-chips-bar"
            className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none text-xs"
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 whitespace-nowrap pl-1 pr-1">
              Suggestions:
            </span>
            {/* Quick Photo Chips */}
            {SAMPLE_WASTE_PHOTOS.slice(0, 3).map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleSelectSamplePhoto(sample)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-full text-xs transition-all cursor-pointer border whitespace-nowrap flex items-center gap-1.5 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900 border-emerald-200/90 shadow-2xs disabled:opacity-50 font-medium"
                title={`Attach sample ${sample.name}`}
              >
                <span>{sample.icon}</span>
                <span>{sample.name}</span>
                <span className="text-[10px] text-emerald-700 font-mono">
                  ({sample.categoryHint})
                </span>
              </button>
            ))}

            {/* Quick Text Chips */}
            {sampleItems.slice(0, 4).map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleSend(item.label)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-full text-xs transition-all cursor-pointer border whitespace-nowrap flex items-center gap-1 bg-white hover:bg-emerald-50 text-neutral-700 hover:text-emerald-900 border-neutral-200/90 hover:border-emerald-300 shadow-2xs disabled:opacity-50"
              >
                <span>{item.label}</span>
                <span className="text-[10px] text-neutral-400 font-mono">
                  ({item.cat})
                </span>
              </button>
            ))}
          </div>

          {/* Input Card with Image Preview Attachment */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 shadow-lg shadow-emerald-950/5 p-2 sm:p-2.5 transition-all focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
            {/* Attached Image Preview Bar */}
            <AnimatePresence>
              {selectedImage && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: 6 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -6 }}
                  className="flex items-center justify-between gap-3 p-2 mb-2 bg-emerald-50/70 rounded-xl border border-emerald-200/80 overflow-hidden"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <img
                      src={selectedImage}
                      alt="Selected waste item"
                      className="w-12 h-12 object-cover rounded-lg border border-emerald-300 shrink-0 shadow-2xs"
                    />
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-emerald-950 truncate">
                          {selectedImageName || 'Waste Photo Attached'}
                        </span>
                        <span className="text-[10px] bg-emerald-200/80 text-emerald-900 font-medium px-1.5 py-0.2 rounded-sm">
                          Ready
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-800/80 truncate">
                        Image ready for classification
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={clearSelectedImage}
                    className="w-7 h-7 rounded-lg bg-white/80 hover:bg-white text-neutral-500 hover:text-rose-600 flex items-center justify-center shrink-0 border border-emerald-200 cursor-pointer transition-colors"
                    title="Remove attached image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-end gap-1.5 sm:gap-2">
              {/* Camera Capture Button */}
              <button
                id="camera-capture-btn"
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={isLoading}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-neutral-100 hover:bg-emerald-50 text-neutral-600 hover:text-emerald-700 flex items-center justify-center shrink-0 transition-colors cursor-pointer border border-neutral-200 hover:border-emerald-300 disabled:opacity-50"
                title="Take photo of waste item"
                aria-label="Take Photo"
              >
                <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Image Upload Button */}
              <button
                id="image-upload-btn"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-neutral-100 hover:bg-emerald-50 text-neutral-600 hover:text-emerald-700 flex items-center justify-center shrink-0 transition-colors cursor-pointer border border-neutral-200 hover:border-emerald-300 disabled:opacity-50"
                title="Upload image from device or paste (Ctrl+V)"
                aria-label="Upload Image"
              >
                <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Text Input Area */}
              <textarea
                ref={textareaRef}
                id="waste-item-input"
                rows={1}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder={
                  selectedImage
                    ? 'Optional: Add item note or press Send to classify image...'
                    : 'Describe waste or upload/snap a photo (Paste with Ctrl+V)...'
                }
                disabled={isLoading}
                className="flex-1 max-h-32 min-h-[40px] px-3 py-2 text-sm sm:text-base text-neutral-900 placeholder:text-neutral-400 focus:outline-none resize-none bg-transparent disabled:opacity-60"
              />

              {/* Circular Emerald Green Send Button */}
              <button
                id="send-classify-btn"
                type="button"
                onClick={() => handleSend()}
                disabled={isLoading || (!inputValue.trim() && !selectedImage)}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#10B981] hover:bg-emerald-600 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center shrink-0 transition-all duration-150 shadow-md shadow-emerald-600/30 cursor-pointer"
                title="Send classification request"
                aria-label="Send"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Validation Error Notice if any */}
          {errorMessage && (
            <p className="text-xs text-rose-600 font-medium px-2 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMessage}</span>
            </p>
          )}

          {/* Bottom Bar Footer: Helper text + Privacy Badge */}
          <div className="flex items-center justify-between px-2 text-[11px] text-neutral-400">
            <span className="hidden sm:inline">
              Snap photo, upload image, paste (Ctrl+V) or Enter to classify
            </span>
            <span className="sm:hidden">
              Photo, image or Enter to send
            </span>

            {/* Privacy Badge on the right */}
            <div
              id="input-privacy-badge"
              className="inline-flex items-center gap-1 font-medium text-emerald-800 bg-emerald-50/80 px-2 py-0.5 rounded-md border border-emerald-200/60"
            >
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>
                {authMode === 'guest' ? 'Guest Mode • Zero Storage' : 'Privacy Guard Protected'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
