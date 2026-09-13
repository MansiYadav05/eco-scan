import React from 'react';
import {
  Recycle,
  Leaf,
  Droplets,
  AlertTriangle,
  Zap,
  BookOpen,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="flex-1 bg-[#F8FAF8] text-neutral-800 py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Page Hero */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-900 text-xs font-semibold border border-emerald-200 shadow-2xs">
            <Leaf className="w-3.5 h-3.5 text-emerald-600" />
            <span>Indian Solid Waste Management Rules 2016</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight">
            About Eco Scan
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Eco Scan is an AI-powered municipal waste segregation platform aligned with India's <strong>Solid Waste Management Rules, 2016</strong> and the <strong>Swachh Bharat Mission (Urban) 2.0</strong> framework.
          </p>
        </div>

        {/* 4 Pillars of Indian SWM 2016 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#10B981]" />
            <h2 className="text-xl font-black text-neutral-900">
              Indian Municipal Waste Streams (SWM Rules 2016)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Wet Waste Card */}
            <div className="p-5 rounded-2xl bg-white border border-emerald-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                <Droplets className="w-4 h-4 text-emerald-600" />
                <span>Wet Waste (गीला कचरा) • Green Bin</span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                All 100% biodegradable and compostable waste generated from kitchens, gardens, and places of worship. This explicitly includes <strong>temple & pooja floral offerings (Nirmalya / marigold flowers / गेंदा फूल)</strong>, spent tea leaves (*chai patti*), cooked food leftovers, fruit and vegetable peels, and non-vegetarian scraps.
              </p>
              <div className="text-[11px] font-medium text-emerald-800 bg-emerald-50 p-2 rounded-lg">
                Destination: Aerobic composting, Bio-methanation (CBG plants), and floral upcycling into organic agarbatti.
              </div>
            </div>

            {/* Dry Waste Card */}
            <div className="p-5 rounded-2xl bg-white border border-blue-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                <Recycle className="w-4 h-4 text-blue-600" />
                <span>Dry Waste (सूखा कचरा) • Blue Bin</span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                All non-biodegradable, non-organic clean materials. Includes rinsed dairy pouches (Amul/Mother Dairy LDPE), multi-layer snack wrappers (MLP chips packets), paperboard, metals, and consumer plastic containers.
              </p>
              <div className="text-[11px] font-medium text-blue-800 bg-blue-50 p-2 rounded-lg">
                Destination: Material Recovery Facilities (MRFs), mechanical recycling, or Refuse Derived Fuel (RDF) in cement kilns.
              </div>
            </div>

            {/* Domestic Hazardous Waste Card */}
            <div className="p-5 rounded-2xl bg-white border border-rose-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Domestic Hazardous (घरेलू खतरनाक) • Red Bin</span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Items presenting toxic, biological, or chemical hazard risks: fluorescent tubes & broken CFL lamps containing mercury vapor, expired pharmaceuticals, aerosol cans, paint solvents, and discarded batteries.
              </p>
              <div className="text-[11px] font-medium text-rose-800 bg-rose-50 p-2 rounded-lg">
                Disposal: Wrap securely, mark with a red cross (X), and hand to civic hazardous collection depots.
              </div>
            </div>

            {/* E-Waste Card */}
            <div className="p-5 rounded-2xl bg-white border border-amber-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                <Zap className="w-4 h-4 text-amber-600" />
                <span>E-Waste (ई-कचरा) • Authorized Channels</span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Discarded consumer electronics, mobile phones, chargers, and circuit boards regulated under the E-Waste Management Rules, 2022.
              </p>
              <div className="text-[11px] font-medium text-amber-800 bg-amber-50 p-2 rounded-lg">
                Destination: Authorized Producer Responsibility Organizations (PROs) and CPCB-registered recyclers.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
