import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  Tooltip,
  CartesianGrid
} from 'recharts';
import { useAppStore } from '../store';

interface ChartProps {
  data: any[];
}

export const IncomeExpenseBarChart = ({ data }: ChartProps) => {
   const { theme } = useAppStore();
   
   // Zen Monochrome Palette
   const barColorIncome = theme === 'dark' ? '#ffffff' : '#1c1917'; // White/Black
   const barColorExpense = theme === 'dark' ? '#525252' : '#a8a29e'; // Dark Grey / Light Grey
   const axisColor = theme === 'dark' ? '#525252' : '#a8a29e';
   const gridColor = theme === 'dark' ? '#262626' : '#e5e5e5';
   const tooltipBg = theme === 'dark' ? '#000000' : '#ffffff';
   const tooltipBorder = theme === 'dark' ? '#262626' : '#e5e5e5';
   const tooltipText = theme === 'dark' ? '#ffffff' : '#1c1917';

   return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} barGap={4}>
         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
         <XAxis 
            dataKey="name" 
            stroke={axisColor} 
            fontSize={11} 
            tickLine={false} 
            axisLine={false} 
            dy={10}
            tick={{ fill: axisColor }}
         />
         <YAxis 
            stroke={axisColor} 
            fontSize={11} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(value) => `₹${value/1000}k`}
            tick={{ fill: axisColor }}
         />
         <Tooltip 
            cursor={{fill: theme === 'dark' ? '#171717' : '#fafaf9'}}
            contentStyle={{ 
                backgroundColor: tooltipBg,
                borderRadius: '8px', 
                border: `1px solid ${tooltipBorder}`,
                boxShadow: 'none',
                color: tooltipText,
                fontSize: '12px'
            }}
            formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, '']}
         />
         <Bar 
            dataKey="income" 
            name="Income"
            fill={barColorIncome} 
            radius={[2, 2, 0, 0]} 
            barSize={12}
         />
         <Bar 
            dataKey="expense" 
            name="Expense"
            fill={barColorExpense} 
            radius={[2, 2, 0, 0]} 
            barSize={12}
         />
      </BarChart>
    </ResponsiveContainer>
   )
}