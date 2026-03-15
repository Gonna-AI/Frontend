import React from 'react';
import PageIndexView from '../components/PageIndex/PageIndexView';
import { useLanguage } from '../contexts/LanguageContext';
import { FileText, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Documents() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-screen bg-[#0A0A0B] text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 mt-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all mr-2 group"
            >
              <ArrowLeft className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
            </button>
            <div className="p-2.5 bg-[#FF8A5B]/10 rounded-xl border border-[#FF8A5B]/20">
              <FileText className="w-6 h-6 text-[#FF8A5B]" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight italic uppercase">
              DOCUMENTS<span className="text-[#FF8A5B]">.</span>
            </h1>
          </div>
          <p className="text-white/40 text-sm max-w-2xl ml-14">
            Next-generation Vectorless RAG Engine. Powered by PageIndex and Groq for high-fidelity document reasoning.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Engine Status</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-emerald-500/80">PageIndex Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Feature Component */}
      <div className="mt-8">
        <PageIndexView />
      </div>
    </div>
  );
}
