import React, { useMemo, useState } from 'react';
import { useAppStore } from '../store';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Select } from '../components/ui/Base';
import { Modal } from '../components/ui/Modal';
import { TransactionForm } from '../components/TransactionForm';
import { IncomeExpenseBarChart } from '../components/Charts';
import { formatCurrency, formatDate, getCategoryIcon } from '../utils/helpers';
import { Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const Dashboard = () => {
  const { transactions, user, categories } = useAppStore();
  const { currentUser } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [chartView, setChartView] = useState('week');

  // Get 5 most recent transactions sorted by date
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  // Compute Chart Data dynamically
  const chartData = useMemo(() => {
    const data = [];
    const today = new Date();

    if (chartView === 'week') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dayStr = d.toISOString().split('T')[0];

        const income = transactions
          .filter(t => t.type === 'income' && t.date.startsWith(dayStr))
          .reduce((sum, t) => sum + t.amount, 0);

        const expense = transactions
          .filter(t => t.type === 'expense' && t.date.startsWith(dayStr))
          .reduce((sum, t) => sum + t.amount, 0);

        data.push({
          name: d.toLocaleDateString('en-US', { weekday: 'short' }),
          income,
          expense
        });
      }
    } else {
      // Last 6 months
      for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const month = d.getMonth();
        const year = d.getFullYear();

        const income = transactions
          .filter(t => {
            const tDate = new Date(t.date);
            return t.type === 'income' && tDate.getMonth() === month && tDate.getFullYear() === year;
          })
          .reduce((sum, t) => sum + t.amount, 0);

        const expense = transactions
          .filter(t => {
            const tDate = new Date(t.date);
            return t.type === 'expense' && tDate.getMonth() === month && tDate.getFullYear() === year;
          })
          .reduce((sum, t) => sum + t.amount, 0);

        data.push({
          name: d.toLocaleDateString('en-US', { month: 'short' }),
          income,
          expense
        });
      }
    }
    return data;
  }, [transactions, chartView]);

  // Compute Metrics
  const metrics = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthTransactions = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const income = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);

    const expense = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);

    const balance = income - expense;

    return { income, expense, balance };
  }, [transactions]);

  return (
    <div className="space-y-8 w-full">
      {/* User Greeting */}
      <div className="space-y-1">
        <h2 className="text-xl md:text-2xl font-light text-stone-500 dark:text-stone-400">
          Hello, <span className="text-stone-900 dark:text-stone-100 font-normal">{user?.name || currentUser?.displayName || 'Friend'}</span>
        </h2>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 border-b border-stone-100 dark:border-stone-800 pb-8">
        <div>
          <h2 className="text-sm font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">Total Balance</h2>
          <h1 className="text-4xl md:text-6xl font-light text-stone-900 dark:text-stone-100 tracking-tight">
            {formatCurrency(metrics.balance)}
          </h1>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto text-base px-6 h-12">
          <Plus size={20} className="mr-2" /> New Entry
        </Button>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <span className="text-base text-stone-500 dark:text-stone-400 uppercase tracking-wide">Monthly Income</span>
            <div className="p-2 bg-stone-50 dark:bg-stone-900 rounded-full">
              <ArrowUpRight className="text-stone-900 dark:text-stone-100" size={24} />
            </div>
          </div>
          <div className="text-3xl font-light text-stone-900 dark:text-white">{formatCurrency(metrics.income)}</div>
        </Card>
        <Card className="flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <span className="text-base text-stone-500 dark:text-stone-400 uppercase tracking-wide">Monthly Expense</span>
            <div className="p-2 bg-stone-50 dark:bg-stone-900 rounded-full">
              <ArrowDownRight className="text-stone-900 dark:text-stone-100" size={24} />
            </div>
          </div>
          <div className="text-3xl font-light text-stone-900 dark:text-white">{formatCurrency(metrics.expense)}</div>
        </Card>
      </div>

      {/* Main Chart */}
      <Card className="min-h-[450px]">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <h3 className="text-xl font-light w-full sm:w-auto">Activity Analysis</h3>
          <div className="w-full sm:w-48">
            <Select
              options={[
                { label: 'Weekly View', value: 'week' },
                { label: 'Monthly View', value: 'month' }
              ]}
              value={chartView}
              onChange={setChartView}
            />
          </div>
        </div>
        <div className="h-[350px] w-full">
          <IncomeExpenseBarChart data={chartData} />
        </div>
      </Card>

      {/* Recent Transactions List */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-4">
          <h3 className="text-xl font-light">Recent History</h3>
          <Button variant="ghost" onClick={() => window.location.href = '/transactions'}>View All</Button>
        </div>

        <div className="space-y-3">
          {recentTransactions.map((t) => {
            const category = categories.find(c => c.id === t.categoryId);
            const Icon = getCategoryIcon(category?.icon);

            return (
              <div key={t.id} className="flex items-center justify-between py-5 px-4 bg-white dark:bg-stone-950 border border-stone-100 dark:border-stone-900 rounded-xl hover:border-stone-300 dark:hover:border-stone-700 transition-colors">
                <div className="flex items-center gap-6">
                  <div className="w-16 text-sm text-stone-500 font-mono">
                    {new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }).toUpperCase()}
                  </div>

                  {/* Category Icon */}
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-300">
                    <Icon size={18} />
                  </div>

                  <div>
                    <p className="text-lg font-medium text-stone-900 dark:text-stone-200">{t.description}</p>
                    <p className="text-xs text-stone-500">{category?.name}</p>
                  </div>
                </div>
                <span className={`text-lg font-mono ${t.type === 'income' ? 'text-stone-900 dark:text-white' : 'text-stone-500 dark:text-stone-400'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </span>
              </div>
            );
          })}
          {recentTransactions.length === 0 && (
            <div className="text-center py-12 text-stone-400 font-light">No transactions recorded.</div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="New Transaction"
      >
        <TransactionForm onSuccess={() => setIsAddModalOpen(false)} />
      </Modal>
    </div>
  );
};