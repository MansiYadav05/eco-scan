import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Lazy-initialized Gemini AI Client
let aiClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Fallback Rule-Based Engine aligned with Indian Solid Waste Management (SWM) Rules 2016
interface LocalWasteRule {
  keywords: string[];
  category: 'Wet' | 'Dry' | 'E-Waste' | 'Hazardous' | 'Recyclable';
  explanation: string;
  disposalInstructions: string[];
  ecoTip: string;
}

const LOCAL_RULES: LocalWasteRule[] = [
  {
    keywords: [
      'marigold',
      'marigold flower',
      'marigold flowers',
      'genda',
      'genda phool',
      'flower',
      'flowers',
      'rose',
      'rose petal',
      'rose petals',
      'garland',
      'garlands',
      'phool mala',
      'mala',
      'nirmalya',
      'temple waste',
      'pooja waste',
      'puja waste',
      'tulsi',
      'holy basil',
      'bel patra',
      'bilva',
      'banana leaf',
      'pattal',
      'kulhad',
      'clay cup',
      'coconut shell',
      'coconut husk',
      'coir',
      'agarbatti ash',
      'prasad residue',
    ],
    category: 'Wet',
    explanation:
      'Under the Indian Solid Waste Management (SWM) Rules 2016 and Swachh Bharat Mission guidelines, all floral and pooja offerings (nirmalya, marigold flowers, garlands, and leaves) are strictly classified as Wet Waste (गीला कचरा). Even when flowers appear withered, dry, or dehydrated to the touch, they are 100% biodegradable organic matter meant for composting, biomethanation, or sacred flower upcycling (such as organic charcoal-free incense sticks and natural dyes).',
    disposalInstructions: [
      'Untie and remove any synthetic plastic strings, ribbons, plastic wrappers, or foil decorations bound to the flowers.',
      'Deposit the floral remains directly into the Green Bin (हरा कूड़ादान) for municipal organic collection or home composting.',
      'If your residential society, municipal ward, or local temple maintains a "Nirmalya Kalash" (sacred collection bin), deposit them there for dedicated flower recycling.',
      'Never discard floral waste into rivers or water bodies, and never mix them with dry recyclables in the blue bin.',
    ],
    ecoTip:
      'In India, over 8 million metric tonnes of temple flower waste are discarded annually. Upcycling them into vermicompost and sustainable agarbatti prevents river eutrophication and landfill methane emissions.',
  },
  {
    keywords: [
      'chai patti',
      'tea leaves',
      'used tea leaves',
      'tea bag',
      'banana peel',
      'banana',
      'apple core',
      'sabzi chilka',
      'vegetable peel',
      'vegetable peels',
      'fruit peel',
      'fruit peels',
      'food scrap',
      'food waste',
      'leftover food',
      'leftovers',
      'roti',
      'rice',
      'daal',
      'cooked food',
      'egg shell',
      'egg shells',
      'chicken bone',
      'meat bone',
      'fish bone',
      'kitchen waste',
    ],
    category: 'Wet',
    explanation:
      'Kitchen food scraps and biodegradable organic residues are classified as Wet Waste (गीला कचरा / Green Bin) under the Indian Solid Waste Management Rules 2016. Wet waste constitutes over 50% of Indian municipal solid waste; segregating it at source allows urban local bodies to generate Bio-CNG and rich agricultural compost.',
    disposalInstructions: [
      'Strip off any plastic stickers, rubber bands, or synthetic staples before disposing.',
      'Drain excess liquid gravies and place in the designated Green Bin (हरा कूड़ादान).',
      'If home composting, layer food scraps with dry cocopeat, sawdust, or dry leaves to maintain proper carbon-to-nitrogen ratio.',
      'Hand over to the municipal waste collection vehicle in the wet waste compartment.',
    ],
    ecoTip:
      'Segregating wet kitchen waste prevents anaerobic landfill decomposition, cutting methane emissions (which are 28x more potent than CO2) while producing organic manure for Indian soil regeneration.',
  },
  {
    keywords: [
      'milk pouch',
      'milk packet',
      'amul packet',
      'mother dairy',
      'milk bag',
      'plastic pouch',
      'dahi cup',
      'curd cup',
      'curd container',
    ],
    category: 'Dry',
    explanation:
      'Under Indian municipal guidelines, virgin LDPE milk pouches and dairy containers are classified as Dry Waste (सूखा कचरा / Blue Bin). Because unwashed pouches attract pests and spoil neighboring paper recyclables, Indian SWM rules require rinsing and drying them before disposal.',
    disposalInstructions: [
      'Snip only a partial corner slit when opening milk pouches to avoid generating micro-plastic tips (which choke stormwater drains and stray animals).',
      'Rinse the interior lightly with leftover water to remove foul odor and milk fat residues.',
      'Allow to air dry and place into the Blue Bin (सूखा कचरा).',
      'Hand over to your local municipal dry waste collector or informal scrap collector (Kabadiwala) for mechanical plastic recycling.',
    ],
    ecoTip:
      'Clean, segregated Indian milk pouches have high secondary market scrap value and are pelletized into sturdy industrial plastic tarpaulins, piping, and crates.',
  },
  {
    keywords: [
      'chips packet',
      'kurkure',
      'lays',
      'biscuit wrapper',
      'namkeen packet',
      'snack wrapper',
      'toffee wrapper',
      'plastic wrapper',
      'mlp',
      'multi layer packaging',
    ],
    category: 'Dry',
    explanation:
      'Multi-Layered Plastic (MLP) wrappers used for Indian savory snacks and chips consist of metallized aluminum laminated with polypropylene. Under Indian SWM Rules 2016, MLPs belong to the Dry Waste (सूखा कचरा / Blue Bin) non-recyclable stream and are routed to cement plants for Refuse-Derived Fuel (RDF) or road construction.',
    disposalInstructions: [
      'Ensure the packet is empty of food crumbs and dry.',
      'Do not snip into tiny shreds; keep the wrapper intact and place in the Blue Bin (सूखा कचरा).',
      'Never burn plastic wrappers in open air, as this releases hazardous carcinogenic dioxins.',
      'Hand over to municipal dry waste collection for cement kiln co-processing or bitumen road paving.',
    ],
    ecoTip:
      'Under Extended Producer Responsibility (EPR) mandates in India, cement plants co-process thousands of tons of MLP wrappers annually, replacing fossil coal and diverting non-recyclable plastics from dumping grounds.',
  },
  {
    keywords: [
      'sanitary pad',
      'sanitary napkin',
      'whisper',
      'stayfree',
      'sofy',
      'diaper',
      'baby diaper',
      'pampers',
      'huggies',
      'adult diaper',
      'bandage',
      'cotton swab',
      'used bandage',
    ],
    category: 'Hazardous',
    explanation:
      'Under Rule 4(1)(b) of the Indian Solid Waste Management Rules 2016, sanitary napkins, baby diapers, and biomedical bandages are classified as Domestic Hazardous / Sanitary Waste. To protect waste pickers and sanitation workers from blood-borne pathogens, the law strictly mandates wrapping them in newspaper before disposal.',
    disposalInstructions: [
      'Roll the used pad or diaper tightly from the clean side inward.',
      'Wrap securely in multiple layers of old newspaper or the paper disposal pouch provided by the manufacturer.',
      'Mark the outer paper wrapper prominently with a bold red cross ("X") symbol to alert sanitation workers.',
      'Hand over separately to the municipal waste collector or place in the domestic hazardous/sanitary disposal compartment.',
    ],
    ecoTip:
      'In India, millions of sanitary items enter open landfills monthly. Proper wrapping with a red "X" honors sanitation worker safety, while switching to reusable menstrual cups can prevent up to 10,000 disposable pads per person.',
  },
  {
    keywords: ['cfl', 'bulb', 'fluorescent', 'tube light', 'broken bulb', 'mercury', 'fluorescent lamp', 'hit spray', 'baygon', 'mosquito spray', 'goodknight', 'all out', 'expired medicine', 'paracetamol', 'dolo', 'cough syrup', 'paint', 'thinner', 'insecticide', 'pesticide'],
    category: 'Hazardous',
    explanation:
      'Under Indian SWM Rules 2016, CFL lamps, fluorescent tube lights, expired pharmaceuticals, paint solvents, and pesticide aerosols are categorized as Domestic Hazardous Waste (घरेलू खतरनाक कचरा). CFLs contain neurotoxic mercury vapor, while expired medicines can contaminate urban groundwater tables if dumped in open bins.',
    disposalInstructions: [
      'For CFL/tubelight breakages: ventilate the room for 15 minutes and gather shards using damp paper, never a vacuum.',
      'Store hazardous items in a sturdy cardboard box or sealable container marked "Hazardous Waste".',
      'Keep expired medicines in original blister packaging; do not flush liquids into household sinks.',
      'Hand over directly on municipal Domestic Hazardous collection days or deposit at authorized civic toxic waste drop-off depots.',
    ],
    ecoTip:
      'Segregating hazardous items prevents toxic heavy metals from contaminating lakhs of tons of organic compost produced across Indian municipalities.',
  },
  {
    keywords: ['phone', 'smartphone', 'mobile', 'charger', 'laptop', 'cable', 'battery', 'lithium', 'earphone', 'headphone', 'circuit', 'mouse', 'keyboard', 'tablet', 'remote', 'power bank'],
    category: 'E-Waste',
    explanation:
      'Under the Indian E-Waste (Management) Rules, discarded consumer electronics, smartphone chargers, and batteries are categorized as E-Waste (ई-कचरा). They contain valuable recoverable metals (gold, silver, copper) along with toxic cadmium and lead.',
    disposalInstructions: [
      'Back up critical files and perform a factory data wipe on electronic devices.',
      'Cover loose battery contacts with insulating tape to prevent sparks or short circuits.',
      'Never discard electronics in the green or blue municipal bins, and never sell to unauthorized scrap burners.',
      'Drop off at an authorized Producer Responsibility Organization (PRO) collection kiosk, consumer brand depot, or CPCB-registered dismantler.',
    ],
    ecoTip:
      'India is the 3rd largest e-waste generator globally. Recycling through certified CPCB channels recovers over 95% of precious metals while preventing toxic lead contamination in urban water bodies.',
  },
  {
    keywords: ['tetra pack', 'tetra pak', 'juice box', 'milk carton', 'beverage carton', 'frooti', 'real juice carton', 'aseptic carton'],
    category: 'Recyclable',
    explanation:
      'Tetra Paks are composite cartons made of ~75% virgin paperboard, 20% polyethylene, and 5% aluminum foil. Under Indian recycling initiatives, segregated clean cartons are collected from the Blue Bin (सूखा कचरा) and pulped to manufacture school benches, roofing sheets, and recycled paper products.',
    disposalInstructions: [
      'Unfold top flaps and empty leftover beverage completely.',
      'Rinse lightly with a small amount of water to prevent foul odor.',
      'Flatten the carton flat to minimize storage volume in your dry bin.',
      'Deposit in the Blue Bin (सूखा कचरा) or hand over to a local carton collection partner/Kabadiwala.',
    ],
    ecoTip:
      'In India, recycled beverage cartons are routinely converted into waterproof corrugated roofing sheets and desks for government primary schools.',
  },
  {
    keywords: ['cardboard', 'box', 'paper', 'newspaper', 'raddi', 'magazine', 'carton', 'envelope', 'notebook'],
    category: 'Dry',
    explanation:
      'Newspapers (Raddi), notebooks, and cardboard boxes are prime clean dry paper recyclables under Indian municipal segregation. Keeping paper segregated from wet food residues preserves cellulose fiber strength for re-pulping.',
    disposalInstructions: [
      'Keep dry and separate from kitchen moisture and vegetable oils.',
      'Flatten corrugated cardboard boxes to save bin and transport space.',
      'Bundle newspapers and magazines together for the neighborhood Kabadiwala or municipal Blue Bin.',
      'Remove broad plastic shipping tape and thermocol packing before recycling.',
    ],
    ecoTip:
      'The Indian informal recycling sector (Kabadiwalas and scrap aggregators) recycles over 60% of all recovered paper and cardboard, directly sustaining millions of green livelihood jobs.',
  },
  {
    keywords: ['plastic bottle', 'water bottle', 'pet bottle', 'bisleri', 'aquafina', 'soda bottle', 'shampoo bottle', 'oil bottle'],
    category: 'Recyclable',
    explanation:
      'PET (Polyethylene Terephthalate) and HDPE bottles used in India are 100% mechanically recyclable. They are sorted from Blue Bins (सूखा कचरा), shredded into flakes, and spun into polyester textile yarns or recycled packaging.',
    disposalInstructions: [
      'Empty all liquid contents completely and give a quick cold-water rinse.',
      'Crush the bottle flat (cap-on) to save collection space in the dry stream.',
      'Leave the plastic cap screwed onto the bottle so it does not get lost in mechanical sorting.',
      'Hand over to your local Kabadiwala or deposit into the municipal Blue Bin (सूखा कचरा).',
    ],
    ecoTip:
      'India achieves an impressive ~80% PET recycling rate, with recycled polyester yarn used extensively in sustainable apparel, sports jerseys, and geo-textiles.',
  },
  {
    keywords: ['aluminum', 'can', 'soda can', 'tin can', 'canned food', 'beverage can', 'beer can', 'foil', 'aluminum foil'],
    category: 'Recyclable',
    explanation:
      'Aluminum cans and tin metal containers are 100% infinitely recyclable metals without any degradation in purity. Recycling aluminum requires 95% less energy than extracting primary metal from bauxite ore.',
    disposalInstructions: [
      'Empty and rinse out sugary syrup or food residues.',
      'Lightly crush the can to conserve storage volume.',
      'Place in the Blue Bin (सूखा कचरा) or collect for your neighborhood scrap dealer (Kabadiwala).',
      'For clean aluminum foil, roll into a tight ball before placing into dry recyclables.',
    ],
    ecoTip:
      'Recycling 1 metric ton of aluminum saves 14,000 kWh of energy and 40 barrels of oil, significantly reducing industrial carbon emissions in India.',
  },
];

interface RuleEngineResult {
  itemDescription: string;
  category: string;
  explanation: string;
  disposalInstructions: string[];
  ecoTip: string;
  source: string;
  modelUsed: string;
  imageUrl?: string;
}

function fallbackClassify(query: string): RuleEngineResult {
  const lower = query.toLowerCase().trim();

  for (const rule of LOCAL_RULES) {
    const isMatch = rule.keywords.some((kw) => {
      if (lower === kw) return true;
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      return regex.test(lower);
    });

    if (isMatch) {
      return {
        itemDescription: query,
        category: rule.category,
        explanation: rule.explanation,
        disposalInstructions: rule.disposalInstructions,
        ecoTip: rule.ecoTip,
        source: 'rule-engine',
        modelUsed: 'Indian SWM 2016 Engine',
      };
    }
  }

  // Generic fallback with Indian SWM context
  return {
    itemDescription: query,
    category: 'Dry',
    explanation: `"${query}" is categorized as Dry Solid Waste (सूखा कचरा / Blue Bin) under the Indian Solid Waste Management Rules 2016. Clean, uncontaminated items should be directed to the municipal recyclable stream or local Kabadiwala; soiled items or multi-layered composites belong to non-biodegradable combustible waste for Refuse-Derived Fuel (RDF).`,
    disposalInstructions: [
      'Inspect the item for organic soil, food moisture, or oil stains.',
      'If clean and non-composite, place in your Blue Bin (सूखा कचरा) or collect for the local Kabadiwala.',
      'If soiled or combined with food waste, segregate for non-recyclable dry collection.',
      'Refer to your local municipal corporation (e.g., BMC, MCD, BBMP, GHMC) ward segregation schedules.',
    ],
    ecoTip: 'Source segregation at the household level is mandatory under SWM Rules 2016 and is the single most effective way to eliminate open landfill fires across Indian cities.',
    source: 'rule-engine',
    modelUsed: 'Indian SWM 2016 Engine',
  };
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    model: 'gemini-2.5-flash',
  });
});

// Gemini-Powered Waste Classification Endpoint (Text + Image Multimodal)
app.post('/api/classify', async (req: Request, res: Response): Promise<void> => {
  const { itemDescription, image } = req.body;

  const hasText = typeof itemDescription === 'string' && itemDescription.trim().length > 0;
  const hasImage = typeof image === 'string' && image.trim().length > 0;

  if (!hasText && !hasImage) {
    res.status(400).json({ error: 'Please provide either an itemDescription or an image to classify.' });
    return;
  }

  const query = hasText ? itemDescription.trim() : '';
  const ai = getGenAI();

  if (!ai) {
    console.warn('[Gemini] GEMINI_API_KEY not found in environment. Using fallback rule engine.');
    const fallback = fallbackClassify(query || 'Household waste item');
    if (hasImage) {
      fallback.imageUrl = image;
    }
    res.json(fallback);
    return;
  }

  try {
    let contents: any;

    if (hasImage) {
      let mimeType = 'image/jpeg';
      let base64Data = image.trim();

      const dataUriMatch = image.match(/^data:([a-zA-Z0-9.+_-]+\/[a-zA-Z0-9.+_-]+);base64,(.+)$/);
      if (dataUriMatch) {
        mimeType = dataUriMatch[1];
        base64Data = dataUriMatch[2];
      }

      const promptText = query
        ? `Analyze this photo of waste/packaging for segregation. User note: "${query}". Identify the exact material and object shown, then classify it according to Indian Solid Waste Management Rules 2016.`
        : `Inspect this image carefully. Identify the primary household, office, or municipal waste item or packaging shown in the photo, and classify it accurately according to Indian Solid Waste Management Rules 2016.`;

      contents = {
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
          {
            text: promptText,
          },
        ],
      };
    } else {
      contents = `Analyze and classify this household waste item for segregation: "${query}"`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction: `You are an expert environmental sustainability advisor specializing in the Indian Municipal Solid Waste Management System under the Solid Waste Management (SWM) Rules, 2016 (Ministry of Environment, Forest and Climate Change - MoEFCC) and the Swachh Bharat Mission (Urban) 2.0 / Central Pollution Control Board (CPCB) standards.

Your task is to accurately identify any waste item (from text description or visual image inspection) and classify it into EXACTLY ONE of the following Indian segregation categories:

1. "Wet" (गीला कचरा - Green Bin / हरा कूड़ादान):
   - ALL organic, biodegradable matter including kitchen scraps (sabzi chilka, fruit peels, tea leaves/chai patti, leftover food, stale roti, rice, daal, egg shells, bones).
   - Garden waste: twigs, fallen leaves, cut grass, dead plants.
   - Religious pooja offerings (Nirmalya): Marigold flowers (गेंदा फूल), floral garlands (माला), rose petals, sacred basil (Tulsi leaves), Bel Patra, coconut coir and shells. Even withered, dried flowers are 100% organic and MUST be classified as "Wet" waste (Green Bin).

2. "Dry" (सूखा कचरा - Blue Bin / नीला कूड़ादान):
   - Non-biodegradable, non-hazardous recyclables and combustibles.
   - Plastics: rinsed milk pouches, clean wrappers, carry bags (>120 microns), plastic containers.
   - Multi-Layered Packaging (MLP): chips packets, biscuit wrappers, namkeen pouches (collected for Refuse-Derived Fuel RDF).
   - Paper, newspapers, magazines, cardboard cartons, thermocol, dry rags.

3. "Recyclable" (पुनर्चक्रण योग्य / Blue Bin / Kabadiwala):
   - Clean, high-recovery dry materials: rigid PET/HDPE bottles, beverage cartons (Tetra Paks), aluminum beverage cans, tin food cans, glass jars/bottles, scrap metals, clean unsoiled cardboard.

4. "Harmful" (घरेलू खतरनाक / हानिकारक कचरा - Red / Black Bin / Special Collection):
   - Toxic household items: CFL bulbs, fluorescent tube lights (mercury risk), thermometers, expired medicines (tablets, syrups, blister packs), paint/thinner cans, mosquito aerosol sprays (Hit/Baygon), mosquito liquid vaporizers, button batteries, pesticides, and sanitary waste (sanitary napkins, baby diapers).
   - Sanitary waste MUST be wrapped in paper marked with a red cross ('X') as mandated by SWM Rules 2016 Rule 4(1)(b).

5. "E-Waste" (ई-कचरा - Authorized E-Waste Center):
   - Electronic items, smartphones, feature phones, chargers, power banks, cables, printed circuit boards, laptops, lithium-ion/alkaline batteries for authorized CPCB recyclers.

Provide concise, authoritative guidance strictly rooted in Indian municipal rules, citing the appropriate Indian bin color (Green Bin / Blue Bin / Red Bin) and practical preparation steps formatted as strict JSON.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            identifiedItem: {
              type: Type.STRING,
              description: 'The specific name of the object or material identified (e.g. "Marigold flower garland", "Plastic PET bottle", "Used blister pack of medicine", "Cardboard delivery box")',
            },
            category: {
              type: Type.STRING,
              enum: ['Wet', 'Dry', 'Harmful', 'Hazardous', 'Recyclable', 'E-Waste'],
              description: 'The primary Indian waste segregation category (Dry, Wet, Harmful, Recyclable, or E-Waste)',
            },
            explanation: {
              type: Type.STRING,
              description: '2 to 3 sentences explaining the material composition, biodegradation, and explicit alignment with Indian Solid Waste Management Rules 2016 and Swachh Bharat Mission',
            },
            disposalInstructions: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
              description: '4 specific sequential disposal steps customized for Indian municipal households (e.g., removing plastic threads, rinsing milk pouches, green bin, blue bin, kabadiwala, or red cross wrapping)',
            },
            ecoTip: {
              type: Type.STRING,
              description: 'A quantitative or actionable environmental impact fact aligned with Indian waste processing, composting, and municipal landfill diversion',
            },
          },
          required: ['identifiedItem', 'category', 'explanation', 'disposalInstructions', 'ecoTip'],
        },
      },
    });

    const rawJson = response.text?.trim() || '{}';
    const parsed = JSON.parse(rawJson);

    // Normalize category: If 'Hazardous' returned, map to 'Harmful' to align with user preference
    let category = parsed.category || 'Dry';
    if (category === 'Hazardous') {
      category = 'Harmful';
    }

    const itemDescription = parsed.identifiedItem || query || 'Waste item';

    res.json({
      itemDescription,
      category,
      explanation: parsed.explanation || 'Segregated according to Indian Solid Waste Management Rules 2016.',
      disposalInstructions: Array.isArray(parsed.disposalInstructions) && parsed.disposalInstructions.length > 0
        ? parsed.disposalInstructions
        : ['Check your local municipal corporation segregation guidelines.'],
      ecoTip: parsed.ecoTip || 'Source segregation drives Swachh Bharat Mission and urban landfill diversion.',
      source: 'gemini',
      modelUsed: hasImage ? 'Gemini 2.5 Flash (Vision)' : 'Gemini 2.5 Flash',
      imageUrl: hasImage ? image : undefined,
    });
  } catch (err: any) {
    console.error('[Gemini Classification Error]:', err?.message || err);
    // Graceful fallback to guarantee uptime
    const fallback = fallbackClassify(query || 'Household waste item');
    if (hasImage) {
      fallback.imageUrl = image;
      fallback.itemDescription = query || 'Scanned waste item';
    }
    res.json(fallback);
  }
});

// Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Eco Scan server running on http://0.0.0.0:${PORT} (Gemini 2.5 Flash Engine ready)`);
  });
}

startServer();
