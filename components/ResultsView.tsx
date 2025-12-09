import React from 'react';
import { AnalysisResponse } from '../types';
import { Play, FileText, Image as ImageIcon } from 'lucide-react';

interface ResultsViewProps {
  data: AnalysisResponse;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ data }) => {
  if (data.type === 'csv') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-indigo-500/10 p-2 rounded-lg ring-1 ring-indigo-500/20">
            <FileText className="w-5 h-5 text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-100">Statistical Analysis Results</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {data.files.map((url, index) => (
            <div key={index} className="glass-panel rounded-xl overflow-hidden hover:ring-1 hover:ring-indigo-500/50 transition-all duration-300 group">
              <div className="p-3 border-b border-white/5 bg-slate-900/50 flex justify-between items-center backdrop-blur-md">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Plot {index + 1}
                </span>
                <span className="text-xs text-indigo-300 font-medium bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  R Generated
                </span>
              </div>
              <div className="aspect-[4/3] bg-white relative group-hover:scale-[1.02] transition-transform duration-500 ease-out">
                {/* Charts are white-bg, so we keep the container white to preserve color accuracy */}
                <img
                  src={url}
                  alt={`Analysis Plot ${index + 1}`}
                  className="w-full h-full object-contain p-2"
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.type === 'image') {
    return (
      <div className="flex flex-col items-center justify-center p-8 glass-panel rounded-2xl animate-in zoom-in-95 duration-500">
        <div className="flex items-center gap-3 mb-6 self-start w-full border-b border-white/5 pb-4">
          <div className="bg-pink-500/10 p-2 rounded-lg ring-1 ring-pink-500/20">
            <ImageIcon className="w-5 h-5 text-pink-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-100">Image Analysis</h2>
        </div>
        <div className="relative rounded-xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10 max-w-2xl w-full">
          <img
            src={data.files[0]}
            alt="Uploaded content"
            className="w-full h-auto block"
          />
        </div>
      </div>
    );
  }

  if (data.type === 'audio') {
    return (
      <div className="max-w-xl mx-auto mt-8 glass-panel rounded-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500 ring-1 ring-white/10">
        <div className="bg-gradient-to-r from-violet-600/80 to-indigo-600/80 p-8 text-center backdrop-blur-md">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-xl">
            <Play className="w-8 h-8 text-white ml-1" />
          </div>
          <h2 className="text-white font-bold text-xl text-glow">Audio Playback</h2>
          <p className="text-indigo-100 text-sm mt-1 opacity-80">Ready for review</p>
        </div>
        <div className="p-8 bg-slate-950/30">
          <audio controls className="w-full h-12 accent-indigo-500 mix-blend-screen opacity-90 hover:opacity-100 transition-opacity">
            <source src={data.files[0]} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      </div>
    );
  }

  return null;
};