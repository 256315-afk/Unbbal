
import type { RarityConfig } from './types';
import { Rarity } from './types';

export const TOTAL_ITEMS = 1000;

export const RARITY_CONFIG: Record<Rarity, RarityConfig> = {
  [Rarity.Common]: {
    count: 495,
    chance: 58.4499,
    color: 'border-gray-400',
    name: 'Common',
    koreanName: '흔한',
    icons: ['fa-solid fa-shield-halved', 'fa-solid fa-staff-snake', 'fa-solid fa-bottle-water'],
  },
  [Rarity.Uncommon]: {
    count: 300,
    chance: 30,
    color: 'border-green-500',
    name: 'Uncommon',
    koreanName: '드문',
    icons: ['fa-solid fa-book', 'fa-solid fa-ring', 'fa-solid fa-scroll'],
  },
  [Rarity.Rare]: {
    count: 150,
    chance: 8,
    color: 'border-blue-500',
    name: 'Rare',
    koreanName: '희귀',
    icons: ['fa-solid fa-wand-magic-sparkles', 'fa-solid fa-feather-pointed', 'fa-solid fa-hat-wizard'],
  },
  [Rarity.Epic]: {
    count: 40,
    chance: 3,
    color: 'border-purple-600',
    name: 'Epic',
    koreanName: '영웅',
    icons: ['fa-solid fa-hand-fist', 'fa-solid fa-dragon', 'fa-solid fa-gavel'],
  },
  [Rarity.Legendary]: {
    count: 8,
    chance: 0.5,
    color: 'border-orange-500',
    name: 'Legendary',
    koreanName: '전설',
    icons: ['fa-solid fa-crown', 'fa-solid fa-meteor', 'fa-solid fa-khanda'],
  },
  [Rarity.Mythic]: {
    count: 2,
    chance: 0.05,
    color: 'border-red-600',
    name: 'Mythic',
    koreanName: '신화',
    icons: ['fa-solid fa-eye', 'fa-solid fa-skull-crossbones', 'fa-solid fa-ghost'],
  },
  [Rarity.Shadow]: {
    count: 5,
    chance: 0.0001,
    color: 'border-yellow-400',
    name: 'Shadow',
    koreanName: '그림자',
    icons: ['fa-solid fa-user-secret', 'fa-solid fa-moon', 'fa-solid fa-mask'],
  },
};

export const ITEM_NAME_PARTS = {
  prefixes: ['고대', '빛나는', '저주받은', '축복받은', '그림자의', '서리', '화염', '심연의', '천상의'],
  suffixes: ['검', '보주', '왕관', '심장', '파편', '정수', '망토', '반지', '부츠', '활'],
};