
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Item } from './types';
import { Rarity } from './types';
import { TOTAL_ITEMS, RARITY_CONFIG, ITEM_NAME_PARTS } from './constants';

// --- Helper Functions ---
const generateItems = (): Item[] => {
  const items: Item[] = [];
  let currentId = 0;
  for (const rarityKey in RARITY_CONFIG) {
    const rarity = rarityKey as Rarity;
    const config = RARITY_CONFIG[rarity];
    const probability = config.chance / 100;

    for (let i = 0; i < config.count; i++) {
      const prefix = ITEM_NAME_PARTS.prefixes[Math.floor(Math.random() * ITEM_NAME_PARTS.prefixes.length)];
      const suffix = ITEM_NAME_PARTS.suffixes[Math.floor(Math.random() * ITEM_NAME_PARTS.suffixes.length)];
      const name = `${prefix} ${suffix}`;
      const icon = config.icons[Math.floor(Math.random() * config.icons.length)];

      items.push({
        id: currentId,
        name: name,
        rarity: rarity,
        probability: probability / config.count, // Individual item probability
        color: config.color,
        icon: icon,
        koreanName: config.koreanName,
      });
      currentId++;
    }
  }
  // This ensures the total number of items matches TOTAL_ITEMS exactly
  return items.slice(0, TOTAL_ITEMS);
};

const formatTime = (milliseconds: number): string => {
  if (milliseconds < 0) return '00:00:00';
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const formatProbabilityPercent = (probability: number): string => {
  const percent = probability * 100;
  if (percent === 0) return '0%';
  if (percent >= 0.01) return `${percent.toFixed(2)}%`;
  
  const s = percent.toFixed(20);
  let leadingZeros = 0;
  let afterDecimal = false;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '.') {
      afterDecimal = true;
      continue;
    }
    if (afterDecimal) {
      if (s[i] === '0') {
        leadingZeros++;
      } else {
        break;
      }
    }
  }
  return `${percent.toFixed(leadingZeros + 4)}%`;
};


// --- Child Components ---

interface ItemCardProps {
  item: Item;
  isOwned: boolean;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, isOwned }) => {
  const rarityConfig = RARITY_CONFIG[item.rarity];
  const itemTitle = `${item.name} [${rarityConfig.koreanName}] - ${formatProbabilityPercent(item.probability)}`;

  return (
    <div
      title={itemTitle}
      className={`relative w-16 h-16 md:w-20 md:h-20 bg-gray-800 border-2 ${
        isOwned ? `${rarityConfig.color} shadow-lg` : 'border-gray-700'
      } rounded-lg flex items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-105`}
    >
      <i
        className={`${item.icon} text-2xl md:text-3xl ${
          isOwned ? 'text-white' : 'text-gray-600'
        } transition-colors duration-300`}
        style={isOwned ? { textShadow: `0 0 8px ${rarityConfig.color.replace('border-', '')}` } : {}}
      ></i>
      {!isOwned && <div className="absolute inset-0 bg-black opacity-60 rounded-md"></div>}
    </div>
  );
};

interface CompletionModalProps {
  time: number;
}
const CompletionModal: React.FC<CompletionModalProps> = ({ time }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-yellow-400 rounded-lg p-8 text-center shadow-2xl animate-fade-in">
        <h2 className="text-4xl font-bold text-yellow-400 mb-4">축하합니다!</h2>
        <p className="text-xl mb-2">모든 {TOTAL_ITEMS}개의 아이템을 수집했습니다!</p>
        <p className="text-lg text-gray-300">총 걸린 시간: <span className="font-semibold text-white">{formatTime(time)}</span></p>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const [ownedItems, setOwnedItems] = useState<Set<number>>(new Set());
  const [lastFound, setLastFound] = useState<{ item: Item; isDuplicate: boolean } | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [animationKey, setAnimationKey] = useState(0);

  const allItems = useMemo(() => generateItems(), []);

  const allItemsById = useMemo(() => {
    const map = new Map<number, Item>();
    allItems.forEach(item => map.set(item.id, item));
    return map;
  }, [allItems]);
  
  const itemsByRarity = useMemo(() => {
    const grouped: Record<Rarity, Item[]> = {} as Record<Rarity, Item[]>;
    for (const item of allItems) {
      if (!grouped[item.rarity]) {
        grouped[item.rarity] = [];
      }
      grouped[item.rarity].push(item);
    }
    return grouped;
  }, [allItems]);

  const ownedItemsByRarity = useMemo(() => {
    const counts: Record<Rarity, number> = {} as Record<Rarity, number>;
    for (const rarity of Object.keys(RARITY_CONFIG) as Rarity[]) {
        counts[rarity] = 0;
    }

    for (const itemId of ownedItems) {
        const item = allItemsById.get(itemId);
        if (item) {
            counts[item.rarity]++;
        }
    }
    return counts;
  }, [ownedItems, allItemsById]);

  const rarityOrder = useMemo(() => [
    Rarity.Common,
    Rarity.Uncommon,
    Rarity.Rare,
    Rarity.Epic,
    Rarity.Legendary,
    Rarity.Mythic,
    Rarity.Shadow,
  ], []);


  useEffect(() => {
    const now = Date.now();
    setStartTime(now);
    
    const timer = setInterval(() => {
      if(!isComplete) {
         setElapsedTime(Date.now() - now);
      }
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete]); // Rerunning on isComplete stop the timer

  useEffect(() => {
    if (ownedItems.size > 0 && ownedItems.size >= TOTAL_ITEMS && !isComplete) {
      setIsComplete(true);
    }
  }, [ownedItems, isComplete]);

  const handleFindItem = useCallback(() => {
    if (isComplete) return;

    const roll = Math.random() * 100;
    let cumulativeChance = 0;
    let selectedRarity: Rarity = Rarity.Common;

    for (const rarityKey in RARITY_CONFIG) {
        const rarity = rarityKey as Rarity;
        cumulativeChance += RARITY_CONFIG[rarity].chance;
        if (roll < cumulativeChance) {
            selectedRarity = rarity;
            break;
        }
    }
    
    const tierItems = itemsByRarity[selectedRarity];
    if (!tierItems || tierItems.length === 0) {
      // Fallback in case a rarity tier has no items
      handleFindItem();
      return;
    }
    const foundItem = tierItems[Math.floor(Math.random() * tierItems.length)];
    const isDuplicate = ownedItems.has(foundItem.id);

    if (!isDuplicate) {
        setOwnedItems(prev => {
            const newSet = new Set(prev);
            newSet.add(foundItem.id);
            return newSet;
        });
    }

    setLastFound({ item: foundItem, isDuplicate });
    setAnimationKey(prev => prev + 1); // Trigger re-render of message

  }, [isComplete, itemsByRarity, ownedItems]);

  return (
    <div className="min-h-screen flex flex-col p-4 bg-gray-900 font-sans">
      {isComplete && <CompletionModal time={elapsedTime} />}
      <header className="text-center mb-4">
        <h1 className="text-4xl md:text-5xl font-bold text-yellow-300 tracking-wider">운빨망겜</h1>
        <p className="text-gray-400">당신의 운을 시험하세요</p>
      </header>

      <div className="flex flex-col items-center gap-4 mb-4">
        <button
          onClick={handleFindItem}
          disabled={isComplete}
          className="px-8 py-4 bg-yellow-500 text-gray-900 font-bold text-2xl rounded-lg shadow-md hover:bg-yellow-400 active:scale-95 transition-transform duration-150 disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          뽑기
        </button>
        {lastFound && (
             <div key={animationKey} className="p-3 bg-gray-800 rounded-lg text-center w-full max-w-sm animate-fade-in">
                <p className="text-sm">{lastFound.isDuplicate ? "이미 소유한 아이템입니다." : "아이템을 얻었습니다!"}</p>
                <p className={`font-semibold ${RARITY_CONFIG[lastFound.item.rarity].color.replace('border-','text-')}`}>{lastFound.item.name}</p>
                <p className="text-xs text-gray-400">
                    [{RARITY_CONFIG[lastFound.item.rarity].koreanName}] ({formatProbabilityPercent(lastFound.item.probability)})
                </p>
            </div>
        )}
      </div>
      
      <main className="flex-grow flex flex-col md:flex-row gap-4">
        {/* Left Panel: Controls */}
        <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col gap-4">
          <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-2">진행 상황</h2>
            <p className="text-lg">{ownedItems.size.toLocaleString()} / {TOTAL_ITEMS.toLocaleString()}</p>
            <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
              <div className="bg-yellow-400 h-2.5 rounded-full" style={{ width: `${(ownedItems.size / TOTAL_ITEMS) * 100}%` }}></div>
            </div>
            <p className="mt-4 text-lg">경과 시간: <span className="font-mono">{formatTime(elapsedTime)}</span></p>
          </div>
        </div>
        {/* Right Panel: Inventory */}
        <div className="w-full md:w-2/3 lg:w-3/4 bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col">
          <h2 className="text-2xl font-semibold mb-4 border-b border-gray-700 pb-2">가방</h2>
          <div className="flex-grow overflow-y-auto pr-2">
            {rarityOrder.map(rarity => {
              const config = RARITY_CONFIG[rarity];
              const itemsInRarity = itemsByRarity[rarity];
              const ownedCount = ownedItemsByRarity[rarity];

              if (!itemsInRarity || itemsInRarity.length === 0) {
                return null;
              }

              return (
                <div key={rarity} className="mb-6">
                  <h3 className={`text-lg font-bold mb-3 pb-1 border-b ${config.color} ${config.color.replace('border-', 'text-')}`}>
                    {config.koreanName} ({config.name})
                    <span className="text-sm font-normal text-gray-400 ml-2">
                      {ownedCount} / {itemsInRarity.length}
                    </span>
                  </h3>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
                    {itemsInRarity.map(item => (
                      <ItemCard key={item.id} item={item} isOwned={ownedItems.has(item.id)} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <footer className="text-center text-gray-500 text-sm py-4">
        제작자: 안재원
      </footer>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;
