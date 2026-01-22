import {
    collection,
    doc,
    setDoc,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp,
    Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Transaction, Category, User } from '../types';

// Default categories for new users
const defaultCategories: Omit<Category, 'id'>[] = [
    { name: 'Salary', color: '#10b981', type: 'income', icon: 'wallet' },
    { name: 'Freelance', color: '#34d399', type: 'income', icon: 'briefcase' },
    { name: 'Housing', color: '#f43f5e', type: 'expense', budgetLimit: 30000, icon: 'home' },
    { name: 'Food', color: '#f59e0b', type: 'expense', budgetLimit: 15000, icon: 'utensils' },
    { name: 'Transport', color: '#3b82f6', type: 'expense', budgetLimit: 5000, icon: 'car' },
    { name: 'Entertainment', color: '#8b5cf6', type: 'expense', budgetLimit: 5000, icon: 'film' },
    { name: 'Utilities', color: '#64748b', type: 'expense', budgetLimit: 4000, icon: 'zap' },
];

// ==================== USER PROFILE ====================

export const createUserProfile = async (
    userId: string,
    displayName: string,
    email: string
): Promise<void> => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        // Create new user profile
        await setDoc(userRef, {
            displayName,
            email,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        // Initialize default categories for new user
        await initializeDefaultCategories(userId);
    } else {
        // Update last login
        await updateDoc(userRef, {
            updatedAt: serverTimestamp(),
        });
    }
};

export const getUserProfile = async (userId: string): Promise<User | null> => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        const data = userSnap.data();
        return {
            uid: userId,
            name: data.displayName || '',
            email: data.email || '',
        };
    }
    return null;
};

export const updateUserProfile = async (
    userId: string,
    updates: { displayName?: string }
): Promise<void> => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp(),
    });
};

// ==================== TRANSACTIONS ====================

export const addTransaction = async (
    userId: string,
    transaction: Omit<Transaction, 'id'>
): Promise<string> => {
    const transactionsRef = collection(db, 'users', userId, 'transactions');
    const docRef = await addDoc(transactionsRef, {
        ...transaction,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
};

export const updateTransaction = async (
    userId: string,
    transactionId: string,
    updates: Partial<Transaction>
): Promise<void> => {
    const transactionRef = doc(db, 'users', userId, 'transactions', transactionId);
    await updateDoc(transactionRef, {
        ...updates,
        updatedAt: serverTimestamp(),
    });
};

export const deleteTransaction = async (
    userId: string,
    transactionId: string
): Promise<void> => {
    const transactionRef = doc(db, 'users', userId, 'transactions', transactionId);
    await deleteDoc(transactionRef);
};

export const subscribeToTransactions = (
    userId: string,
    callback: (transactions: Transaction[]) => void
): Unsubscribe => {
    const transactionsRef = collection(db, 'users', userId, 'transactions');
    const q = query(transactionsRef, orderBy('date', 'desc'));

    return onSnapshot(q, (snapshot) => {
        const transactions: Transaction[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Transaction[];
        callback(transactions);
    });
};

// ==================== CATEGORIES ====================

const initializeDefaultCategories = async (userId: string): Promise<void> => {
    const categoriesRef = collection(db, 'users', userId, 'categories');

    for (const category of defaultCategories) {
        await addDoc(categoriesRef, {
            ...category,
            createdAt: serverTimestamp(),
        });
    }
};

export const addCategory = async (
    userId: string,
    category: Omit<Category, 'id'>
): Promise<string> => {
    const categoriesRef = collection(db, 'users', userId, 'categories');
    const docRef = await addDoc(categoriesRef, {
        ...category,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
};

export const updateCategory = async (
    userId: string,
    categoryId: string,
    updates: Partial<Category>
): Promise<void> => {
    const categoryRef = doc(db, 'users', userId, 'categories', categoryId);
    await updateDoc(categoryRef, {
        ...updates,
        updatedAt: serverTimestamp(),
    });
};

export const deleteCategory = async (
    userId: string,
    categoryId: string
): Promise<void> => {
    const categoryRef = doc(db, 'users', userId, 'categories', categoryId);
    await deleteDoc(categoryRef);
};

export const subscribeToCategories = (
    userId: string,
    callback: (categories: Category[]) => void
): Unsubscribe => {
    const categoriesRef = collection(db, 'users', userId, 'categories');

    return onSnapshot(categoriesRef, (snapshot) => {
        const categories: Category[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Category[];
        callback(categories);
    });
};

// ==================== REAL-TIME LISTENERS MANAGER ====================

export const subscribeToUserData = (
    userId: string,
    onTransactionsChange: (transactions: Transaction[]) => void,
    onCategoriesChange: (categories: Category[]) => void
): (() => void) => {
    const unsubTransactions = subscribeToTransactions(userId, onTransactionsChange);
    const unsubCategories = subscribeToCategories(userId, onCategoriesChange);

    // Return cleanup function
    return () => {
        unsubTransactions();
        unsubCategories();
    };
};
