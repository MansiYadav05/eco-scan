import React, { useEffect, useState } from 'react';
import {
  Recycle,
  AlertTriangle,
  Zap,
  Droplets,
  Package,
  CheckCircle2,
  Leaf,
  RotateCcw,
  Copy,
  Check,
  MapPin,
  ExternalLink,
  Share2,
  Camera,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type { ClassificationResult, WasteCategory } from '../types';

interface ResultCardProps {
  result: ClassificationResult;
  onReset?: () => void;
}

const CATEGORY_CONFIG: Record<
  WasteCategory,
  {
    badgeClass: string;
    glowDot: string;
    borderClass: string;
    accentColor: string;
    bgTintClass: string;
    icon: React.ComponentType<{ className?: string }>;
    hindiLabel: string;
    binLabel: string;
    binSubtext: string;
  }
> = {
  Wet: {
    badgeClass: 'bg-emerald-50 text-emerald-900 border-emerald-300 ring-emerald-500/20',
    glowDot: 'bg-emerald-500',
    borderClass: 'border-emerald-300/80',
    accentColor: '#15803D',
    bgTintClass: 'bg-emerald-50/40',
    icon: Droplets,
    hindiLabel: 'गीला कचरा',
    binLabel: 'Green Bin (हरा कूड़ादान) • Wet Organic Waste',
    binSubtext: 'Kitchen scraps, food waste & pooja floral offerings (Nirmalya) for composting / bio-methanation',
  },
  Dry: {
    badgeClass: 'bg-sky-50 text-sky-800 border-sky-300 ring-sky-500/20',
    glowDot: 'bg-sky-500',
    borderClass: 'border-sky-200/80',
    accentColor: '#0284C7',
    bgTintClass: 'bg-sky-50/40',
    icon: Package,
    hindiLabel: 'सूखा कचरा',
    binLabel: 'Blue Bin (नीला कूड़ादान) • Dry Solid Waste',
    binSubtext: 'Rinsed milk pouches, plastics, MLP chip packets (RDF for cement plants), paper & cartons',
  },
  Recyclable: {
    badgeClass: 'bg-teal-50 text-teal-800 border-teal-300 ring-teal-500/20',
    glowDot: 'bg-teal-500',
    borderClass: 'border-teal-200/80',
    accentColor: '#0D9488',
    bgTintClass: 'bg-teal-50/40',
    icon: Recycle,
    hindiLabel: 'पुनर्चक्रण योग्य',
    binLabel: 'Blue Bin / Kabadiwala • Dry Recyclables',
    binSubtext: 'Clean PET bottles, cans, metals, Tetra Paks & clean paper for secondary recycling',
  },
  Hazardous: {
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-300 ring-rose-500/20',
    glowDot: 'bg-rose-500',
    borderClass: 'border-rose-200/80',
    accentColor: '#E11D48',
    bgTintClass: 'bg-rose-50/40',
    icon: AlertTriangle,
    hindiLabel: 'घरेलू खतरनाक कचरा',
    binLabel: 'Red / Black Bin (लाल कूड़ादान) • Domestic Hazardous',
    binSubtext: 'CFLs, tube lights, expired medicines, chemicals & sanitary waste (wrapped with red cross "X")',
  },
  Harmful: {
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-300 ring-rose-500/20',
    glowDot: 'bg-rose-500',
    borderClass: 'border-rose-200/80',
    accentColor: '#E11D48',
    bgTintClass: 'bg-rose-50/40',
    icon: AlertTriangle,
    hindiLabel: 'हानिकारक / खतरनाक कचरा',
    binLabel: 'Red / Black Bin (लाल कूड़ादान) • Harmful & Toxic Waste',
    binSubtext: 'Toxic chemicals, discarded medicines, paints, spray cans & hazardous materials',
  },
  'E-Waste': {
    badgeClass: 'bg-amber-50 text-amber-900 border-amber-300 ring-amber-500/20',
    glowDot: 'bg-amber-500',
    borderClass: 'border-amber-200/80',
    accentColor: '#D97706',
    bgTintClass: 'bg-amber-50/40',
    icon: Zap,
    hindiLabel: 'ई-कचरा',
    binLabel: 'Designated E-Waste Drop-off Center (ई-कचरा केंद्र)',
    binSubtext: 'Discarded phones, chargers, batteries & PCBs for CPCB-authorized dismantlers',
  },
};

export const ResultCard: React.FC<ResultCardProps> = ({ result, onReset }) => {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const config = CATEGORY_CONFIG[result.category] || CATEGORY_CONFIG.Recyclable;
  const CategoryIcon = config.icon;

  useEffect(() => {
    return () => window.speechSynthesis?.cancel();
  }, []);

  useEffect(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, [result]);

  const handleReadResult = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const instructions = result.disposalInstructions
      .map((instruction, index) => `Step ${index + 1}: ${instruction}`)
      .join('. ');
    const spokenText = `Eco Scan result for ${result.itemDescription}. Category: ${result.category}. ${config.binLabel}. ${result.explanation}. Disposal instructions: ${instructions}.${result.ecoTip ? ` Eco tip: ${result.ecoTip}.` : ''}`;
    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleShare = async () => {
    const textToShare = `🌿 Eco Scan - Waste Segregation Guide
Item: ${result.itemDescription}
Category: ${result.category} (${config.hindiLabel})
Target Bin: ${config.binLabel}

Explanation:
${result.explanation}

Disposal Instructions:
${result.disposalInstructions.map((ins, i) => `${i + 1}. ${ins}`).join('\n')}
${result.ecoTip ? `\n🌱 Eco Tip: ${result.ecoTip}` : ''}

Segregated via Eco Scan`;

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(textToShare);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch {
      // Fallback
    }
  };

  const handleCopyInstructions = async () => {
    const textToCopy = `Eco Scan Waste Guide for: ${result.itemDescription}
Category: ${result.category}
Target Bin: ${config.binLabel}
Instructions:
${result.disposalInstructions.map((ins, i) => `${i + 1}. ${ins}`).join('\n')}
${result.ecoTip ? `Eco Tip: ${result.ecoTip}` : ''}`;

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Fallback ignore
    }
  };

  return (
    <div
      id="classification-result-card"
      className={`w-full max-w-2xl bg-white border ${config.borderClass} rounded-2xl p-6 sm:p-8 shadow-xl shadow-emerald-950/5 transition-all duration-200 relative overflow-hidden`}
    >
      {/* Decorative Top Accent Stripe */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5"
        style={{ backgroundColor: config.accentColor }}
      />

      {/* Header Bar */}
      <div className="flex flex-col gap-4 pb-6 border-b border-neutral-100">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Classified Item
            </span>
          </div>
          <div className="flex items-center gap-3 min-w-0">
            {result.imageUrl && (
              <div className="relative group shrink-0">
                <img
                  src={result.imageUrl}
                  alt={result.itemDescription}
                  className="w-14 h-14 object-cover rounded-xl border border-neutral-200 shadow-2xs"
                />
                <span className="absolute -bottom-1 -right-1 bg-emerald-700 text-white p-0.5 rounded-full shadow-xs" title="Classified from image input">
                  <Camera className="w-3 h-3" />
                </span>
              </div>
            )}
            <h2 className="text-xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight capitalize break-words min-w-0 leading-tight">
              {result.itemDescription}
            </h2>
          </div>
        </div>

        {/* Action Controls & Category Badge */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div id="category-badge" className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold border ring-2 shadow-xs transition-transform ${config.badgeClass}`} >
            <span className={`w-2 h-2 rounded-full ${config.glowDot} animate-pulse`} />
            <CategoryIcon className="w-4 h-4" />
            <div className="flex items-center gap-1.5">
              <span>{result.category}</span>
              <span className="text-xs opacity-75 font-normal">({config.hindiLabel})</span>
            </div>
          </div>

          <button
            id="copy-instructions-btn"
            type="button"
            onClick={handleCopyInstructions}
            className="p-2.5 rounded-xl border border-neutral-200 hover:border-emerald-300 text-neutral-500 hover:text-emerald-700 hover:bg-emerald-50/50 transition-all cursor-pointer"
            title="Copy disposal guide"
            aria-label="Copy disposal guide"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            id="read-result-btn"
            type="button"
            onClick={handleReadResult}
            className="p-2.5 rounded-xl border border-neutral-200 hover:border-emerald-300 text-neutral-500 hover:text-emerald-700 hover:bg-emerald-50/50 transition-all cursor-pointer"
            title={isSpeaking ? 'Stop reading result' : 'Read result aloud'}
            aria-label={isSpeaking ? 'Stop reading result' : 'Read result aloud'}
            aria-pressed={isSpeaking}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4 text-emerald-600" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {onReset && (
            <button
              id="reset-result-btn"
              type="button"
              onClick={onReset}
              className="p-2.5 rounded-xl border border-neutral-200 hover:border-neutral-300 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-all cursor-pointer"
              title="Classify another item"
              aria-label="Classify another item"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Segregation Destination Box */}
      <div className="mt-5 p-4 rounded-xl bg-neutral-50/80 border border-neutral-200/70 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
            style={{ backgroundColor: config.accentColor }}
          >
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
              Designated Segregation Stream
            </span>
            <span className="text-sm sm:text-base font-bold text-neutral-800">
              {config.binLabel}
            </span>
          </div>
        </div>
        <span className="hidden md:inline-block text-xs text-neutral-500 font-medium text-right max-w-xs">
          {config.binSubtext}
        </span>
      </div>

      {/* Explanation Section */}
      <div className="py-5 border-b border-neutral-100">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2.5 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Scientific Categorization Basis</span>
        </h3>
        <p className="text-sm sm:text-base text-neutral-600 leading-relaxed bg-white p-3.5 rounded-xl border border-neutral-150">
          {result.explanation}
        </p>
      </div>

      {/* Disposal Instructions Section */}
      <div className="pt-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3.5 flex items-center justify-between">
          <span>Correct Disposal Protocol</span>
          <span className="text-[11px] font-normal text-neutral-400">Step-by-step</span>
        </h3>

        <div className="space-y-2.5">
          {result.disposalInstructions.map((instruction, index) => (
            <div
              key={index}
              className="flex items-start gap-3 text-sm sm:text-base text-neutral-700 bg-white p-3.5 rounded-xl border border-neutral-200/80 hover:border-emerald-300 transition-colors shadow-2xs"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {index + 1}
              </div>
              <span className="leading-snug flex-1">{instruction}</span>
            </div>
          ))}
        </div>

        {/* Eco Tip Callout */}
        {result.ecoTip && (
          <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-emerald-50/80 to-teal-50/50 border border-emerald-200 flex items-start gap-3 text-xs sm:text-sm text-emerald-950">
            <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <Leaf className="w-3.5 h-3.5" />
            </div>
            <div className="leading-relaxed">
              <span className="font-bold text-[#046307]">Sustainability Impact: </span>
              <span className="text-neutral-700">{result.ecoTip}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

