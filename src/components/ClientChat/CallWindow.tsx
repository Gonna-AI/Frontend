import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Phone, X, Mic, MicOff, Square, MessageSquare, Upload } from 'lucide-react';
import { cn } from '../../utils/cn';

interface CallWindowProps {
  isDark: boolean;
  onClose: () => void;
  onStopAI: () => void;
  onFileUpload?: (file: File) => void;
}

export default function CallWindow({ isDark, onClose, onStopAI, onFileUpload }: CallWindowProps) {
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isAIStopped, setIsAIStopped] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleStopAI = () => {
    setIsAIStopped(true);
    onStopAI();
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onFileUpload) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload only image files (JPEG, PNG, GIF, or WebP)');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('Image size should be less than 10MB');
        return;
      }
      onFileUpload(file);
      event.target.value = '';
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className={cn(
          "fixed bottom-0 inset-x-0 z-50 flex flex-col items-center h-[80vh] relative overflow-hidden rounded-t-3xl",
          isDark 
            ? "bg-black/20 border-t border-white/10 backdrop-blur-md" 
            : "bg-white/10 border-t border-black/10 backdrop-blur-md"
        )}
      >
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[35rem] h-[35rem] bg-gradient-to-bl from-blue-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[35rem] h-[35rem] bg-gradient-to-tr from-purple-500/10 to-transparent blur-3xl pointer-events-none" />

        <div className="flex justify-start w-full relative z-10 p-6">
          <button
            onClick={onClose}
            className={cn(
              "p-2 rounded-xl transition-colors",
              isDark 
                ? "bg-black/20 border border-white/10 text-white hover:bg-black/30" 
                : "bg-white/10 border border-black/10 text-black hover:bg-white/20"
            )}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center relative z-10">
          <div className={cn(
            "w-24 h-24 rounded-xl flex items-center justify-center mb-4",
            isDark 
              ? "bg-black/20 border border-white/10" 
              : "bg-white/10 border border-black/10"
          )}>
            <svg
              viewBox="0 0 500 500"
              className="w-20 h-20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                fill={isDark ? "white" : "black"}
                d="M275.9 63.5c37.7 5.3 76.6 24.1 103.7 50.2 30 28.8 41.8 57.6 35.8 87.1-6.1 30.1-33.6 52.9-70.6 58.3-6 0.9-18.3 1-44.9 0.6l-36.6-0.7-0.5 17.8c-0.3 9.7-0.4 17.8-0.4 17.9 0.1 0.1 19.1 0.3 42.2 0.4 23.2 0 42.7 0.5 43.5 1 1.2 0.7 1.1 2.2-0.8 9.4-6 23-20.5 42.1-41.8 55-7.3 4.3-26.7 11.9-36 14.1-9 2-34 2-44.5 0-41.3-7.9-74.2-38-82.9-75.7-8.1-35.7 2.2-71.5 27.5-94.7 16.1-14.9 35.5-22.4 63.7-24.7l7.7-0.7v-34.1l-11.7 0.7c-22.2 1.3-37 5.3-56.4 15.2-28.7 14.6-49.7 39.3-59.9 70.2-9.6 29.3-9.3 62.6 0.8 91.4 3.3 9.2 12.2 25.6 18.3 33.8 11.3 14.9 30.6 30.8 48.7 39.9 19.9 10 49.2 15.9 73.2 14.7 26.5-1.3 52.5-9.6 74.2-23.9 26.9-17.6 47.2-47.9 53.3-79.7 1-5.2 2.3-10.1 2.8-10.8 0.8-0.9 6.9-1.2 27.1-1l26.1 0.3 0.3 3.8c1.2 14.6-10.9 52.1-23.9 74-17.8 30-43.2 54-75.9 71.5-20.9 11.2-38.3 16.5-67.2 20.7-27.6 3.9-47.9 3.1-75.8-3.1-36.9-8.3-67.8-25.6-97.1-54.6-23.6-23.2-44.8-61.9-51.7-93.8-5.1-23.7-5.5-28.1-4.9-48.8 1.7-63.2 23.4-111.8 67.7-152 28-25.4 60.4-41.3 99-48.8 18.5-3.6 46.1-4 67.9-0.9zm16.4 92.6c-6.3 2.4-12.8 8.5-15.4 14.5-2.6 6.1-2.6 18.3 0 23.9 5 11 20.2 17.7 32.3 14.1 11.9-3.4 19.8-14.3 19.8-27.1-0.1-19.9-18.2-32.5-36.7-25.4z"
              />
            </svg>
          </div>
          <h2 className={cn(
            "text-2xl font-semibold mb-2",
            isDark ? "text-white" : "text-black"
          )}>
            Gonna Support
          </h2>
          <p className={cn(
            "text-lg",
            isDark ? "text-white/60" : "text-black/60"
          )}>
            {formatDuration(callDuration)}
          </p>
        </div>

        <div className="flex space-x-4 relative z-10 p-6">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={cn(
              "p-4 rounded-xl transition-colors",
              isMuted
                ? isDark
                  ? "bg-red-500/20 border border-red-500/30 text-red-400"
                  : "bg-red-500/10 border border-red-500/20 text-red-600"
                : isDark
                  ? "bg-black/20 border border-white/10 text-white hover:bg-black/30"
                  : "bg-white/10 border border-black/10 text-black hover:bg-white/20"
            )}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          <button
            onClick={handleStopAI}
            disabled={isAIStopped}
            className={cn(
              "p-4 rounded-xl transition-colors",
              isAIStopped
                ? isDark
                  ? "bg-black/10 border border-white/5 text-white/40"
                  : "bg-white/5 border border-black/5 text-black/40"
                : isDark
                  ? "bg-black/20 border border-white/10 text-white hover:bg-black/30"
                  : "bg-white/10 border border-black/10 text-black hover:bg-white/20"
            )}
          >
            {isAIStopped ? <MessageSquare className="w-6 h-6" /> : <Square className="w-6 h-6" />}
          </button>
          <button
            onClick={handleUploadClick}
            className={cn(
              "p-4 rounded-xl transition-colors",
              isDark 
                ? "bg-black/20 border border-white/10 text-white hover:bg-black/30" 
                : "bg-white/10 border border-black/10 text-black hover:bg-white/20"
            )}
          >
            <Upload className="w-6 h-6" />
          </button>
          <button
            onClick={onClose}
            className={cn(
              "p-4 rounded-xl transition-colors",
              isDark
                ? "bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30"
                : "bg-red-500/10 border border-red-500/20 text-red-600 hover:bg-red-500/20"
            )}
          >
            <Phone className="w-6 h-6" />
          </button>
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/jpeg,image/png,image/gif,image/webp"
        />
      </motion.div>
    </>
  );
}