import { useState, useMemo } from 'react';
import { useAppStore } from '../store';
import { useAuth } from '../context/AuthContext';
import { Card, Input, Select, Button } from '../components/ui/Base';
import { Modal } from '../components/ui/Modal';
import { TransactionForm } from '../components/TransactionForm';
import { ExportModal } from '../components/ExportModal';  // Import ExportModal
import { formatCurrency, formatDate } from '../utils/helpers';
import { Search, Trash2, Calendar, X, Filter, ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import { deleteTransaction as deleteTransactionFromFirestore } from '../services/firestoreService';

const ITEMS_PER_PAGE = 10;

export const TransactionsPage = () => {
  const { transactions, categories } = useAppStore();
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false); // New state
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Derive available months from transactions
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    transactions.forEach(t => {
      months.add(t.date.substring(0, 7)); // YYYY-MM
    });
    return Array.from(months).sort().reverse().map(m => {
      const [y, month] = m.split('-');
      const date = new Date(parseInt(y), parseInt(month) - 1);
      return {
        value: m,
        label: date.toLocaleString('default', { month: 'long', year: 'numeric' })
      };
    });
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => {
        const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || t.type === filterType;
        const matchesCategory = filterCategory === 'all' || t.categoryId === filterCategory;

        let matchesDate = true;
        const tDate = t.date.substring(0, 10);
        const tMonth = t.date.substring(0, 7);

        if (startDate && endDate) {
          matchesDate = tDate >= startDate && tDate <= endDate;
        } else if (filterMonth !== 'all') {
          matchesDate = tMonth === filterMonth;
        }

        return matchesSearch && matchesType && matchesCategory && matchesDate;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchTerm, filterType, filterCategory, filterMonth, startDate, endDate]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, filterCategory, filterMonth, startDate, endDate]);

  const clearDateFilters = () => {
    setStartDate('');
    setEndDate('');
    setFilterMonth('all');
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="space-y-8 w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-stone-900 dark:text-stone-100">Transactions</h1>
          <p className="text-stone-500 text-base mt-2">{filteredTransactions.length} entries found</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none" onClick={() => setIsExportModalOpen(true)}>
            <Upload size={18} className="mr-2" /> Export
          </Button>
          <Button className="flex-1 md:flex-none" onClick={() => setIsAddModalOpen(true)}>+ Add</Button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
            <Input
              placeholder="Search by description..."
              className="pl-10 h-12 text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)} className={`h-12 w-12 ${showFilters ? "bg-stone-100 dark:bg-stone-800" : ""}`}>
            <Filter size={20} />
          </Button>
        </div>

        {showFilters && (
          <Card className="animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Select
                label="Period"
                options={[{ label: 'All Time', value: 'all' }, ...availableMonths]}
                value={filterMonth}
                onChange={(val) => { setFilterMonth(val); setStartDate(''); setEndDate(''); }}
              />
              <Select
                label="Type"
                options={[{ label: 'All Types', value: 'all' }, { label: 'Income', value: 'income' }, { label: 'Expense', value: 'expense' }]}
                value={filterType}
                onChange={setFilterType}
              />
              <Select
                label="Category"
                options={[{ label: 'All Categories', value: 'all' }, ...categories.map(c => ({ label: c.name, value: c.id }))]}
                value={filterCategory}
                onChange={setFilterCategory}
              />
              <div className="flex items-end">
                {(startDate || endDate || filterMonth !== 'all' || filterType !== 'all' || filterCategory !== 'all') && (
                  <Button variant="ghost" size="md" onClick={() => { clearDateFilters(); setFilterType('all'); setFilterCategory('all'); }} className="w-full text-stone-500">
                    <X size={16} className="mr-2" /> Reset Filters
                  </Button>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Responsive Table / List View */}
      <Card className="p-0 overflow-hidden border-0 bg-transparent dark:bg-transparent shadow-none">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto bg-white dark:bg-black rounded-xl border border-stone-200 dark:border-stone-800">
          <table className="w-full text-left">
            <thead className="bg-stone-50 dark:bg-stone-900/50">
              <tr>
                <th className="py-4 px-6 font-medium text-stone-500 text-sm uppercase tracking-wider">Date</th>
                <th className="py-4 px-6 font-medium text-stone-900 dark:text-stone-100 text-sm uppercase tracking-wider">Description</th>
                <th className="py-4 px-6 font-medium text-stone-500 text-sm uppercase tracking-wider">Category</th>
                <th className="py-4 px-6 font-medium text-stone-500 text-sm uppercase tracking-wider text-right">Amount</th>
                <th className="py-4 px-6 font-medium text-stone-500 text-sm uppercase tracking-wider text-center w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {paginatedTransactions.map((t) => {
                const category = categories.find(c => c.id === t.categoryId);
                return (
                  <tr key={t.id} className="group hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors">
                    <td className="py-4 px-6 text-stone-600 dark:text-stone-400 font-mono text-sm whitespace-nowrap">{formatDate(t.date)}</td>
                    <td className="py-4 px-6 font-medium text-stone-900 dark:text-stone-100 text-base">{t.description}</td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800 px-3 py-1 rounded-full whitespace-nowrap">
                        {category?.name}
                      </span>
                    </td>
                    <td className={`py-4 px-6 text-right font-mono text-base ${t.type === 'income' ? 'text-stone-900 dark:text-white' : 'text-stone-500 dark:text-stone-400'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => currentUser && deleteTransactionFromFirestore(currentUser.uid, t.id)}
                        className="p-2 text-stone-400 hover:text-red-500 rounded transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {paginatedTransactions.map((t) => {
            const category = categories.find(c => c.id === t.categoryId);
            return (
              <div key={t.id} className="bg-white dark:bg-black p-5 rounded-xl border border-stone-200 dark:border-stone-800 flex flex-col gap-3 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-lg text-stone-900 dark:text-stone-100">{t.description}</div>
                    <div className="text-sm text-stone-500 mt-1 font-mono">{formatDate(t.date)}</div>
                  </div>
                  <div className={`font-mono text-lg ${t.type === 'income' ? 'text-stone-900 dark:text-white' : 'text-stone-500 dark:text-stone-400'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-stone-100 dark:border-stone-900">
                  <span className="text-sm text-stone-600 dark:text-stone-400 px-2.5 py-1 rounded border border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-900">
                    {category?.name}
                  </span>
                  <button
                    onClick={() => currentUser && deleteTransactionFromFirestore(currentUser.uid, t.id)}
                    className="text-stone-400 hover:text-red-500 p-2"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {filteredTransactions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-stone-400">
            <Calendar className="h-16 w-16 mb-4 opacity-20" />
            <p className="text-lg">No transactions found</p>
            <p className="text-sm mt-2">Adjust filters or add a new transaction.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-black border-t border-stone-200 dark:border-stone-800 rounded-b-xl mt-0 md:mt-0">
            <div className="text-sm text-stone-500">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={18} />
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                        ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-black'
                        : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </Card>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="New Transaction"
      >
        <TransactionForm onSuccess={() => setIsAddModalOpen(false)} />
      </Modal>

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        transactions={transactions}
        categories={categories}
      />
    </div>
  );
};