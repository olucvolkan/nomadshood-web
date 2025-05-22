import type { CountrySpecificCommunityLinks } from '@/types';

export const mockCountrySpecificCommunityLinks: CountrySpecificCommunityLinks[] = [
  {
    countryName: "Indonesia",
    links: [
      { platform: "WhatsApp", name: "Bali Digital Nomads", url: "https://chat.whatsapp.com/examplebali", dataAiHint: "chat group" },
      { platform: "Slack", name: "Indonesia Remote Workers", url: "https://slack.com/exampleremoteid", dataAiHint: "team collaboration" },
      { platform: "Telegram", name: "Jakarta Expats & Nomads", url: "https://t.me/examplejakarta", dataAiHint: "telegram group"},
    ]
  },
  {
    countryName: "Portugal",
    links: [
      { platform: "WhatsApp", name: "Lisbon Nomads Hub", url: "https://chat.whatsapp.com/examplelisbon", dataAiHint: "community discussion"},
      { platform: "Telegram", name: "Portugal Digital Nomads", url: "https://t.me/exampleportugal", dataAiHint: "telegram channel"},
    ]
  },
  {
    countryName: "USA",
    links: [
      { platform: "Slack", name: "US Remote Professionals", url: "https://slack.com/exampleusremote", dataAiHint: "professional network"},
    ]
  },
  {
    countryName: "Japan",
    links: [
      { platform: "Telegram", name: "Tokyo Nomads", url: "https://t.me/exampletokyo", dataAiHint: "tokyo community"},
    ]
  },
  {
    countryName: "South Africa",
    links: [
      { platform: "WhatsApp", name: "Cape Town Digital Nomads", url: "https://chat.whatsapp.com/examplecapetown", dataAiHint: "cape town group"},
    ]
  },
  {
    countryName: "Colombia",
    links: [
      { platform: "Slack", name: "Medellín Nomad Network", url: "https://slack.com/examplemedellin", dataAiHint: "medellin network"},
      { platform: "WhatsApp", name: "Colombian Nomads Connect", url: "https://chat.whatsapp.com/examplecolombia", dataAiHint: "colombia chat"},
    ]
  }
  // Add more countries and links as needed for other mock coliving spaces
];
