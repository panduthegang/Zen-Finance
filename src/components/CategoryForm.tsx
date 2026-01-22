import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from './ui/Base';
import { TransactionType, Category } from '../types';
import { CATEGORY_ICONS, cn } from '../utils/helpers';
import {
  addCategory as addCategoryToFirestore,
  updateCategory as updateCategoryInFirestore
} from '../services/firestoreService';

// Icons suitable for income categories
const INCOME_ICONS = ['wallet', 'briefcase', 'gift', 'graduation-cap', 'shield'];

// Icons suitable for expense categories  
const EXPENSE_ICONS = ['home', 'utensils', 'car', 'film', 'zap', 'shopping-bag', 'coffee', 'heart', 'music', 'smartphone', 'plane', 'dumbbell', 'dog', 'hammer', 'tag'];

interface CategoryFormProps {
  onSuccess: () => void;
  initialData?: Category | null;
  defaultType?: TransactionType;
}

// Vibrant colors for categories
const CATEGORY_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#84cc16', // lime
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#d946ef', // fuchsia
  '#f43f5e', // rose
  '#64748b', // slate
];

const getRandomColor = () => CATEGORY_COLORS[Math.floor(Math.random() * CATEGORY_COLORS.length)];

export const CategoryForm = ({ onSuccess, initialData, defaultType = 'expense' }: CategoryFormProps) => {
  const { currentUser } = useAuth();

  const [name, setName] = useState(initialData?.name || '');
  const [color, setColor] = useState(initialData?.color || getRandomColor());
  const [icon, setIcon] = useState(initialData?.icon || 'tag');
  const [type, setType] = useState<TransactionType>(initialData?.type || defaultType);
  const [budgetLimit, setBudgetLimit] = useState(initialData?.budgetLimit?.toString() || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setColor(initialData.color);
      setIcon(initialData.icon || 'tag');
      setType(initialData.type);
      setBudgetLimit(initialData.budgetLimit?.toString() || '');
    } else {
      setName('');
      setColor(getRandomColor());
      setIcon('tag');
      setType(defaultType);
      setBudgetLimit('');
    }
  }, [initialData, defaultType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !currentUser) return;

    setIsSubmitting(true);
    setError(null);

    // Build category data - don't include budgetLimit for income (Firestore doesn't accept undefined)
    const categoryData: {
      name: string;
      color: string;
      icon: string;
      type: TransactionType;
      budgetLimit?: number;
    } = {
      name,
      color,
      icon,
      type,
    };

    // Only add budgetLimit for expense categories with a value
    if (type === 'expense' && budgetLimit) {
      categoryData.budgetLimit = parseFloat(budgetLimit);
    }

    try {
      if (initialData) {
        await updateCategoryInFirestore(currentUser.uid, initialData.id, categoryData);
      } else {
        await addCategoryToFirestore(currentUser.uid, categoryData);
      }
      onSuccess();
    } catch (err) {
      console.error('Error saving category:', err);
      setError('Failed to save category. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get icons based on category type
  const availableIcons = type === 'income' ? INCOME_ICONS : EXPENSE_ICONS;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Type Toggle */}
      {!initialData && (
        <div className="grid grid-cols-2 gap-2 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl">
          {(['expense', 'income'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`py-2 rounded-lg text-sm font-medium transition-all ${type === t
                ? 'bg-white dark:bg-stone-700 shadow-sm text-stone-900 dark:text-white'
                : 'text-stone-500 hover:text-stone-700 dark:text-stone-400'
                }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      )}

      <Input
        label="Category Name"
        placeholder="e.g., Groceries, Investment"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <div className="space-y-2">
        <label className="text-sm font-medium uppercase tracking-wider text-stone-500 dark:text-stone-500">Icon</label>
        <div className="grid grid-cols-6 gap-2">
          {availableIcons.map((iconKey) => {
            const IconComponent = CATEGORY_ICONS[iconKey];
            return (
              <button
                key={iconKey}
                type="button"
                onClick={() => setIcon(iconKey)}
                className={cn(
                  "h-10 w-10 flex items-center justify-center rounded-lg border transition-all",
                  icon === iconKey
                    ? "bg-stone-900 text-white border-stone-900 dark:bg-stone-100 dark:text-black dark:border-stone-100"
                    : "bg-white text-stone-500 border-stone-200 hover:border-stone-400 dark:bg-stone-900 dark:text-stone-400 dark:border-stone-800 dark:hover:border-stone-700"
                )}
              >
                <IconComponent size={20} />
              </button>
            )
          })}
        </div>
      </div>



      {type === 'expense' && (
        <Input
          label="Monthly Budget Limit"
          type="number"
          placeholder="Optional"
          value={budgetLimit}
          onChange={(e) => setBudgetLimit(e.target.value)}
        />
      )}

      <div className="pt-4 flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onSuccess}>Cancel</Button>
        <Button type="submit" isLoading={isSubmitting}>
          {initialData ? 'Update Category' : 'Add Category'}
        </Button>
      </div>
    </form>
  );
};