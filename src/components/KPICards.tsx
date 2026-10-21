import React from 'react';
import { MonthlyReportEntry, WasteLogEntry, CategoryAnalysisEntry } from '../types';
import { formatIDR, formatPercent } from '../utils/formatters';
import { TrendingUp, ShoppingBag, AlertTriangle, Calculator } from 'lucide-react';

interface KPICardsProps {
  monthlyData: MonthlyReportEntry[];
  wasteData: WasteLogEntry[];
  categoryData: CategoryAnalysisEntry[];
  selectedOutletFilter: string;
  selectedPeriodeFilter: string;
}

export const KPICards: React.FC<KPICardsProps> = ({
  monthlyData,
  wasteData,
  categoryData: _categoryData,
  selectedOutletFilter,
  selectedPeriodeFilter,
}) => {
  // Filter data based on filters if selected
  const filteredMonthly = monthlyData.filter((item) => {
    const matchOutlet = selectedOutletFilter === 'ALL' || item.outlet === selectedOutletFilter;
    const matchPeriod = selectedPeriodeFilter === 'ALL' || item.periode === selectedPeriodeFilter;
    return matchOutlet && matchPeriod;
  });

  const filteredWaste = wasteData.filter((item) => {
    const matchOutlet = selectedOutletFilter === 'ALL' || item.outlet === selectedOutletFilter;
    const matchPeriod = selectedPeriodeFilter === 'ALL' || item.periode === selectedPeriodeFilter;
    return matchOutlet && matchPeriod;
  });

  const totalSalesOutlet = filteredMonthly.reduce((acc, curr) => acc + curr.totalSalesOutlet, 0);
  const totalSalesFnB = filteredMonthly.reduce((acc, curr) => acc + curr.salesProfitFnB, 0);
  const totalPemakaianFnB = filteredMonthly.reduce((acc, curr) => acc + curr.pemakaianFnB, 0);
  const totalHPP = filteredMonthly.reduce((acc, curr) => acc + curr.totalHPP, 0);
  const totalPembelian = filteredMonthly.reduce((acc, curr) => acc + curr.pembelianBahanBaku, 0);

  const totalNilaiWaste = filteredWaste.reduce((acc, curr) => acc + curr.nilaiWaste, 0);
  const openWasteCount = filteredWaste.filter((w) => w.status === 'OPEN').length;

  const hppRatio = totalSalesOutlet > 0 ? (totalHPP / totalSalesOutlet) * 100 : 0;
  const wasteRatio = totalPemakaianFnB > 0 ? (totalNilaiWaste / totalPemakaianFnB) * 100 : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Total Sales */}
      <div className="bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium uppercase tracking-wider">Total Sales Outlet</span>
          <TrendingUp className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
          {formatIDR(totalSalesOutlet)}
        </div>
        <div className="mt-1 text-xs text-slate-500">
          <span>Sales FnB: {formatIDR(totalSalesFnB)}</span>
        </div>
      </div>

      {/* 2. Total HPP */}
      <div className="bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium uppercase tracking-wider">Total HPP (COGS)</span>
          <Calculator className="w-4 h-4 text-blue-600" />
        </div>
        <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
          {formatIDR(totalHPP)}
        </div>
        <div className="mt-1 text-xs text-slate-500 flex items-center gap-1.5">
          <span className="font-semibold text-blue-700">{hppRatio.toFixed(1)}%</span>
          <span>dari Sales Outlet</span>
        </div>
      </div>

      {/* 3. Total Pembelian Bahan Baku */}
      <div className="bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium uppercase tracking-wider">Pembelian Bahan Baku</span>
          <ShoppingBag className="w-4 h-4 text-amber-600" />
        </div>
        <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
          {formatIDR(totalPembelian)}
        </div>
        <div className="mt-1 text-xs text-slate-500 flex items-center gap-1.5">
          <span>Pemakaian: {formatIDR(totalPemakaianFnB)}</span>
        </div>
      </div>

      {/* 4. Total Nilai Waste */}
      <div className="bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium uppercase tracking-wider">Total Nilai Waste</span>
          <AlertTriangle className="w-4 h-4 text-red-600" />
        </div>
        <div className="text-xl font-bold text-red-600 font-mono tabular-nums">
          {formatIDR(totalNilaiWaste)}
        </div>
        <div className="mt-1 text-xs text-slate-500 flex items-center gap-2">
          <span>{formatPercent(totalNilaiWaste, totalPemakaianFnB)} dari pemakaian</span>
          <span aria-hidden="true">·</span>
          <span className="text-red-600 font-medium">{openWasteCount} Open</span>
        </div>
      </div>
    </div>
  );
};
