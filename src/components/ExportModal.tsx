import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button, Input, Select } from './ui/Base';
import { Transaction, Category } from '../types';
import { downloadCSV, downloadPDF, formatCurrency, formatDate } from '../utils/helpers';
import { FileText, Download, Calendar } from 'lucide-react';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    transactions: Transaction[];
    categories: Category[];
}

type DateRangeOption = 'all' | 'this-month' | 'last-month' | 'custom';

export const ExportModal = ({ isOpen, onClose, transactions, categories }: ExportModalProps) => {
    const [rangeOption, setRangeOption] = useState<DateRangeOption>('this-month');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const getFilteredTransactions = () => {
        let filtered = [...transactions];
        const now = new Date();

        if (rangeOption === 'this-month') {
            const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
            filtered = filtered.filter(t => t.date.substring(0, 10) >= start && t.date.substring(0, 10) <= end);
        } else if (rangeOption === 'last-month') {
            const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
            const end = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
            filtered = filtered.filter(t => t.date.substring(0, 10) >= start && t.date.substring(0, 10) <= end);
        } else if (rangeOption === 'custom' && startDate && endDate) {
            filtered = filtered.filter(t => t.date.substring(0, 10) >= startDate && t.date.substring(0, 10) <= endDate);
        }

        // Sort by date descending
        return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    };

    const handleDownloadPDF = () => {
        const data = getFilteredTransactions();
        if (data.length === 0) {
            alert('No transactions found for the selected range.');
            return;
        }

        const headers = [['Date', 'Description', 'Category', 'Type', 'Amount']];
        const rows = data.map(t => [
            formatDate(t.date),
            t.description,
            categories.find(c => c.id === t.categoryId)?.name || 'Unknown',
            t.type.charAt(0).toUpperCase() + t.type.slice(1),
            formatCurrency(t.amount)
        ]);

        const title = `Transaction Report (${rangeOption === 'custom' ? `${startDate} to ${endDate}` : rangeOption.replace('-', ' ').toUpperCase()})`;
        downloadPDF(title, headers, rows, `transactions_${rangeOption}`);
        onClose();
    };

    const handleDownloadCSV = () => {
        const data = getFilteredTransactions();
        if (data.length === 0) {
            alert('No transactions found for the selected range.');
            return;
        }

        const csvData = data.map(t => ({
            Date: formatDate(t.date),
            Description: t.description,
            Amount: t.amount,
            Type: t.type,
            Category: categories.find(c => c.id === t.categoryId)?.name || 'Unknown'
        }));

        downloadCSV(csvData, `transactions_${rangeOption}`);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Export Transactions">
            <div className="space-y-6">
                <div className="space-y-3">
                    <label className="text-sm font-medium text-stone-700 dark:text-stone-300">Date Range</label>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { id: 'this-month', label: 'This Month' },
                            { id: 'last-month', label: 'Last Month' },
                            { id: 'all', label: 'All Time' },
                            { id: 'custom', label: 'Custom Range' },
                        ].map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => setRangeOption(opt.id as DateRangeOption)}
                                className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${rangeOption === opt.id
                                        ? 'bg-stone-900 text-white border-stone-900 dark:bg-stone-100 dark:text-black'
                                        : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400 dark:bg-stone-900 dark:text-stone-400 dark:border-stone-800'
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {rangeOption === 'custom' && (
                    <div className="grid grid-cols-2 gap-4 p-4 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-100 dark:border-stone-800 animate-in fade-in slide-in-from-top-2">
                        <Input
                            label="Start Date"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <Input
                            label="End Date"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                )}

                <div className="pt-4 flex gap-3">
                    <Button onClick={handleDownloadCSV} variant="outline" className="flex-1">
                        <Download size={18} className="mr-2" /> Download CSV
                    </Button>
                    <Button onClick={handleDownloadPDF} className="flex-1">
                        <FileText size={18} className="mr-2" /> Download PDF
                    </Button>
                </div>

                <p className="text-xs text-center text-stone-400">
                    {getFilteredTransactions().length} transaction(s) will be exported
                </p>
            </div>
        </Modal>
    );
};
