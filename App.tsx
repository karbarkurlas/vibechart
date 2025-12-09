import React, { useState } from 'react';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { ResultsView } from './components/ResultsView';
import { UploadState } from './types';
import { AlertCircle } from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:5000';

const App: React.FC = () => {
  const [state, setState] = useState<UploadState>({
    isLoading: false,
    error: null,
    data: null,
  });

  const handleFileUpload = async (file: File) => {
    setState(prev => ({ ...prev, isLoading: true, error: null, data: null }));

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = `Server Error: ${response.statusText}`;
        try {
          const errorBody = await response.json();
          if (errorBody.error) {
            errorMessage = errorBody.error;
          }
        } catch (e) {
          // If response is not JSON, use default status text
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();

      // Normalize server response to match AnalysisResponse interface
      let files: string[] = [];
      if (result.files) {
        files = result.files;
      } else if (result.data && Array.isArray(result.data)) {
        files = result.data;
      } else if (result.url) {
        files = [result.url];
      }

      // Prefix URLs with API base if they are relative paths
      const processedResult = {
        ...result,
        files: files.map((path: string) =>
          path.startsWith('http') ? path : `${API_BASE_URL}${path}`
        )
      };

      setState({
        isLoading: false,
        error: null,
        data: processedResult,
      });

    } catch (err: any) {
      setState({
        isLoading: false,
        error: err.message || 'An unexpected error occurred',
        data: null,
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col relative overflow-hidden">
      {/* Background Mesh Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 pointer-events-none" />

      <Header />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 space-y-12 relative z-10">

        <section className="glass-panel rounded-3xl p-8 border border-white/5">
          <UploadZone
            onFileUpload={handleFileUpload}
            isLoading={state.isLoading}
          />

          {state.error && (
            <div className="mt-6 p-4 bg-red-950/30 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 animate-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm">Upload Failed</h3>
                <p className="text-sm opacity-90">{state.error}</p>
              </div>
            </div>
          )}
        </section>

        {state.data && (
          <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <ResultsView data={state.data} />
          </section>
        )}
      </main>

      <footer className="border-t border-white/5 py-8 mt-auto relative z-10 bg-slate-950/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} Akademik Vibe System. Software Realization Project.
        </div>
      </footer>
    </div>
  );
};

export default App;