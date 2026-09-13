import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  History,
  Trash2,
  Search,
  Filter,
  ShieldAlert,
  LogIn,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Share2,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ResultCard } from '../components/ResultCard';
import type { WasteCategory, HistoryItem } from '../types';

export const HistoryPage: React.FC = () => {
  const { authMode, setAuthMode, history, clearHistory } = useApp();
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const navigate = useNavigate();

  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.itemDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === 'All' ||
      item.category === categoryFilter ||
      (categoryFilter === 'Harmful' && (item.category === 'Hazardous' || item.category === 'Harmful'));
    return matchesSearch && matchesCategory;
  });

  const categories: string[] = ['All', 'Wet', 'Dry', 'Harmful', 'Recyclable', 'E-Waste'];

  const handleShareSummary = async (item: HistoryItem) => {
    const text = `🌿 Eco Scan Guide for ${item.itemDescription}:
Category: ${item.category}
Target: ${item.result.disposalInstructions[0] || 'See full SWM 2016 guidelines'}
Segregated via Eco Scan`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setCopiedId(item.id);
        setTimeout(() => setCopiedId(null), 2000);
      }
    } catch {
      // Ignore
    }
  };

  return (
    <div className="flex-1 bg-[#F8FAF8] text-neutral-800 py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
                Classification History
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                {authMode === 'login' ? `${history.length} Records` : 'Guest Mode'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Audit trail of domestic waste segregated in accordance with Indian SWM Rules 2016.
            </p>
          </div>

          {authMode === 'login' && history.length > 0 && (
            <button
              type="button"
              onClick={clearHistory}
              className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-2 rounded-xl transition-all cursor-pointer self-start sm:self-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {/* Guest Mode Guard Banner */}
        {authMode === 'guest' ? (
          <div
            id="guest-mode-history-guard"
            className="bg-white rounded-3xl border border-neutral-200/90 p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm"
          >
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-bold text-neutral-900 mb-2">
              History is Disabled in Guest Mode
            </h2>

            <p className="text-sm text-neutral-600 leading-relaxed mb-6">
              To uphold our <strong>Zero Storage Privacy Guarantee</strong>, Guest Mode leaves zero trace of your queries, classifications, or timestamps. Data is kept in-memory and deleted on reload.
            </p>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 mb-6 text-left text-xs space-y-1.5 text-emerald-950">
              <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Benefits of Logging In:</span>
              </div>
              <p>• Retain an audit trail of home and office waste items</p>
              <p>• Earn EcoScore points towards municipal diversion badges</p>
              <p>• Export your household segregation summary</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  navigate('/history');
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Switch to Login Mode</span>
              </button>

              <Link
                to="/classify"
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-semibold text-sm transition-all flex items-center justify-center gap-1.5"
              >
                <span>Back to Classify</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Logged In View */
          <div className="space-y-6">
            {/* Search and Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search past items..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none text-xs">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap border ${
                      categoryFilter === cat
                        ? 'bg-emerald-900 text-white border-emerald-900 shadow-xs'
                        : 'bg-white text-neutral-600 hover:bg-neutral-100 border-neutral-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Empty Logged In State */}
            {filteredHistory.length === 0 ? (
              <div className="bg-white rounded-3xl border border-neutral-200/80 p-10 text-center max-w-md mx-auto">
                <History className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-neutral-800 mb-1">
                  No records found
                </h3>
                <p className="text-xs text-neutral-500 mb-4">
                  {searchQuery || categoryFilter !== 'All'
                    ? 'Try clearing your filters or search query.'
                    : 'Start classifying items in the chat to build your segregation history.'}
                </p>
                <Link
                  to="/classify"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#10B981] text-white text-xs font-bold shadow-xs hover:bg-emerald-600"
                >
                  <span>Classify an Item</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              /* Records Grid & Inspection Drawer */
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Items List */}
                <div className="lg:col-span-2 space-y-3">
                  {filteredHistory.map((item) => {
                    const isSelected = selectedItem?.id === item.id;
                    const dateStr = new Date(item.timestamp).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className={`p-4 rounded-2xl bg-white border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                          isSelected
                            ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                            : 'border-neutral-200/90 hover:border-emerald-300 hover:shadow-xs'
                        }`}
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                item.category === 'Wet'
                                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                                  : item.category === 'Dry'
                                  ? 'bg-blue-50 text-blue-900 border-blue-300'
                                  : item.category === 'Hazardous'
                                  ? 'bg-rose-50 text-rose-900 border-rose-300'
                                  : item.category === 'Recyclable'
                                  ? 'bg-teal-50 text-teal-900 border-teal-300'
                                  : 'bg-amber-50 text-amber-900 border-amber-300'
                              }`}
                            >
                              {item.category}
                            </span>
                            <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{dateStr}</span>
                            </span>
                          </div>
                          <h4 className="text-sm sm:text-base font-bold text-neutral-900 truncate">
                            {item.itemDescription}
                          </h4>
                          <p className="text-xs text-neutral-500 line-clamp-1">
                            {item.result.explanation}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShareSummary(item);
                            }}
                            className="p-2 rounded-lg text-neutral-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title="Copy summary"
                          >
                            {copiedId === item.id ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Share2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Item Detail View */}
                <div className="lg:col-span-1">
                  {selectedItem ? (
                    <div className="sticky top-24">
                      <ResultCard result={selectedItem.result} />
                    </div>
                  ) : (
                    <div className="sticky top-24 p-6 rounded-2xl bg-white border border-neutral-200 text-center text-neutral-500">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                      <h4 className="text-sm font-bold text-neutral-800">
                        Select a record
                      </h4>
                      <p className="text-xs text-neutral-400 mt-1">
                        Click any item from your history to view its full disposal guide and municipal bin specifications.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
