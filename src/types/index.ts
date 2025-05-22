export interface ColivingSpace {
  id: string;
  name: string;
  address: string;
  logoUrl: string;
  description: string;
  videoUrl?: string;
  slackLink?: string;
  whatsappLink?: string;
  tags?: string[]; // e.g., ["beach", "coworking", "community events"]
}

export interface ColivingRecommendation {
  name: string;
  address: string;
  description: string;
}
