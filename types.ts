
export enum Rarity {
  Common = 'Common',
  Uncommon = 'Uncommon',
  Rare = 'Rare',
  Epic = 'Epic',
  Legendary = 'Legendary',
  Mythic = 'Mythic',
  Shadow = 'Shadow',
}

export interface Item {
  id: number;
  name: string;
  rarity: Rarity;
  probability: number;
  color: string;
  icon: string;
  koreanName: string;
}

export interface RarityConfig {
  count: number;
  chance: number;
  color: string;
  name: string;
  koreanName: string;
  icons: string[];
}