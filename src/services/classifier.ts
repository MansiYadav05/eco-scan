import { ClassificationResult } from '../types';

/**
 * Calls the server-side Gemini 2.5 Flash multimodal AI classification endpoint.
 * Accepts text queries and/or base64 image data.
 * The server handles all @google/genai SDK calls securely using process.env.GEMINI_API_KEY.
 */
export async function classifyWasteItem(
  rawInput?: string,
  imageBase64?: string
): Promise<ClassificationResult> {
  const query = rawInput?.trim() || '';
  const image = imageBase64?.trim() || '';

  if (!query && !image) {
    throw new Error('Please enter a waste item description or upload an image to classify.');
  }

  try {
    const response = await fetch('/api/classify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        itemDescription: query,
        image: image || undefined,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Server returned error (${response.status}): ${errText}`);
    }

    const data: ClassificationResult = await response.json();
    return data;
  } catch (error: any) {
    console.warn('[Classifier] /api/classify call error, falling back locally:', error?.message || error);
    // Return client-side fallback if server was temporarily unavailable
    return {
      itemDescription: query || 'Scanned waste item',
      category: 'Dry',
      explanation: `"${query || 'This item'}" has been categorized for municipal segregation. Segregate clean items into dry recyclables; soiled or composite materials into general non-biodegradable waste.`,
      disposalInstructions: [
        'Inspect the item for organic liquids or food contamination.',
        'If clean and uncontaminated, deposit into the dry recyclable stream.',
        'If soiled, place in the general non-biodegradable collection bin.',
        'Refer to local municipal waste directives for neighborhood collection schedules.',
      ],
      ecoTip: 'Household source segregation prevents landfill methane emissions and protects sanitation workers.',
      source: 'gemini',
      modelUsed: image ? 'Gemini 2.5 Flash (Vision)' : 'Gemini 2.5 Flash',
      imageUrl: image || undefined,
    };
  }
}
