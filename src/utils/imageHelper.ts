/**
 * Utility functions for image input processing, compression, and sample waste images.
 */

export async function compressAndReadImage(file: File, maxDim = 1200, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => {
        // Fallback to raw data url if canvas decode fails
        resolve(e.target?.result as string);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Creates high-fidelity visual sample waste image data URLs for instant testing.
 */
function createSampleImage(title: string, subtitle: string, bgColor: string, iconText: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 400, 300);
  grad.addColorStop(0, bgColor);
  grad.addColorStop(1, '#1A1A1A');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 400, 300);

  // Decorative border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 4;
  ctx.strokeRect(10, 10, 380, 280);

  // Big Emoji / Icon
  ctx.font = '72px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(iconText, 200, 110);

  // Title
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.fillText(title, 200, 195);

  // Subtitle
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.font = '14px system-ui, sans-serif';
  ctx.fillText(subtitle, 200, 230);

  // Badge
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.roundRect(100, 255, 200, 26, 13);
  ctx.fill();

  ctx.fillStyle = '#86EFAC';
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.fillText('SAMPLE IMAGE FOR CLASSIFICATION', 200, 272);

  return canvas.toDataURL('image/jpeg', 0.9);
}

export interface SampleWasteImage {
  id: string;
  name: string;
  categoryHint: 'Wet' | 'Dry' | 'Harmful' | 'Recyclable' | 'E-Waste';
  icon: string;
  getDataUrl: () => string;
}

export const SAMPLE_WASTE_PHOTOS: SampleWasteImage[] = [
  {
    id: 'sample-banana',
    name: 'Banana Peel Scraps',
    categoryHint: 'Wet',
    icon: '🍌',
    getDataUrl: () => createSampleImage('Organic Banana Peels', 'Kitchen fruit scrap & biodegradable waste', '#2D4A22', '🍌'),
  },
  {
    id: 'sample-bottle',
    name: 'Crushed Plastic Bottle',
    categoryHint: 'Dry',
    icon: '🧴',
    getDataUrl: () => createSampleImage('Crushed Plastic Bottle', 'Clean PET plastic beverage packaging', '#0E4461', '🧴'),
  },
  {
    id: 'sample-medicine',
    name: 'Expired Medicine Strip',
    categoryHint: 'Harmful',
    icon: '💊',
    getDataUrl: () => createSampleImage('Expired Medicine Strip', 'Toxic pharmaceutical blister packaging', '#6A1523', '💊'),
  },
  {
    id: 'sample-battery',
    name: 'Used Lithium Battery',
    categoryHint: 'Harmful',
    icon: '🔋',
    getDataUrl: () => createSampleImage('Discarded Battery', 'Corrosive chemical hazardous waste', '#5A1A2A', '🔋'),
  },
  {
    id: 'sample-charger',
    name: 'Broken Phone Cable',
    categoryHint: 'E-Waste',
    icon: '🔌',
    getDataUrl: () => createSampleImage('Broken USB Cable', 'Discarded electronic copper wiring', '#61430E', '🔌'),
  },
];
