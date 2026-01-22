import React, { useState } from 'react';
import { useAppStore } from '../store';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Select } from './ui/Base';
import { TransactionType, Frequency, Transaction } from '../types';
import {
  addTransaction as addTransactionToFirestore,
  updateTransaction as updateTransactionInFirestore
} from '../services/firestoreService';

interface TransactionFormProps {
  onSuccess: () => void;
  initialData?: Transaction | null;
}

export const TransactionForm = ({ onSuccess, initialData }: TransactionFormProps) => {
  const { categories } = useAppStore();
  const { currentUser } = useAuth();

  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [type, setType] = useState<TransactionType>(initialData?.type || 'expense');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [date, setDate] = useState(
    initialData?.date
      ? new Date(initialData.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [isRecurring, setIsRecurring] = useState(initialData?.isRecurring || false);
  const [frequency, setFrequency] = useState<Frequency>(initialData?.frequency || 'one-time');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredCategories = categories.filter(c => c.type === type);
  const isEditing = !!initialData;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId || !description || !currentUser) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const transactionData = {
        amount: parseFloat(amount),
        description,
        type,
        categoryId,
        date: new Date(date).toISOString(),
        isRecurring,
        frequency: isRecurring ? frequency : 'one-time' as Frequency,
      };

      if (isEditing && initialData) {
        await updateTransactionInFirestore(currentUser.uid, initialData.id, transactionData);
      } else {
        await addTransactionToFirestore(currentUser.uid, transactionData);
      }

      onSuccess();
    } catch (err) {
      console.error('Error saving transaction:', err);
      setError('Failed to save transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Type Toggle */}
      <div className="grid grid-cols-2 gap-2 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl">
        {(['expense', 'income'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { setType(t); setCategoryId(''); }}
            className={`py-2 rounded-lg text-sm font-medium transition-all ${type === t
                ? 'bg-white dark:bg-stone-700 shadow-sm text-stone-900 dark:text-white'
                : 'text-stone-500 hover:text-stone-700 dark:text-stone-400'
              }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <Input
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <Input
        label="Description"
        placeholder="What was this for?"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />

      <Select
        label="Category"
        value={categoryId}
        onChange={(val) => setCategoryId(val)}
        options={[
          { label: 'Select Category', value: '' },
          ...filteredCategories.map(c => ({ label: c.name, value: c.id }))
        ]}
      />

      <div className="flex items-center gap-3 pt-2">
        <input
          type="checkbox"
          id="recurring"
          checked={isRecurring}
          onChange={(e) => setIsRecurring(e.target.checked)}
          className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
        />
        <label htmlFor="recurring" className="text-sm font-medium text-stone-700 dark:text-stone-300">
          Recurring Transaction
        </label>
      </div>

      {isRecurring && (
        <Select
          label="Frequency"
          value={frequency}
          onChange={(val) => setFrequency(val as Frequency)}
          options={[
            { label: 'Daily', value: 'daily' },
            { label: 'Weekly', value: 'weekly' },
            { label: 'Monthly', value: 'monthly' },
            { label: 'Yearly', value: 'yearly' },
          ]}
        />
      )}

      <div className="pt-4 flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onSuccess}>Cancel</Button>
        <Button type="submit" isLoading={isSubmitting}>
          {isEditing ? 'Update Transaction' : 'Add Transaction'}
        </Button>
      </div>
    </form>
  );
};