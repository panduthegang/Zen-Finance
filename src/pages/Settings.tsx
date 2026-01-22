import React, { useState } from 'react';
import { useAppStore } from '../store';
import { useAuth } from '../context/AuthContext';
import { Input, Button } from '../components/ui/Base';
import { Modal } from '../components/ui/Modal';
import { CategoryForm } from '../components/CategoryForm';
import { Category } from '../types';
import { formatCurrency, getCategoryIcon } from '../utils/helpers';
import { Edit2, Trash2, Plus, User as UserIcon, Tag } from 'lucide-react';
import { deleteCategory as deleteCategoryFromFirestore } from '../services/firestoreService';

export const SettingsPage = () => {
    const { user, categories } = useAppStore();
    const { currentUser, updateDisplayName } = useAuth();
    const [name, setName] = useState(user?.name || currentUser?.displayName || '');
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);

    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [categoryTab, setCategoryTab] = useState<'expense' | 'income'>('expense');

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsSavingProfile(true);
        setSaveMessage(null);

        try {
            await updateDisplayName(name.trim());
            setSaveMessage('Profile updated successfully!');
            setTimeout(() => setSaveMessage(null), 3000);
        } catch (error) {
            console.error('Error updating profile:', error);
            setSaveMessage('Failed to update profile. Please try again.');
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleEditCategory = (category: Category) => {
        setSelectedCategory(category);
        setIsCategoryModalOpen(true);
    };

    const handleAddCategory = () => {
        setSelectedCategory(null);
        setIsCategoryModalOpen(true);
    };

    const handleDeleteCategory = async (id: string) => {
        if (!currentUser) return;

        if (confirm('Are you sure you want to delete this category?')) {
            try {
                await deleteCategoryFromFirestore(currentUser.uid, id);
            } catch (error) {
                console.error('Error deleting category:', error);
                alert('Failed to delete category. Please try again.');
            }
        }
    };

    const filteredCategories = categories.filter(c => c.type === categoryTab);

    return (
        <div className="space-y-8 w-full">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-light tracking-tight text-stone-900 dark:text-stone-100">Settings</h1>
                <p className="text-stone-500 text-base">Manage your profile and application preferences</p>
            </div>

            {/* Profile Section */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-2">
                    <UserIcon className="text-stone-900 dark:text-stone-100" size={20} />
                    <h2 className="text-lg font-medium text-stone-900 dark:text-stone-100 uppercase tracking-wide">Profile</h2>
                </div>

                <form onSubmit={handleUpdateProfile} className="flex flex-col md:flex-row gap-6 items-end w-full">
                    <div className="w-full md:w-1/3">
                        <Input
                            label="Display Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="w-full md:w-1/3">
                        <Input
                            label="Email Address"
                            value={currentUser?.email || user?.email || ''}
                            disabled
                            className="bg-stone-50 dark:bg-stone-900 text-stone-500"
                        />
                    </div>
                    <div className="w-full md:w-auto flex flex-col gap-2">
                        <Button type="submit" isLoading={isSavingProfile} className="w-full md:w-auto">Save Changes</Button>
                        {saveMessage && (
                            <span className={`text-sm ${saveMessage.includes('Failed') ? 'text-red-500' : 'text-green-600'}`}>
                                {saveMessage}
                            </span>
                        )}
                    </div>
                </form>
            </section>

            {/* Categories Section */}
            <section className="space-y-6 pt-6">
                <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2">
                    <div className="flex items-center gap-2">
                        <Tag className="text-stone-900 dark:text-stone-100" size={20} />
                        <h2 className="text-lg font-medium text-stone-900 dark:text-stone-100 uppercase tracking-wide">Categories</h2>
                    </div>
                    <Button onClick={handleAddCategory} size="sm" variant="outline">
                        <Plus size={16} className="mr-2" /> Add Category
                    </Button>
                </div>

                <div className="w-full">
                    {/* Tabs */}
                    <div className="flex gap-1 mb-4 bg-stone-100 dark:bg-stone-900 p-1 rounded-xl w-full md:w-fit">
                        <button
                            onClick={() => setCategoryTab('expense')}
                            className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all ${categoryTab === 'expense' ? 'bg-white dark:bg-stone-800 shadow-sm text-stone-900 dark:text-white' : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'}`}
                        >
                            Expenses
                        </button>
                        <button
                            onClick={() => setCategoryTab('income')}
                            className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all ${categoryTab === 'income' ? 'bg-white dark:bg-stone-800 shadow-sm text-stone-900 dark:text-white' : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'}`}
                        >
                            Income
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredCategories.map((category) => {
                            const Icon = getCategoryIcon(category.icon);
                            return (
                                <div key={category.id} className="group relative flex items-center justify-between p-4 bg-white dark:bg-black border border-stone-200 dark:border-stone-800 rounded-xl hover:border-stone-400 dark:hover:border-stone-600 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-stone-50 dark:bg-stone-900 flex items-center justify-center text-stone-900 dark:text-stone-100">
                                            <Icon size={20} strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-stone-900 dark:text-stone-100">{category.name}</p>
                                            {category.type === 'expense' && category.budgetLimit ? (
                                                <p className="text-xs text-stone-500">
                                                    Limit: {formatCurrency(category.budgetLimit)}
                                                </p>
                                            ) : (
                                                <p className="text-xs text-stone-400 opacity-50">Standard</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEditCategory(category)}
                                            className="p-2 text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCategory(category.id)}
                                            className="p-2 text-stone-400 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            )
                        })}

                        <button
                            onClick={handleAddCategory}
                            className="flex items-center justify-center gap-2 p-4 border border-dashed border-stone-300 dark:border-stone-700 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:border-stone-400 dark:hover:border-stone-500 transition-all"
                        >
                            <Plus size={20} />
                            <span className="font-medium">Create New</span>
                        </button>
                    </div>
                </div>
            </section>

            <Modal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                title={selectedCategory ? 'Edit Category' : 'New Category'}
            >
                <CategoryForm
                    onSuccess={() => setIsCategoryModalOpen(false)}
                    initialData={selectedCategory}
                    defaultType={categoryTab}
                />
            </Modal>
        </div>
    );
};