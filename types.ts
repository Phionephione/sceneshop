
export interface ShopLink {
  storeName: string;
  url: string;
}

export interface Movie {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  genre: string[];
  year: number;
  type: 'movie' | 'tv';
}

export interface DetectedProduct {
  id: string;
  name: string;
  category: string;
  description: string;
  priceEstimate: string;
  shopLinks: ShopLink[];
  confidence: number;
  box2d?: [number, number, number, number]; // [ymin, xmin, ymax, xmax]
}

export interface AnalysisState {
  isAnalyzing: boolean;
  products: DetectedProduct[];
  error: string | null;
}
