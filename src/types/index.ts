export interface ColivingSpace {
  id: string;
  name: string;
  address: string;
  logoUrl: string; // Can be used as a primary image too
  description: string;
  videoUrl?: string;
  slackLink?: string;
  whatsappLink?: string;
  tags?: string[]; // e.g., ["beach", "coworking", "community events"]
  dataAiHint?: string; // For placeholder image generation for logo/main image
  // websiteUrl?: string; // Future: Add a website URL
}

export interface ColivingRecommendation {
  name: string;
  address: string;
  description: string;
}

export interface CommunityLink {
  platform: 'Slack' | 'WhatsApp' | 'Telegram' | 'Other';
  name: string;
  url: string;
  dataAiHint?: string; 
}

export interface CountrySpecificCommunityLinks {
  countryName: string;
  links: CommunityLink[];
}
