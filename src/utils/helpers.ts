import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  Wallet, Briefcase, Home, Utensils, Car, Film, Zap, 
  ShoppingBag, Coffee, Gift, GraduationCap, Heart, 
  Music, Smartphone, Plane, Dumbbell, Dog, Hammer, 
  LayoutGrid, Shield, Tag
} from 'lucide-react';

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

export const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

// Map string names to Lucide Components
export const CATEGORY_ICONS: Record<string, any> = {
  'wallet': Wallet,
  'briefcase': Briefcase,
  'home': Home,
  'utensils': Utensils,
  'car': Car,
  'film': Film,
  'zap': Zap,
  'shopping-bag': ShoppingBag,
  'coffee': Coffee,
  'gift': Gift,
  'graduation-cap': GraduationCap,
  'heart': Heart,
  'music': Music,
  'smartphone': Smartphone,
  'plane': Plane,
  'dumbbell': Dumbbell,
  'dog': Dog,
  'hammer': Hammer,
  'shield': Shield,
  'tag': Tag,
  'default': LayoutGrid
};

export const getCategoryIcon = (iconName?: string) => {
  if (!iconName || !CATEGORY_ICONS[iconName]) return CATEGORY_ICONS['default'];
  return CATEGORY_ICONS[iconName];
};

export const downloadCSV = (data: any[], filename: string) => {
  const replacer = (_key: string, value: any) => (value === null ? '' : value);
  const header = Object.keys(data[0]);
  const csv = [
    header.join(','), // header row first
    ...data.map((row) =>
      header.map((fieldName) => JSON.stringify(row[fieldName], replacer)).join(',')
    ),
  ].join('\r\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

export const downloadPDF = (title: string, headers: string[][], data: (string | number)[][], filename: string) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.text(title, 14, 22);
  
  // Date
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
  
  // Table
  autoTable(doc, {
    head: headers,
    body: data,
    startY: 35,
    theme: 'grid',
    styles: { 
      font: 'helvetica', 
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: { 
      fillColor: [23, 23, 23], 
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    }
  });

  doc.save(`${filename}.pdf`);
};