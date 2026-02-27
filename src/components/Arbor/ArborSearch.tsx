import { useState } from "react";
import {
  Search,
  Filter,
  Sparkles,
  FileText,
  Clock,
  AlertCircle,
} from "lucide-react";
import { SearchFilters, SearchResult } from "../../types/arbor";

interface ArborSearchProps {
  isIndexed: boolean;
  onIndexDocuments: () => void;
  documentCount: number;
  onBack?: () => void;
}

const mockSearchResults: SearchResult[] = [
  {
    id: "1",
    title: "Q3 Financial Report",
    content: "Quarterly financial analysis and projections...",
    file_type: ".pdf",
    file_path: "/documents/q3-report.pdf",
    bm25_score: 8.5,
    semantic_score: 0.89,
    combined_score: 0.92,
    snippets: [
      "Revenue increased by 23% compared to previous quarter...",
      "Operating expenses remained stable at $2.4M...",
    ],
    metadata: {
      claim_numbers: [],
      policy_numbers: [],
      dates: ["2024-09-30", "2024-10-15"],
      amounts: [{ amount: "$2.4M", context: "operating expenses" }],
      urgency: {
        score: 2,
        level: "normal",
        indicators_found: [],
        total_mentions: 0,
      },
      document_type: {
        type: "general",
        confidence: 0.85,
        scores: { general: 15, claim: 3 },
      },
      status: "closed",
      contacts: {
        emails: ["finance@example.com"],
        phones: [],
      },
      word_count: 2450,
      char_count: 15230,
    },
  },
];

export default function ArborSearch({
  isIndexed,
  onIndexDocuments,
  documentCount,
}: ArborSearchProps) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({
    docType: "All",
    urgency: "All",
    topK: 10,
    generateSummaries: false,
  });
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    // Simulate search
    setTimeout(() => {
      setResults(mockSearchResults);
      setIsSearching(false);
    }, 800);
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case "critical":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      case "high":
        return "text-orange-400 bg-orange-500/10 border-orange-500/30";
      case "medium":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      default:
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
    }
  };

  if (!isIndexed) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4 sm:space-y-6 max-w-2xl px-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl sm:rounded-3xl flex items-center justify-center border border-emerald-500/30">
            <Search className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-white">
            Index Your Documents
          </h3>
          <p className="text-white/60 text-sm sm:text-lg leading-relaxed">
            Click "Index Documents" to enable advanced hybrid search with 65%
            BM25 keyword matching and 35% AI semantic understanding
          </p>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-6 sm:p-8 space-y-3 sm:space-y-4">
            <h4 className="text-lg sm:text-xl font-semibold text-emerald-400 mb-3 sm:mb-4">
              Features
            </h4>
            <ul className="text-left space-y-2 sm:space-y-3 text-white/70 text-xs sm:text-base">
              <li className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>65/35 BM25/Semantic Hybrid Search</span>
              </li>
              <li className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Multilingual: EN, DE, FR, ES support</span>
              </li>
              <li className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>AI-Powered Summarization</span>
              </li>
              <li className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Advanced Metadata Extraction</span>
              </li>
              <li className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Urgency Detection & Classification</span>
              </li>
              <li className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>PDF, DOCX, PPTX, TXT, MD support</span>
              </li>
            </ul>
          </div>

          <button
            onClick={onIndexDocuments}
            className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02]"
          >
            Index Documents
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documents (100+ languages supported)..."
              className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all backdrop-blur-sm"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-white/70">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filters:</span>
          </div>

          <select
            value={filters.docType}
            onChange={(e) =>
              setFilters({ ...filters, docType: e.target.value })
            }
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 backdrop-blur-sm"
          >
            <option value="All">All Types</option>
            <option value="claim">Claims</option>
            <option value="policy">Policies</option>
            <option value="guideline">Guidelines</option>
            <option value="regulation">Regulations</option>
          </select>

          <select
            value={filters.urgency}
            onChange={(e) =>
              setFilters({ ...filters, urgency: e.target.value })
            }
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 backdrop-blur-sm"
          >
            <option value="All">All Urgency</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="normal">Normal</option>
          </select>

          <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.generateSummaries}
              onChange={(e) =>
                setFilters({ ...filters, generateSummaries: e.target.checked })
              }
              className="w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500/50"
            />
            <span>AI Summaries</span>
          </label>
        </div>
      </form>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              Found {results.length} result{results.length !== 1 ? "s" : ""}
            </h3>
            <div className="text-sm text-white/50">Processed in 0.234s</div>
          </div>

          {results.map((result) => (
            <div
              key={result.id}
              className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:border-emerald-500/30 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <h4 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">
                    {result.title}
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(result.metadata.urgency.level)}`}
                  >
                    {result.metadata.urgency.level}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-white/70">
                    {result.file_type}
                  </span>
                </div>
              </div>

              {result.snippets.length > 0 && (
                <div className="space-y-2 mb-4">
                  {result.snippets.map((snippet, idx) => (
                    <p
                      key={idx}
                      className="text-sm text-white/60 leading-relaxed pl-8 border-l-2 border-emerald-500/30"
                    >
                      ...{snippet}...
                    </p>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 text-xs text-white/40">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {result.metadata.word_count} words
                </span>
                {result.metadata.contacts.emails.length > 0 && (
                  <span className="flex items-center gap-1">
                    📧 {result.metadata.contacts.emails.length} contact
                    {result.metadata.contacts.emails.length !== 1 ? "s" : ""}
                  </span>
                )}
                <span className="ml-auto">
                  Match: {Math.round(result.combined_score * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {query && results.length === 0 && !isSearching && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center space-y-3">
            <AlertCircle className="w-12 h-12 text-white/30 mx-auto" />
            <p className="text-white/50">No results found for "{query}"</p>
            <p className="text-white/40 text-sm">
              Try adjusting your search query or filters
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
