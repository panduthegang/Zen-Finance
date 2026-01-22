import React, { useState } from 'react';
import { useAppStore } from '../store';
import { ProgressBar } from '../components/ui/Base';
import { formatCurrency, getCategoryIcon } from '../utils/helpers';
import { AlertCircle } from 'lucide-react';

export const BudgetsPage = () => {
    const { categories, transactions } = useAppStore();
    const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const expenseCategories = categories.filter(c => c.type === 'expense');
    const incomeCategories = categories.filter(c => c.type === 'income');

    return (
        <div className="space-y-8 w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between border-b border-stone-200 dark:border-stone-800 pb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-light tracking-tight text-stone-900 dark:text-stone-100">Monthly Budgets</h1>
                    <p className="text-stone-500 text-base mt-2">Monitor your spending limits and income goals</p>
                </div>

                {/* Tabs */}
                <div className="flex bg-stone-100 dark:bg-stone-900 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('expense')}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'expense' ? 'bg-white dark:bg-stone-800 shadow-sm text-stone-900 dark:text-white' : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'}`}
                    >
                        Expenses
                    </button>
                    <button
                        onClick={() => setActiveTab('income')}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'income' ? 'bg-white dark:bg-stone-800 shadow-sm text-stone-900 dark:text-white' : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'}`}
                    >
                        Income
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {(activeTab === 'expense' ? expenseCategories : incomeCategories).map(cat => {
                    const Icon = getCategoryIcon(cat.icon);
                    const amount = transactions
                        .filter(t => {
                            const d = new Date(t.date);
                            return d.getMonth() === currentMonth &&
                                d.getFullYear() === currentYear &&
                                t.categoryId === cat.id;
                        })
                        .reduce((acc, t) => acc + t.amount, 0);

                    if (activeTab === 'expense') {
                        // Expense View (with Budget Limits)
                        const limit = cat.budgetLimit || 0;
                        const percentage = limit > 0 ? (amount / limit) * 100 : 0;
                        const isOver = amount > limit;

                        return (
                            <div key={cat.id} className="bg-white dark:bg-black rounded-xl border border-stone-200 dark:border-stone-800 p-8 flex flex-col gap-4 shadow-sm hover:border-stone-300 dark:hover:border-stone-700 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-stone-100 dark:bg-stone-900 flex items-center justify-center text-stone-700 dark:text-stone-300">
                                            <Icon size={24} strokeWidth={1.5} />
                                        </div>
                                        <h3 className="text-xl font-medium text-stone-900 dark:text-stone-100">{cat.name}</h3>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xl font-mono text-stone-900 dark:text-stone-200">{formatCurrency(amount)}</span>
                                        <span className="text-stone-400 text-base font-mono mx-2">/</span>
                                        <span className="text-stone-500 text-base font-mono">{formatCurrency(limit)}</span>
                                    </div>
                                </div>

                                <div className="py-2">
                                    <ProgressBar value={amount} max={limit} />
                                </div>

                                <div className="flex justify-between text-sm font-medium">
                                    {isOver ? (
                                        <span className="text-red-500 flex items-center gap-2"><AlertCircle size={16} /> Over Budget</span>
                                    ) : (
                                        <span className="text-stone-500">{Math.round(percentage)}% Used</span>
                                    )}
                                    <span className="text-stone-500">
                                        {formatCurrency(Math.max(0, limit - amount))} Remaining
                                    </span>
                                </div>
                            </div>
                        )
                    } else {
                        // Income View (Simple Tracking)
                        return (
                            <div key={cat.id} className="bg-white dark:bg-black rounded-xl border border-stone-200 dark:border-stone-800 p-8 flex flex-col gap-4 shadow-sm hover:border-stone-300 dark:hover:border-stone-700 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-stone-100 dark:bg-stone-900 flex items-center justify-center text-stone-700 dark:text-stone-300">
                                            <Icon size={24} strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-medium text-stone-900 dark:text-stone-100">{cat.name}</h3>
                                            <p className="text-stone-500 text-sm">Income Source</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-mono text-stone-900 dark:text-stone-100">{formatCurrency(amount)}</span>
                                        <p className="text-stone-400 text-sm mt-1">earned this month</p>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                })}
            </div>
        </div>
    );
};