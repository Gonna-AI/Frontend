import { CaseResult } from "../../types/juris";
import { Scale, Calendar, User, Building2, Network } from "lucide-react";
import { useState } from "react";
import KnowledgeGraph from "./KnowledgeGraph";

interface JurisCaseCardProps {
  caseData: CaseResult;
  onClick?: () => void;
}

export default function JurisCaseCard({
  caseData,
  onClick,
}: JurisCaseCardProps) {
  const [showGraph, setShowGraph] = useState(false);

  return (
    <div className="space-y-0">
      <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/20 to-violet-900/20 p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 backdrop-blur-sm">
        {/* Similarity Score Badge */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <div className="px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-full">
            <span className="text-xs font-semibold text-purple-300">
              {(caseData.similarityScore * 100).toFixed(0)}% Match
            </span>
          </div>
        </div>

        {/* Case Title */}
        <div className="mb-4 pr-24">
          <h3
            onClick={onClick}
            className="text-lg font-semibold text-white mb-1 line-clamp-2 group-hover:text-purple-300 transition-colors cursor-pointer"
          >
            {caseData.title}
          </h3>
          <p className="text-sm text-purple-300/80 font-mono">
            {caseData.citation}
          </p>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Building2 className="w-4 h-4 text-purple-400" />
            <span className="truncate">{caseData.court}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Calendar className="w-4 h-4 text-purple-400" />
            <span>{caseData.date}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/60 col-span-2">
            <User className="w-4 h-4 text-purple-400" />
            <span className="truncate">{caseData.judge}</span>
          </div>
        </div>

        {/* Case Summary */}
        <div className="mb-4">
          <div className="mb-2">
            <span className="text-xs font-semibold text-purple-300 uppercase tracking-wide">
              Facts
            </span>
            <p className="text-sm text-white/70 mt-1 line-clamp-2">
              {caseData.facts}
            </p>
          </div>
          <div>
            <span className="text-xs font-semibold text-purple-300 uppercase tracking-wide">
              Holding
            </span>
            <p className="text-sm text-white/70 mt-1 line-clamp-2">
              {caseData.holding}
            </p>
          </div>
        </div>

        {/* Precedents */}
        {caseData.precedents.length > 0 && (
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Scale className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-semibold text-purple-300 uppercase tracking-wide">
                Key Precedents
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {caseData.precedents.slice(0, 3).map((precedent, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-200"
                >
                  {precedent}
                </span>
              ))}
              {caseData.precedents.length > 3 && (
                <span className="text-xs px-2 py-1 text-purple-300/60">
                  +{caseData.precedents.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* View Graph Button */}
        <div className="pt-4 border-t border-white/10 mt-4">
          <button
            onClick={() => setShowGraph(!showGraph)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 hover:border-purple-500/50 rounded-xl text-sm font-medium text-purple-300 hover:text-purple-200 transition-all duration-300"
          >
            <Network className="w-4 h-4" />
            {showGraph ? "Hide" : "View"} Knowledge Graph
          </button>
        </div>

        {/* Hover Effect Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-transparent to-violet-500/0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none" />
      </div>

      {/* Knowledge Graph - Shown when toggled */}
      {showGraph && <KnowledgeGraph caseData={caseData} />}
    </div>
  );
}
