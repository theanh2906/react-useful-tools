import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Apple, AlertTriangle, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { FoodItem, FoodCategory } from '@/types';
import { listenFoods } from '@/services/foodService';
import { useAuthStore } from '@/stores/authStore';

// Mock food data
const foodsData: FoodItem[] = [
  // Safe foods
  { id: '1', name: 'Eggs (fully cooked)', category: 'safe', description: 'Great source of protein and choline' },
  { id: '2', name: 'Salmon (cooked)', category: 'safe', description: 'Rich in omega-3 fatty acids' },
  { id: '3', name: 'Spinach', category: 'safe', description: 'High in iron and folic acid' },
  { id: '4', name: 'Greek Yogurt', category: 'safe', description: 'Calcium and probiotics' },
  { id: '5', name: 'Lean Chicken', category: 'safe', description: 'Protein without excess fat' },
  { id: '6', name: 'Sweet Potatoes', category: 'safe', description: 'Vitamin A and fiber' },
  { id: '7', name: 'Avocado', category: 'safe', description: 'Healthy fats and folate' },
  { id: '8', name: 'Berries', category: 'safe', description: 'Antioxidants and vitamins' },
  
  // Forbidden foods
  { id: '9', name: 'Raw Fish (Sushi)', category: 'forbidden', reason: 'Risk of parasites and bacteria' },
  { id: '10', name: 'Unpasteurized Milk', category: 'forbidden', reason: 'May contain harmful bacteria' },
  { id: '11', name: 'Raw Eggs', category: 'forbidden', reason: 'Risk of Salmonella' },
  { id: '12', name: 'High Mercury Fish', category: 'forbidden', reason: 'Mercury can harm baby\'s brain' },
  { id: '13', name: 'Raw Sprouts', category: 'forbidden', reason: 'High risk of bacteria' },
  { id: '14', name: 'Deli Meats', category: 'forbidden', reason: 'Risk of Listeria', alternatives: ['Heated to steaming'] },
  
  // Limited foods
  { id: '15', name: 'Caffeine', category: 'limited', reason: 'Limit to 200mg/day (about 1 cup coffee)' },
  { id: '16', name: 'Tuna', category: 'limited', reason: 'Contains mercury - limit to 2-3 servings/week' },
  { id: '17', name: 'Liver', category: 'limited', reason: 'Very high in Vitamin A - small amounts only' },
  { id: '18', name: 'Herbal Teas', category: 'limited', reason: 'Some herbs may not be safe - check with doctor' },
];

const categories: { id: FoodCategory; label: string; icon: typeof Apple; color: string }[] = [
  { id: 'safe', label: 'Safe Foods', icon: CheckCircle, color: 'emerald' },
  { id: 'limited', label: 'Limited', icon: AlertCircle, color: 'amber' },
  { id: 'forbidden', label: 'Avoid', icon: AlertTriangle, color: 'red' },
];

export function FoodGuidePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | null>(null);
  const [foods, setFoods] = useState<FoodItem[]>(foodsData);
  const userId = useAuthStore((state) => state.user?.id);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    listenFoods((data) => {
      if (data.length > 0) {
        setFoods(data);
      }
    }).then((unsub) => {
      unsubscribe = unsub;
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [userId]);

  const filteredFoods = foods.filter((food) => {
    const matchesSearch = !searchQuery || 
      food.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || food.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryStyle = (category: FoodCategory) => {
    switch (category) {
      case 'safe':
        return {
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          icon: CheckCircle,
          iconColor: 'text-emerald-400',
          badge: 'success' as const
        };
      case 'limited':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          icon: AlertCircle,
          iconColor: 'text-amber-400',
          badge: 'warning' as const
        };
      case 'forbidden':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          icon: AlertTriangle,
          iconColor: 'text-red-400',
          badge: 'danger' as const
        };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-white">Food Guide</h1>
        <p className="text-slate-400 mt-1">What's safe to eat during pregnancy</p>
      </div>

      {/* Info Banner */}
      <Card variant="gradient" className="p-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
            <Info className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-white font-medium mb-1">Nutrition During Pregnancy</p>
            <p className="text-sm text-slate-400">
              A balanced diet is crucial for your baby's development. Always consult your healthcare provider 
              about specific dietary concerns.
            </p>
          </div>
        </div>
      </Card>

      {/* Search & Filter */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search foods..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-primary-500/50"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                'px-4 py-2 rounded-xl font-medium transition-all',
                !selectedCategory
                  ? 'bg-white/20 text-white'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              )}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
                className={cn(
                  'px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2',
                  selectedCategory === cat.id
                    ? `bg-${cat.color}-500/20 text-${cat.color}-300`
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                )}
              >
                <cat.icon className={cn('w-4 h-4', selectedCategory === cat.id && `text-${cat.color}-400`)} />
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Category Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const count = foods.filter(f => f.category === cat.id).length;
          const style = getCategoryStyle(cat.id);
          return (
            <Card
              key={cat.id}
              hover
              className={cn('p-5 cursor-pointer', style.bg, style.border)}
              onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
            >
              <div className="flex items-center gap-3">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', style.bg)}>
                  <cat.icon className={cn('w-5 h-5', style.iconColor)} />
                </div>
                <div>
                  <p className="font-medium text-white">{cat.label}</p>
                  <p className="text-sm text-slate-400">{count} items</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Food List */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredFoods.map((food, i) => {
            const style = getCategoryStyle(food.category);
            const Icon = style.icon;
            
            return (
              <motion.div
                key={food.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className={cn('p-5 border', style.bg, style.border)}>
                  <div className="flex items-start gap-3">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', style.bg)}>
                      <Icon className={cn('w-5 h-5', style.iconColor)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-medium text-white truncate">{food.name}</h3>
                        <Badge variant={style.badge} size="sm">
                          {food.category === 'safe' ? '✓ Safe' : food.category === 'limited' ? '⚠ Limited' : '✕ Avoid'}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-400">
                        {food.description || food.reason}
                      </p>
                      {food.alternatives && food.alternatives.length > 0 && (
                        <p className="text-xs text-emerald-400 mt-2">
                          Alternative: {food.alternatives.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredFoods.length === 0 && (
        <Card className="p-12 text-center">
          <Apple className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No foods found</h3>
          <p className="text-slate-400">Try adjusting your search or filters</p>
        </Card>
      )}
    </motion.div>
  );
}

export default FoodGuidePage;
