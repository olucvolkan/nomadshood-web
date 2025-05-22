import type { ColivingSpace } from '@/types';

export const mockColivingSpaces: ColivingSpace[] = [
  {
    id: '1',
    name: 'Nomad Haven Bali',
    address: 'Canggu, Bali, Indonesia',
    logoUrl: 'https://placehold.co/600x400.png', // Using a more rectangular placeholder for detail page
    description: 'A vibrant community focused on surfing, yoga, and entrepreneurship. Features a large coworking space and regular events. Enjoy daily surf sessions, weekly workshops, and a supportive network of global nomads. Our space includes high-speed internet, ergonomic workspaces, and private call booths.',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Example video
    slackLink: 'https://nomadhaven.slack.com',
    whatsappLink: 'https://chat.whatsapp.com/nomadbali',
    tags: ['surfing', 'yoga', 'coworking', 'community', 'wellness', 'entrepreneurship'],
    dataAiHint: 'bali beach coliving',
  },
  {
    id: '2',
    name: 'Lisbon Digital Lodge',
    address: 'Alfama, Lisbon, Portugal',
    logoUrl: 'https://placehold.co/600x400.png',
    description: 'Experience historic Lisbon while connecting with tech-savvy nomads. Close to cafes, Fado houses, and cultural hotspots. We offer regular tech meetups, language exchange evenings, and city tours. Our facilities boast fiber optic internet and a rooftop terrace with city views.',
    slackLink: 'https://lisbondigital.slack.com',
    tags: ['city life', 'tech', 'culture', 'networking', 'history', 'rooftop'],
    dataAiHint: 'lisbon historic tech',
  },
  {
    id: '3',
    name: 'Mountain CoLive Colorado',
    address: 'Denver, Colorado, USA',
    logoUrl: 'https://placehold.co/600x400.png',
    description: 'Perfect for outdoor enthusiasts. Offers easy access to hiking, skiing, and a supportive community of remote workers. Join group hikes, ski trips, and enjoy our on-site gear storage. The lodge features a cozy fireplace lounge and a dedicated quiet work zone.',
    videoUrl: 'https://www.youtube.com/watch?v=VIDEO_ID_COLORADO', // Example video
    whatsappLink: 'https://chat.whatsapp.com/mountaincolive',
    tags: ['mountains', 'hiking', 'skiing', 'outdoors', 'adventure', 'remote work'],
    dataAiHint: 'colorado mountain lodge',
  },
  {
    id: '4',
    name: 'Tokyo Tech Nest',
    address: 'Shibuya, Tokyo, Japan',
    logoUrl: 'https://placehold.co/600x400.png',
    description: 'Immerse yourself in the heart of Tokyo. A modern coliving space for developers, designers, and creators. We host weekly coding challenges, design sprints, and Japanese culture workshops. Benefit from our cutting-edge tech setup and proximity to major transport hubs.',
    slackLink: 'https://tokyotechnest.slack.com',
    tags: ['urban', 'tech', 'innovation', 'japan', 'design', 'coding'],
    dataAiHint: 'tokyo shibuya tech',
  },
  {
    id: '5',
    name: 'Cape Town Creatives',
    address: 'Sea Point, Cape Town, South Africa',
    logoUrl: 'https://placehold.co/600x400.png',
    description: 'Stunning ocean views and a hub for creative professionals. Enjoy braais (BBQs), art workshops, and collaborative projects. Our space includes a fully equipped art studio, a soundproof recording booth, and weekly creative showcases.',
    videoUrl: 'https://www.youtube.com/watch?v=VIDEO_ID_CAPETOWN', // Example video
    tags: ['ocean', 'creative', 'design', 'art', 'music', 'collaboration'],
    dataAiHint: 'cape town ocean creatives',
  },
  {
    id: '6',
    name: 'Medellin Connect Hub',
    address: 'El Poblado, Medellín, Colombia',
    logoUrl: 'https://placehold.co/600x400.png',
    description: 'Known for its "eternal spring" climate and vibrant nomad scene. Offers Spanish lessons, salsa nights, and coffee tasting tours. Our hub features lush gardens, a swimming pool, and regular community dinners.',
    whatsappLink: 'https://chat.whatsapp.com/medellinconnect',
    tags: ['city vibe', 'culture', 'networking', 'spanish', 'salsa', 'community'],
    dataAiHint: 'medellin poblado garden',
  },
];
