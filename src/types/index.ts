export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Account {
  id: string;
  name: string;
  currency: string;
  balance: number;
  color: string;
  icon: string;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  category: string;
  subcategory?: string;
  description: string;
  date: Date;
  notes?: string;
  // For transfers
  toAccountId?: string;
  // Auto-categorization source
  categorySource: 'manual' | 'auto' | 'import';
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  keywords: string[]; // For auto-categorization
  parentId?: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  currency: string;
  period: 'monthly' | 'weekly' | 'yearly';
  startDate: Date;
}

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'semi-annually' | 'annually';

export const FREQUENCY_LABELS: Record<RecurringFrequency, string> = {
  daily: 'Quotidien',
  weekly: 'Hebdomadaire',
  monthly: 'Mensuel',
  quarterly: 'Trimestriel',
  'semi-annually': 'Semestriel',
  annually: 'Annuel',
};

export interface RecurringTransaction {
  id: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  category: string;
  description: string;
  frequency: RecurringFrequency;
  startDate: Date;
  endDate?: Date;
  nextDate: Date;
  isActive: boolean;
  createdAt: Date;
}

export interface CsvMapping {
  dateColumn: string;
  amountColumn: string;
  descriptionColumn: string;
  categoryColumn?: string;
  dateFormat: string;
  delimiter: string;
  decimalSeparator: string;
  skipRows: number;
}

export interface AppSettings {
  id: string;
  defaultCurrency: string;
  locale: string;
  theme: 'light' | 'dark';
  csvMappings: Record<string, CsvMapping>;
}

export const CURRENCIES = [
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'DZD', symbol: 'د.ج', name: 'Dinar Algérien' },
  { code: 'JPY', symbol: '¥', name: 'Yen Japonais' },
  { code: 'CHF', symbol: 'CHF', name: 'Franc Suisse' },
  { code: 'CAD', symbol: 'CA$', name: 'Dollar Canadien' },
  { code: 'TRY', symbol: '₺', name: 'Lire Turque' },
  { code: 'CNY', symbol: '¥', name: 'Yuan Chinois' },
  { code: 'BRL', symbol: 'R$', name: 'Réal Brésilien' },
] as const;

export const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  // ── Expenses ──
  // Alimentation & boissons
  { name: 'Alimentation', icon: '🛒', color: '#4CAF50', type: 'expense', keywords: ['supermarché', 'carrefour', 'leclerc', 'auchan', 'lidl', 'marché', 'épicerie', 'boulangerie', 'intermarché', 'monoprix', 'picard', 'bio', 'primeur'] },
  { name: 'Restaurant', icon: '🍽️', color: '#FF9800', type: 'expense', keywords: ['restaurant', 'mcdo', 'burger', 'pizza', 'uber eats', 'deliveroo', 'just eat', 'kebab', 'sushi', 'bistro', 'brasserie', 'cantine'] },
  { name: 'Café & Bar', icon: '☕', color: '#795548', type: 'expense', keywords: ['café', 'starbucks', 'bar', 'bière', 'pub', 'terrasse', 'thé'] },

  // Logement & charges
  { name: 'Loyer', icon: '🏠', color: '#9C27B0', type: 'expense', keywords: ['loyer', 'bail', 'location', 'résidence'] },
  { name: 'Charges & Énergie', icon: '💡', color: '#AB47BC', type: 'expense', keywords: ['edf', 'eau', 'gaz', 'électricité', 'engie', 'chauffage', 'copropriété', 'charges'] },
  { name: 'Ameublement', icon: '🛋️', color: '#8D6E63', type: 'expense', keywords: ['ikea', 'meuble', 'décoration', 'bricolage', 'leroy merlin', 'castorama', 'but', 'conforama', 'maison'] },

  // Transport
  { name: 'Transport', icon: '🚗', color: '#2196F3', type: 'expense', keywords: ['essence', 'parking', 'péage', 'autoroute', 'station', 'total', 'shell', 'bp'] },
  { name: 'Transport en commun', icon: '🚇', color: '#1976D2', type: 'expense', keywords: ['sncf', 'ratp', 'metro', 'bus', 'tram', 'navigo', 'train', 'ter', 'tgv', 'ouigo', 'billet'] },
  { name: 'VTC & Taxi', icon: '🚕', color: '#42A5F5', type: 'expense', keywords: ['uber', 'taxi', 'bolt', 'vtc', 'kapten', 'heetch', 'freenow'] },
  { name: 'Véhicule', icon: '🔧', color: '#0D47A1', type: 'expense', keywords: ['garagiste', 'réparation', 'contrôle technique', 'vidange', 'pneu', 'assurance auto', 'carte grise'] },

  // Shopping
  { name: 'Vêtements', icon: '👕', color: '#E91E63', type: 'expense', keywords: ['zara', 'h&m', 'uniqlo', 'vêtement', 'chaussure', 'nike', 'adidas', 'pull&bear', 'asos', 'kiabi', 'primark'] },
  { name: 'Électronique', icon: '📱', color: '#FF5722', type: 'expense', keywords: ['apple', 'samsung', 'fnac', 'darty', 'boulanger', 'ldlc', 'ordinateur', 'téléphone', 'écouteur', 'casque'] },
  { name: 'Shopping en ligne', icon: '📦', color: '#FF7043', type: 'expense', keywords: ['amazon', 'aliexpress', 'temu', 'shein', 'cdiscount', 'ebay', 'vinted'] },

  // Santé & bien-être
  { name: 'Santé', icon: '🏥', color: '#F44336', type: 'expense', keywords: ['pharmacie', 'médecin', 'dentiste', 'mutuelle', 'cpam', 'ordonnance', 'docteur', 'hôpital', 'clinique', 'opticien', 'lunette'] },
  { name: 'Sport & Fitness', icon: '🏋️', color: '#E53935', type: 'expense', keywords: ['salle de sport', 'basic fit', 'fitness', 'yoga', 'piscine', 'gym', 'décathlon', 'sport'] },
  { name: 'Bien-être', icon: '💆', color: '#EC407A', type: 'expense', keywords: ['coiffeur', 'barbier', 'spa', 'massage', 'esthétique', 'cosmétique', 'sephora', 'parfum'] },

  // Loisirs & culture
  { name: 'Loisirs', icon: '🎮', color: '#7C4DFF', type: 'expense', keywords: ['jeu', 'steam', 'playstation', 'xbox', 'nintendo', 'console', 'jeu vidéo'] },
  { name: 'Sorties', icon: '🎉', color: '#AA00FF', type: 'expense', keywords: ['cinéma', 'concert', 'spectacle', 'théâtre', 'musée', 'expo', 'parc', 'soirée', 'boîte', 'bowling'] },
  { name: 'Streaming', icon: '📺', color: '#D500F9', type: 'expense', keywords: ['netflix', 'spotify', 'disney', 'prime video', 'youtube', 'deezer', 'apple music', 'hbo', 'crunchyroll', 'twitch'] },
  { name: 'Livres & Presse', icon: '📖', color: '#6200EA', type: 'expense', keywords: ['livre', 'kindle', 'presse', 'journal', 'magazine', 'bd', 'manga', 'librairie'] },

  // Voyages
  { name: 'Voyage', icon: '✈️', color: '#00BCD4', type: 'expense', keywords: ['avion', 'hôtel', 'airbnb', 'booking', 'billet avion', 'vol', 'aéroport', 'valise', 'ryanair', 'easyjet'] },
  { name: 'Hébergement', icon: '🏨', color: '#0097A7', type: 'expense', keywords: ['hôtel', 'airbnb', 'booking', 'gîte', 'camping', 'auberge', 'nuitée'] },

  // Éducation
  { name: 'Éducation', icon: '📚', color: '#3F51B5', type: 'expense', keywords: ['université', 'formation', 'cours', 'école', 'udemy', 'openclassrooms', 'scolarité', 'inscription'] },
  { name: 'Fournitures', icon: '✏️', color: '#5C6BC0', type: 'expense', keywords: ['papeterie', 'cahier', 'stylo', 'cartouche', 'imprimante', 'bureau vallée'] },

  // Abonnements & services
  { name: 'Télécom', icon: '📡', color: '#009688', type: 'expense', keywords: ['téléphone', 'internet', 'box', 'forfait', 'mobile', 'free', 'orange', 'sfr', 'bouygues', 'fibre', 'red'] },
  { name: 'Assurances', icon: '🛡️', color: '#546E7A', type: 'expense', keywords: ['assurance', 'maif', 'macif', 'axa', 'allianz', 'gmf', 'matmut', 'prime assurance'] },
  { name: 'Services numériques', icon: '☁️', color: '#26A69A', type: 'expense', keywords: ['cloud', 'stockage', 'vpn', 'domaine', 'hébergement', 'saas', 'notion', 'figma', 'adobe', 'chatgpt'] },

  // Banque & finance
  { name: 'Frais bancaires', icon: '🏦', color: '#78909C', type: 'expense', keywords: ['frais', 'commission', 'agios', 'tenue de compte', 'carte bancaire', 'cotisation'] },
  { name: 'Impôts & Taxes', icon: '📋', color: '#455A64', type: 'expense', keywords: ['impôt', 'taxe', 'cotisation', 'urssaf', 'cfe', 'taxe habitation', 'taxe foncière', 'tva'] },
  { name: 'Remboursement crédit', icon: '💳', color: '#37474F', type: 'expense', keywords: ['crédit', 'emprunt', 'mensualité', 'prêt', 'remboursement'] },

  // Enfants & famille
  { name: 'Enfants', icon: '👶', color: '#F48FB1', type: 'expense', keywords: ['crèche', 'nounou', 'garde', 'jouet', 'couche', 'bébé', 'enfant', 'école maternelle'] },
  { name: 'Animaux', icon: '🐾', color: '#A1887F', type: 'expense', keywords: ['vétérinaire', 'croquette', 'animal', 'chat', 'chien', 'animalerie'] },

  // Dons & cadeaux
  { name: 'Cadeaux', icon: '🎁', color: '#F06292', type: 'expense', keywords: ['cadeau', 'anniversaire', 'noël', 'fête'] },
  { name: 'Dons', icon: '❤️', color: '#EF5350', type: 'expense', keywords: ['don', 'association', 'charité', 'cagnotte', 'leetchi', 'croix rouge'] },

  // Catch-all
  { name: 'Autre dépense', icon: '📦', color: '#607D8B', type: 'expense', keywords: [] },

  // ── Income ──
  { name: 'Salaire', icon: '💰', color: '#4CAF50', type: 'income', keywords: ['salaire', 'paie', 'virement employeur', 'bulletin', 'net à payer'] },
  { name: 'Freelance', icon: '💻', color: '#8BC34A', type: 'income', keywords: ['freelance', 'facture', 'prestation', 'mission', 'honoraire', 'auto-entrepreneur'] },
  { name: 'Investissement', icon: '📈', color: '#FF9800', type: 'income', keywords: ['dividende', 'intérêt', 'placement', 'rendement', 'plus-value', 'action', 'crypto'] },
  { name: 'Aides & Allocations', icon: '🏛️', color: '#66BB6A', type: 'income', keywords: ['caf', 'apl', 'allocation', 'bourse', 'aide', 'rsa', 'pôle emploi', 'prime activité'] },
  { name: 'Loyers perçus', icon: '🔑', color: '#FFA726', type: 'income', keywords: ['loyer perçu', 'locataire', 'location', 'rente'] },
  { name: 'Ventes', icon: '🏷️', color: '#26C6DA', type: 'income', keywords: ['vente', 'vinted', 'leboncoin', 'occasion', 'revente'] },
  { name: 'Remboursement', icon: '🔄', color: '#78909C', type: 'income', keywords: ['remboursement', 'retour', 'avoir', 'trop-perçu', 'sécu', 'mutuelle'] },
  { name: 'Autre revenu', icon: '🎁', color: '#9E9E9E', type: 'income', keywords: ['cadeau', 'don reçu', 'héritage', 'gain', 'prime'] },
];
