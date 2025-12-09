import React, { useCallback, useState } from 'react';
import { UploadCloud, FileType, FileAudio, FileImage, Loader2 } from 'lucide-react';

interface UploadZoneProps {
  onFileUpload: (file: File) => Promise<void>;
  isLoading: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onFileUpload, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  }, [onFileUpload]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  }, [onFileUpload]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative group cursor-pointer
        rounded-2xl border-2 border-dashed transition-all duration-300 ease-in-out
        flex flex-col items-center justify-center py-20 px-4 overflow-hidden
        ${isDragging
          ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01] shadow-[0_0_40px_-10px_rgba(99,102,241,0.3)]'
          : 'border-slate-700/50 hover:border-indigo-500/50 hover:bg-slate-800/50'
        }
        ${isLoading ? 'opacity-50 pointer-events-none' : ''}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        onChange={handleInputChange}
        accept=".csv,.png,.jpg,.jpeg,.mp3,.wav"
        disabled={isLoading}
      />

      <div className="flex flex-col items-center text-center space-y-6 relative z-10">
        <div className={`
          p-5 rounded-2xl transition-all duration-300
          ${isDragging
            ? 'bg-indigo-500 text-white shadow-lg scale-110'
            : 'bg-slate-800 text-slate-400 group-hover:bg-indigo-500 group-hover:text-white group-hover:scale-110 group-hover:shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)]'}
        `}>
          {isLoading ? (
            <Loader2 className="w-10 h-10 animate-spin" />
          ) : (
            <UploadCloud className="w-10 h-10" />
          )}
        </div>

        <div className="space-y-2">
          <p className="text-xl font-semibold text-slate-200 group-hover:text-white transition-colors">
            {isLoading ? 'Processing Analysis...' : 'Upload your data'}
          </p>
          <p className="text-sm text-slate-500 max-w-sm mx-auto group-hover:text-slate-400 transition-colors">
            Drag & drop or click to browse
          </p>
        </div>

        <div className="flex gap-3 text-xs font-medium text-slate-400">
          <span className="flex items-center gap-1.5 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-white/5 backdrop-blur-sm group-hover:border-indigo-500/30 transition-colors">
            <FileType className="w-3.5 h-3.5 text-indigo-400" /> CSV
          </span>
          <span className="flex items-center gap-1.5 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-white/5 backdrop-blur-sm group-hover:border-indigo-500/30 transition-colors">
            <FileImage className="w-3.5 h-3.5 text-indigo-400" /> Images
          </span>
          <span className="flex items-center gap-1.5 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-white/5 backdrop-blur-sm group-hover:border-indigo-500/30 transition-colors">
            <FileAudio className="w-3.5 h-3.5 text-indigo-400" /> Audio
          </span>
        </div>
      </div>
    </div>
  );
};