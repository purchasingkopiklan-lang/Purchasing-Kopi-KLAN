import React, { useState, useEffect } from 'react';
import {
  InputTargetSheet,
  MonthlyReportEntry,
  CategoryAnalysisEntry,
  WasteLogEntry,
  WasteUnit,
  WasteStatus,
  WastePIC,
  WasteCause,
  ActiveSheetTab
} from '../types';
import {
  INITIAL_OUTLETS,
  INITIAL_CATEGORIES,
  INITIAL_PERIODS,
  INITIAL_UNITS,
  INITIAL_CAUSES,
  INITIAL_PICS
} from '../data/initialData';
import { formatIDR, getPeriodFromDate, parseNumber } from '../utils/formatters';
import {
  Calendar,
  Building2,
  DollarSign,
  Layers,
  Trash2,
  CheckCircle2,
  TableProperties,
  ArrowRight
} from 'lucide-react';

interface DynamicInputFormProps {
  onAddMonthly: (entry: Omit<MonthlyReportEntry, 'id'>) => void;
  onAddCategory: (entry: Omit<CategoryAnalysisEntry, 'id'>) => void;
  onAddWaste: (entry: Omit<WasteLogEntry, 'id'>) => void;
  onAddCategoryBatch?: (entries: Omit<CategoryAnalysisEntry, 'id'>[]) => void;
  onNavigateToSheet: (tab: ActiveSheetTab) => void;
  defaultTargetSheet?: InputTargetSheet;
  monthlyData?: MonthlyReportEntry[];
  categoryData?: CategoryAnalysisEntry[];
  wasteData?: WasteLogEntry[];
  onDeleteMonthly?: (id: string) => void;
  onDeleteCategory?: (id: string) => void;
  onDeleteWaste?: (id: string) => void;
}

export const DynamicInputForm: React.FC<DynamicInputFormProps> = ({
  onAddMonthly,
  onAddCategory,
  onAddWaste,
  onAddCategoryBatch,
  onNavigateToSheet,
  defaultTargetSheet = 'bulanan',
  monthlyData = [],
  categoryData = [],
  wasteData = [],
  onDeleteMonthly,
  onDeleteCategory,
  onDeleteWaste
}) => {
  const [targetSheet, setTargetSheet] = useState<InputTargetSheet>(defaultTargetSheet);
  const [successToast, setSuccessToast] = useState<{ message: string; target: InputTargetSheet } | null>(null);

  // --- State for Sheet Bulanan ---
  const [bulananPeriode, setBulananPeriode] = useState('Sep-2026');
  const [bulananOutlet, setBulananOutlet] = useState('KOPI KLAN CIHEULEUT');
  const [salesProfitFnB, setSalesProfitFnB] = useState<number | ''>(575170585);
  const [totalSalesOutlet, setTotalSalesOutlet] = useState<number | ''>(584110154);
  const [pemakaianFnB, setPemakaianFnB] = useState<number | ''>(220189658);
  const [hppNonBahanBaku, setHppNonBahanBaku] = useState<number | ''>(18273627);
  const [pembelianBahanBaku, setPembelianBahanBaku] = useState<number | ''>(235521653);
  const [bulananNotes, setBulananNotes] = useState('');

  // Auto-calculated Total HPP
  const calculatedTotalHPP = (Number(pemakaianFnB) || 0) + (Number(hppNonBahanBaku) || 0);

  // --- State for Sheet Analisa Kategori ---
  const [catMode, setCatMode] = useState<'single' | 'batch'>('single');
  const [catPeriode, setCatPeriode] = useState('Sep-2026');
  const [catOutlet, setCatOutlet] = useState('KOPI KLAN CIHEULEUT');
  const [kategoriName, setKategoriName] = useState('Pastry');
  const [salesKategori, setSalesKategori] = useState<number | ''>(86450000);
  const [cogsPenggunaan, setCogsPenggunaan] = useState<number | ''>(31200000);
  const [catPembelian, setCatPembelian] = useState<number | ''>(34100000);
  const [catWaste, setCatWaste] = useState<number | ''>(39538);

  // Batch categories state
  const [batchRows, setBatchRows] = useState<Array<{
    kategori: string;
    salesKategori: number;
    cogsPenggunaan: number;
    pembelian: number;
    waste: number;
  }>>([
    { kategori: 'Coffee', salesKategori: 215400000, cogsPenggunaan: 78500000, pembelian: 82000000, waste: 145000 },
    { kategori: 'Milk & Dairy', salesKategori: 124500000, cogsPenggunaan: 49800000, pembelian: 51200000, waste: 168000 },
    { kategori: 'Pastry', salesKategori: 86450000, cogsPenggunaan: 31200000, pembelian: 34100000, waste: 39538 },
    { kategori: 'Food / Kitchen', salesKategori: 112800000, cogsPenggunaan: 46200000, pembelian: 48900000, waste: 95000 },
    { kategori: 'Packaging', salesKategori: 36020585, cogsPenggunaan: 14489658, pembelian: 19321653, waste: 45000 }
  ]);

  // --- State for Sheet Log Waste ---
  const [wasteTanggal, setWasteTanggal] = useState('2026-09-30');
  const [wastePeriode, setWastePeriode] = useState('Sep-2026');
  const [wasteOutlet, setWasteOutlet] = useState('KOPI KLAN CIHEULEUT');
  const [wasteKategori, setWasteKategori] = useState('Pastry');
  const [itemBahanBaku, setItemBahanBaku] = useState('Basque Burnt Cheesecake');
  const [wasteSatuan, setWasteSatuan] = useState<WasteUnit>('PCS');
  const [qtyWaste, setQtyWaste] = useState<number | ''>(2.0);
  const [hargaUnit, setHargaUnit] = useState<number | ''>(19769);
  const [penyebab, setPenyebab] = useState<WasteCause>('Spillage');
  const [tindakanKoreksi, setTindakanKoreksi] = useState('');
  const [pic, setPic] = useState<WastePIC>('BAR');
  const [status, setStatus] = useState<WasteStatus>('OPEN');

  // Auto-calculated Nilai Waste
  const calculatedNilaiWaste = (Number(qtyWaste) || 0) * (Number(hargaUnit) || 0);

  // Sync waste period when date changes
  useEffect(() => {
    if (wasteTanggal) {
      setWastePeriode(getPeriodFromDate(wasteTanggal));
    }
  }, [wasteTanggal]);

  // Auto-hide toast after 4s
  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  const handleSubmitBulanan = (e: React.FormEvent) => {
    e.preventDefault();
    onAddMonthly({
      periode: bulananPeriode,
      outlet: bulananOutlet,
      salesProfitFnB: Number(salesProfitFnB) || 0,
      totalSalesOutlet: Number(totalSalesOutlet) || 0,
      pemakaianFnB: Number(pemakaianFnB) || 0,
      hppNonBahanBaku: Number(hppNonBahanBaku) || 0,
      totalHPP: calculatedTotalHPP,
      pembelianBahanBaku: Number(pembelianBahanBaku) || 0,
      notes: bulananNotes
    });
    setSuccessToast({
      message: `Data Bulanan Periode ${bulananPeriode} Outlet ${bulananOutlet} berhasil disimpan!`,
      target: 'bulanan'
    });
  };

  const handleSubmitCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (catMode === 'single') {
      onAddCategory({
        periode: catPeriode,
        outlet: catOutlet,
        kategori: kategoriName,
        salesKategori: Number(salesKategori) || 0,
        cogsPenggunaan: Number(cogsPenggunaan) || 0,
        pembelian: Number(catPembelian) || 0,
        waste: Number(catWaste) || 0
      });
      setSuccessToast({
        message: `Analisa Kategori ${kategoriName} (${catOutlet} - ${catPeriode}) berhasil disimpan!`,
        target: 'analisa_kategori'
      });
    } else if (onAddCategoryBatch) {
      const batchEntries = batchRows.map((r) => ({
        periode: catPeriode,
        outlet: catOutlet,
        kategori: r.kategori,
        salesKategori: r.salesKategori,
        cogsPenggunaan: r.cogsPenggunaan,
        pembelian: r.pembelian,
        waste: r.waste
      }));
      onAddCategoryBatch(batchEntries);
      setSuccessToast({
        message: `Batch ${batchRows.length} kategori untuk ${catOutlet} (${catPeriode}) berhasil disimpan!`,
        target: 'analisa_kategori'
      });
    }
  };

  const handleSubmitWaste = (e: React.FormEvent) => {
    e.preventDefault();
    onAddWaste({
      tanggal: wasteTanggal,
      periode: wastePeriode,
      outlet: wasteOutlet,
      kategori: wasteKategori,
      itemBahanBaku,
      satuan: wasteSatuan,
      qtyWaste: Number(qtyWaste) || 0,
      hargaUnit: Number(hargaUnit) || 0,
      nilaiWaste: calculatedNilaiWaste,
      penyebab,
      tindakanKoreksi,
      pic,
      status
    });
    setSuccessToast({
      message: `Log Waste "${itemBahanBaku}" (${formatIDR(calculatedNilaiWaste)}) berhasil dicatat!`,
      target: 'log_waste'
    });
    // Reset item specific fields for next quick input
    setItemBahanBaku('');
    setQtyWaste('');
    setTindakanKoreksi('');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header bar with dynamic target selector */}
      <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Formulir Entri Data Dinamis</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pilih target sheet yang dituju. Kolom berlatar kuning merupakan input utama sesuai format Excel.
            </p>
          </div>

          {/* Target Sheet Segmented Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-lg shrink-0">
            <button
              type="button"
              onClick={() => setTargetSheet('bulanan')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                targetSheet === 'bulanan'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/50'
              }`}
            >
              Sheet Bulanan
            </button>
            <button
              type="button"
              onClick={() => setTargetSheet('analisa_kategori')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                targetSheet === 'analisa_kategori'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/50'
              }`}
            >
              Analisa Kategori
            </button>
            <button
              type="button"
              onClick={() => setTargetSheet('log_waste')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                targetSheet === 'log_waste'
                  ? 'bg-red-800 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/50'
              }`}
            >
              Sheet Log Waste
            </button>
          </div>
        </div>

        {/* Success toast notification */}
        {successToast && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-800 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{successToast.message}</span>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToSheet(successToast.target as ActiveSheetTab)}
              className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-900 underline whitespace-nowrap cursor-pointer"
            >
              <span>Lihat di Sheet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* FORM CONTENT CONTAINER */}
      <div className="p-4 sm:p-6">
        {/* ========================================================= */}
        {/* FORM 1: SHEET BULANAN                                      */}
        {/* ========================================================= */}
        {targetSheet === 'bulanan' && (
          <form onSubmit={handleSubmitBulanan} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Periode */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Periode <span className="text-amber-600 font-normal">(Kuning)</span>
                </label>
                <div className="relative">
                  <select
                    value={bulananPeriode}
                    onChange={(e) => setBulananPeriode(e.target.value)}
                    className="w-full h-10 px-3 py-2 text-sm bg-amber-50/70 border border-amber-300 focus:border-amber-500 rounded-lg font-medium text-slate-900 focus:outline-none"
                    required
                  >
                    {INITIAL_PERIODS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Outlet */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Outlet <span className="text-amber-600 font-normal">(Kuning)</span>
                </label>
                <div className="relative">
                  <select
                    value={bulananOutlet}
                    onChange={(e) => setBulananOutlet(e.target.value)}
                    className="w-full h-10 px-3 py-2 text-sm bg-amber-50/70 border border-amber-300 focus:border-amber-500 rounded-lg font-medium text-slate-900 focus:outline-none"
                    required
                  >
                    {INITIAL_OUTLETS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sales Profit FnB */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sales Profit FnB <span className="text-amber-600 font-normal">(Kuning)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-medium">Rp</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={salesProfitFnB}
                    onChange={(e) => setSalesProfitFnB(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="396176414"
                    className="w-full h-10 pl-9 pr-3 py-2 text-sm bg-amber-50/70 border border-amber-300 focus:border-amber-500 rounded-lg font-mono tabular-nums text-slate-900 focus:outline-none"
                    required
                  />
                </div>
                <div className="text-[11px] text-slate-500 mt-1 font-mono">
                  {formatIDR(Number(salesProfitFnB) || 0)}
                </div>
              </div>

              {/* Total Sales Outlet */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Total Sales Outlet <span className="text-amber-600 font-normal">(Kuning)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-medium">Rp</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={totalSalesOutlet}
                    onChange={(e) => setTotalSalesOutlet(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="434887864"
                    className="w-full h-10 pl-9 pr-3 py-2 text-sm bg-amber-50/70 border border-amber-300 focus:border-amber-500 rounded-lg font-mono tabular-nums text-slate-900 focus:outline-none"
                    required
                  />
                </div>
                <div className="text-[11px] text-slate-500 mt-1 font-mono">
                  {formatIDR(Number(totalSalesOutlet) || 0)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Pemakaian FnB */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pemakaian FnB <span className="text-amber-600 font-normal">(Kuning)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-medium">Rp</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={pemakaianFnB}
                    onChange={(e) => setPemakaianFnB(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="144963842"
                    className="w-full h-10 pl-9 pr-3 py-2 text-sm bg-amber-50/70 border border-amber-300 focus:border-amber-500 rounded-lg font-mono tabular-nums text-slate-900 focus:outline-none"
                    required
                  />
                </div>
                <div className="text-[11px] text-slate-500 mt-1 font-mono">
                  {formatIDR(Number(pemakaianFnB) || 0)}
                </div>
              </div>

              {/* HPP Non-Bahan Baku */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  HPP Non-Bahan Baku <span className="text-amber-600 font-normal">(Kuning)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-medium">Rp</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={hppNonBahanBaku}
                    onChange={(e) => setHppNonBahanBaku(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="9810481"
                    className="w-full h-10 pl-9 pr-3 py-2 text-sm bg-amber-50/70 border border-amber-300 focus:border-amber-500 rounded-lg font-mono tabular-nums text-slate-900 focus:outline-none"
                    required
                  />
                </div>
                <div className="text-[11px] text-slate-500 mt-1 font-mono">
                  {formatIDR(Number(hppNonBahanBaku) || 0)}
                </div>
              </div>

              {/* Total HPP (Auto-calculated - Light Blue) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-blue-900">
                    Total HPP (Otomatis)
                  </label>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-mono">
                    E + F
                  </span>
                </div>
                <div className="w-full h-10 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between font-mono text-sm font-bold text-blue-950 tabular-nums">
                  <span>{formatIDR(calculatedTotalHPP)}</span>
                </div>
                <div className="text-[11px] text-blue-700 mt-1 font-medium">
                  {totalSalesOutlet
                    ? `${((calculatedTotalHPP / Number(totalSalesOutlet)) * 100).toFixed(2)}% dari total sales`
                    : '0%'}
                </div>
              </div>

              {/* Pembelian Bahan Baku */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pembelian Bahan Baku <span className="text-amber-600 font-normal">(Kuning)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-medium">Rp</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={pembelianBahanBaku}
                    onChange={(e) => setPembelianBahanBaku(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="148410477"
                    className="w-full h-10 pl-9 pr-3 py-2 text-sm bg-amber-50/70 border border-amber-300 focus:border-amber-500 rounded-lg font-mono tabular-nums text-slate-900 focus:outline-none"
                    required
                  />
                </div>
                <div className="text-[11px] text-slate-500 mt-1 font-mono">
                  {formatIDR(Number(pembelianBahanBaku) || 0)}
                </div>
              </div>
            </div>

            {/* Live Excel Row Preview */}
            <div className="p-3 bg-slate-900 rounded-lg text-white">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-semibold flex items-center gap-1.5">
                  <TableProperties className="w-3.5 h-3.5 text-blue-400" />
                  Preview Baris Sheet Bulanan (Excel Format)
                </span>
                <span className="text-[11px]">Sesuai Kolom A - H</span>
              </div>
              <div className="overflow-x-auto text-xs font-mono">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400 text-[11px]">
                      <th className="py-1 px-2 font-normal">A: Periode</th>
                      <th className="py-1 px-2 font-normal">B: Outlet</th>
                      <th className="py-1 px-2 font-normal">C: Sales FnB</th>
                      <th className="py-1 px-2 font-normal">D: Total Sales</th>
                      <th className="py-1 px-2 font-normal">E: Pemakaian FnB</th>
                      <th className="py-1 px-2 font-normal">F: Non-BB</th>
                      <th className="py-1 px-2 font-normal text-blue-300">G: Total HPP</th>
                      <th className="py-1 px-2 font-normal">H: Pembelian</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="text-slate-200">
                      <td className="py-1.5 px-2 bg-amber-500/10 text-amber-300 font-semibold">{bulananPeriode}</td>
                      <td className="py-1.5 px-2 bg-amber-500/10 text-amber-300">{bulananOutlet}</td>
                      <td className="py-1.5 px-2 bg-amber-500/10">{formatIDR(Number(salesProfitFnB) || 0)}</td>
                      <td className="py-1.5 px-2 bg-amber-500/10">{formatIDR(Number(totalSalesOutlet) || 0)}</td>
                      <td className="py-1.5 px-2 bg-amber-500/10">{formatIDR(Number(pemakaianFnB) || 0)}</td>
                      <td className="py-1.5 px-2 bg-amber-500/10">{formatIDR(Number(hppNonBahanBaku) || 0)}</td>
                      <td className="py-1.5 px-2 bg-blue-900/60 text-blue-200 font-bold">{formatIDR(calculatedTotalHPP)}</td>
                      <td className="py-1.5 px-2 bg-amber-500/10">{formatIDR(Number(pembelianBahanBaku) || 0)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Simpan ke Sheet Bulanan
              </button>
            </div>
          </form>
        )}

        {/* ========================================================= */}
        {/* FORM 2: SHEET ANALISA KATEGORI                             */}
        {/* ========================================================= */}
        {targetSheet === 'analisa_kategori' && (
          <form onSubmit={handleSubmitCategory} className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-4">
                {/* Periode */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700">Periode:</span>
                  <select
                    value={catPeriode}
                    onChange={(e) => setCatPeriode(e.target.value)}
                    className="h-8 px-2.5 text-xs bg-amber-50/70 border border-amber-300 rounded-md font-medium text-slate-900"
                  >
                    {INITIAL_PERIODS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* Outlet */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700">Outlet:</span>
                  <select
                    value={catOutlet}
                    onChange={(e) => setCatOutlet(e.target.value)}
                    className="h-8 px-2.5 text-xs bg-amber-50/70 border border-amber-300 rounded-md font-medium text-slate-900"
                  >
                    {INITIAL_OUTLETS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Mode Toggle: Single vs Batch */}
              <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-md">
                <button
                  type="button"
                  onClick={() => setCatMode('single')}
                  className={`px-2.5 py-1 text-xs font-medium rounded cursor-pointer ${
                    catMode === 'single' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Entri 1 Kategori
                </button>
                <button
                  type="button"
                  onClick={() => setCatMode('batch')}
                  className={`px-2.5 py-1 text-xs font-medium rounded cursor-pointer ${
                    catMode === 'batch' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Entri Batch Semua Kategori
                </button>
              </div>
            </div>

            {catMode === 'single' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori <span className="text-amber-600 font-normal">(Kuning)</span>
                  </label>
                  <select
                    value={kategoriName}
                    onChange={(e) => setKategoriName(e.target.value)}
                    className="w-full h-10 px-3 py-2 text-sm bg-amber-50/70 border border-amber-300 focus:border-amber-500 rounded-lg font-medium text-slate-900"
                    required
                  >
                    {INITIAL_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sales Kategori <span className="text-amber-600 font-normal">(Kuning)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={salesKategori}
                    onChange={(e) => setSalesKategori(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="86450000"
                    className="w-full h-10 px-3 py-2 text-sm bg-amber-50/70 border border-amber-300 focus:border-amber-500 rounded-lg font-mono tabular-nums text-slate-900"
                    required
                  />
                  <div className="text-[11px] text-slate-500 mt-1 font-mono">
                    {formatIDR(Number(salesKategori) || 0)}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    COGS / Penggunaan <span className="text-amber-600 font-normal">(Kuning)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={cogsPenggunaan}
                    onChange={(e) => setCogsPenggunaan(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="31200000"
                    className="w-full h-10 px-3 py-2 text-sm bg-amber-50/70 border border-amber-300 focus:border-amber-500 rounded-lg font-mono tabular-nums text-slate-900"
                    required
                  />
                  <div className="text-[11px] text-slate-500 mt-1 font-mono">
                    {formatIDR(Number(cogsPenggunaan) || 0)}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pembelian <span className="text-amber-600 font-normal">(Kuning)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={catPembelian}
                    onChange={(e) => setCatPembelian(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="34100000"
                    className="w-full h-10 px-3 py-2 text-sm bg-amber-50/70 border border-amber-300 focus:border-amber-500 rounded-lg font-mono tabular-nums text-slate-900"
                    required
                  />
                  <div className="text-[11px] text-slate-500 mt-1 font-mono">
                    {formatIDR(Number(catPembelian) || 0)}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Waste <span className="text-amber-600 font-normal">(Kuning)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={catWaste}
                    onChange={(e) => setCatWaste(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="39538"
                    className="w-full h-10 px-3 py-2 text-sm bg-amber-50/70 border border-amber-300 focus:border-amber-500 rounded-lg font-mono tabular-nums text-slate-900"
                    required
                  />
                  <div className="text-[11px] text-slate-500 mt-1 font-mono">
                    {formatIDR(Number(catWaste) || 0)}
                  </div>
                </div>
              </div>
            ) : (
              /* Batch multi-row category table */
              <div className="space-y-3">
                <div className="text-xs text-slate-600">
                  Isi data masing-masing kategori untuk outlet <strong className="text-slate-900">{catOutlet}</strong> pada periode <strong className="text-slate-900">{catPeriode}</strong> sekaligus:
                </div>
                <div className="overflow-x-auto border border-amber-200 rounded-lg">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-amber-100/70 text-amber-900 uppercase font-semibold">
                      <tr>
                        <th className="py-2 px-3">Kategori</th>
                        <th className="py-2 px-3">Sales Kategori (Rp)</th>
                        <th className="py-2 px-3">COGS / Penggunaan (Rp)</th>
                        <th className="py-2 px-3">Pembelian (Rp)</th>
                        <th className="py-2 px-3">Waste (Rp)</th>
                        <th className="py-2 px-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-100">
                      {batchRows.map((row, idx) => (
                        <tr key={idx} className="bg-amber-50/30 hover:bg-amber-50/60">
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={row.kategori}
                              onChange={(e) => {
                                const updated = [...batchRows];
                                updated[idx].kategori = e.target.value;
                                setBatchRows(updated);
                              }}
                              className="w-36 h-8 px-2 bg-white border border-slate-300 rounded text-xs font-medium text-slate-900"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min="0"
                              value={row.salesKategori}
                              onChange={(e) => {
                                const updated = [...batchRows];
                                updated[idx].salesKategori = Number(e.target.value) || 0;
                                setBatchRows(updated);
                              }}
                              className="w-36 h-8 px-2 bg-white border border-amber-300 rounded font-mono tabular-nums text-xs"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min="0"
                              value={row.cogsPenggunaan}
                              onChange={(e) => {
                                const updated = [...batchRows];
                                updated[idx].cogsPenggunaan = Number(e.target.value) || 0;
                                setBatchRows(updated);
                              }}
                              className="w-36 h-8 px-2 bg-white border border-amber-300 rounded font-mono tabular-nums text-xs"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min="0"
                              value={row.pembelian}
                              onChange={(e) => {
                                const updated = [...batchRows];
                                updated[idx].pembelian = Number(e.target.value) || 0;
                                setBatchRows(updated);
                              }}
                              className="w-36 h-8 px-2 bg-white border border-amber-300 rounded font-mono tabular-nums text-xs"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min="0"
                              value={row.waste}
                              onChange={(e) => {
                                const updated = [...batchRows];
                                updated[idx].waste = Number(e.target.value) || 0;
                                setBatchRows(updated);
                              }}
                              className="w-28 h-8 px-2 bg-white border border-amber-300 rounded font-mono tabular-nums text-xs"
                            />
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setBatchRows(batchRows.filter((_, i) => i !== idx));
                              }}
                              className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                              title="Hapus baris"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setBatchRows([
                      ...batchRows,
                      { kategori: 'Kategori Baru', salesKategori: 0, cogsPenggunaan: 0, pembelian: 0, waste: 0 }
                    ]);
                  }}
                  className="text-xs text-amber-800 hover:text-amber-900 font-semibold underline cursor-pointer"
                >
                  + Tambah Kategori
                </button>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                {catMode === 'single'
                  ? 'Simpan ke Sheet Analisa Kategori'
                  : `Simpan Batch (${batchRows.length} Kategori)`}
              </button>
            </div>
          </form>
        )}

        {/* ========================================================= */}
        {/* FORM 3: SHEET LOG WASTE                                    */}
        {/* ========================================================= */}
        {targetSheet === 'log_waste' && (
          <form onSubmit={handleSubmitWaste} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Tanggal */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal <span className="text-red-700 font-normal">(Kuning)</span>
                </label>
                <input
                  type="date"
                  value={wasteTanggal}
                  onChange={(e) => setWasteTanggal(e.target.value)}
                  className="w-full h-10 px-3 py-2 text-sm bg-red-50/50 border border-red-200 focus:border-red-500 rounded-lg font-medium text-slate-900"
                  required
                />
              </div>

              {/* Periode */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Periode <span className="text-xs text-slate-400 font-normal">(Otomatis/Pilihan)</span>
                </label>
                <select
                  value={wastePeriode}
                  onChange={(e) => setWastePeriode(e.target.value)}
                  className="w-full h-10 px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900"
                >
                  {INITIAL_PERIODS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* Outlet */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Outlet <span className="text-red-700 font-normal">(Kuning)</span>
                </label>
                <select
                  value={wasteOutlet}
                  onChange={(e) => setWasteOutlet(e.target.value)}
                  className="w-full h-10 px-3 py-2 text-sm bg-red-50/50 border border-red-200 focus:border-red-500 rounded-lg font-medium text-slate-900"
                  required
                >
                  {INITIAL_OUTLETS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>

              {/* Kategori */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kategori <span className="text-red-700 font-normal">(Kuning)</span>
                </label>
                <select
                  value={wasteKategori}
                  onChange={(e) => setWasteKategori(e.target.value)}
                  className="w-full h-10 px-3 py-2 text-sm bg-red-50/50 border border-red-200 focus:border-red-500 rounded-lg font-medium text-slate-900"
                  required
                >
                  {INITIAL_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Item Bahan Baku */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Item Bahan Baku <span className="text-red-700 font-normal">(Kuning)</span>
                </label>
                <input
                  type="text"
                  value={itemBahanBaku}
                  onChange={(e) => setItemBahanBaku(e.target.value)}
                  placeholder="Contoh: Basque Burnt Cheesecake, Fresh Milk 1L, Roast Bean"
                  className="w-full h-10 px-3 py-2 text-sm bg-red-50/50 border border-red-200 focus:border-red-500 rounded-lg text-slate-900 font-medium"
                  required
                />
              </div>

              {/* Satuan */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Satuan <span className="text-red-700 font-normal">(Kuning)</span>
                </label>
                <select
                  value={wasteSatuan}
                  onChange={(e) => setWasteSatuan(e.target.value as WasteUnit)}
                  className="w-full h-10 px-3 py-2 text-sm bg-red-50/50 border border-red-200 rounded-lg font-medium text-slate-900"
                  required
                >
                  {INITIAL_UNITS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              {/* Qty Waste */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Qty Waste <span className="text-red-700 font-normal">(Kuning)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={qtyWaste}
                  onChange={(e) => setQtyWaste(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="2.00"
                  className="w-full h-10 px-3 py-2 text-sm bg-red-50/50 border border-red-200 focus:border-red-500 rounded-lg font-mono tabular-nums text-slate-900"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Harga / Unit */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Harga / Unit <span className="text-red-700 font-normal">(Kuning)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-medium">Rp</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={hargaUnit}
                    onChange={(e) => setHargaUnit(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="19769"
                    className="w-full h-10 pl-9 pr-3 py-2 text-sm bg-red-50/50 border border-red-200 focus:border-red-500 rounded-lg font-mono tabular-nums text-slate-900"
                    required
                  />
                </div>
                <div className="text-[11px] text-slate-500 mt-1 font-mono">
                  {formatIDR(Number(hargaUnit) || 0)}
                </div>
              </div>

              {/* Nilai Waste (Auto calculated) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-red-900">
                    Nilai Waste (Otomatis)
                  </label>
                  <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.2 rounded font-mono">
                    Qty × Harga
                  </span>
                </div>
                <div className="w-full h-10 px-3 py-2 bg-red-100/70 border border-red-300 rounded-lg flex items-center justify-between font-mono text-sm font-bold text-red-900 tabular-nums">
                  <span>{formatIDR(calculatedNilaiWaste)}</span>
                </div>
                <div className="text-[11px] text-red-700 mt-1">
                  Terkalkulasi otomatis untuk Sheet Log Waste
                </div>
              </div>

              {/* Penyebab */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Penyebab <span className="text-red-700 font-normal">(Kuning)</span>
                </label>
                <select
                  value={penyebab}
                  onChange={(e) => setPenyebab(e.target.value as WasteCause)}
                  className="w-full h-10 px-3 py-2 text-sm bg-red-50/50 border border-red-200 rounded-lg font-medium text-slate-900"
                  required
                >
                  {INITIAL_CAUSES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Tindakan Koreksi */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tindakan Koreksi <span className="text-red-700 font-normal">(Kuning)</span>
                </label>
                <input
                  type="text"
                  value={tindakanKoreksi}
                  onChange={(e) => setTindakanKoreksi(e.target.value)}
                  placeholder="Contoh: Maintenance Showcase, Retrain Barista"
                  className="w-full h-10 px-3 py-2 text-sm bg-red-50/50 border border-red-200 focus:border-red-500 rounded-lg text-slate-900"
                />
              </div>

              {/* PIC */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  PIC <span className="text-red-700 font-normal">(Kuning)</span>
                </label>
                <select
                  value={pic}
                  onChange={(e) => setPic(e.target.value as WastePIC)}
                  className="w-full h-10 px-3 py-2 text-sm bg-red-50/50 border border-red-200 rounded-lg font-medium text-slate-900"
                  required
                >
                  {INITIAL_PICS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status <span className="text-red-700 font-normal">(Kuning)</span>
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as WasteStatus)}
                  className="w-full h-10 px-3 py-2 text-sm bg-red-50/50 border border-red-200 rounded-lg font-bold text-red-900"
                  required
                >
                  <option value="OPEN">OPEN</option>
                  <option value="INVESTIGATING">INVESTIGATING</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-red-800 hover:bg-red-900 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Simpan ke Sheet Log Waste
              </button>
            </div>
          </form>
        )}

        {/* ========================================================= */}
        {/* RIWAYAT ENTRI BARU & KONTROL HAPUS LANGSUNG               */}
        {/* ========================================================= */}
        <div className="mt-8 pt-6 border-t-2 border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Riwayat Input Terkini & Kontrol Hapus Langsung (
                  {targetSheet === 'bulanan'
                    ? 'Sheet Bulanan'
                    : targetSheet === 'analisa_kategori'
                    ? 'Sheet Analisa Kategori'
                    : 'Sheet Log Waste'}
                  )
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Data yang baru diinput langsung sinkron ke Cloud Firestore. Klik tombol merah <span className="font-semibold text-red-600">Hapus</span> jika ingin membatalkan/menghapus baris tertentu.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToSheet(targetSheet === 'bulanan' ? 'bulanan' : targetSheet === 'analisa_kategori' ? 'analisa_kategori' : 'log_waste')}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>Buka Sheet Lengkap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Table for Target Sheet: Bulanan */}
          {targetSheet === 'bulanan' && (
            <div className="overflow-x-auto border border-slate-200 rounded-xl bg-slate-50/50">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Periode</th>
                    <th className="py-2.5 px-3">Outlet</th>
                    <th className="py-2.5 px-3 text-right">Total Sales Outlet</th>
                    <th className="py-2.5 px-3 text-right">Pemakaian FnB</th>
                    <th className="py-2.5 px-3 text-right">Total HPP</th>
                    <th className="py-2.5 px-3 text-right">Pembelian</th>
                    <th className="py-2.5 px-3 text-center w-24">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {monthlyData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-4 text-center text-slate-400">
                        Belum ada data bulanan yang tercatat.
                      </td>
                    </tr>
                  ) : (
                    monthlyData.slice(0, 5).map((item) => (
                      <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="py-2 px-3 font-medium text-slate-900">{item.periode}</td>
                        <td className="py-2 px-3 font-semibold text-slate-800">{item.outlet}</td>
                        <td className="py-2 px-3 text-right font-mono tabular-nums">{formatIDR(item.totalSalesOutlet)}</td>
                        <td className="py-2 px-3 text-right font-mono tabular-nums">{formatIDR(item.pemakaianFnB)}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-blue-900 tabular-nums">{formatIDR(item.totalHPP)}</td>
                        <td className="py-2 px-3 text-right font-mono tabular-nums">{formatIDR(item.pembelianBahanBaku)}</td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => onDeleteMonthly?.(item.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-red-700 bg-red-50 hover:bg-red-100 hover:text-red-900 border border-red-200 rounded-lg transition-colors cursor-pointer"
                            title="Hapus baris ini dari Sheet Bulanan"
                          >
                            <Trash2 className="w-3 h-3 text-red-600" />
                            <span>Hapus</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Table for Target Sheet: Analisa Kategori */}
          {targetSheet === 'analisa_kategori' && (
            <div className="overflow-x-auto border border-slate-200 rounded-xl bg-slate-50/50">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Periode</th>
                    <th className="py-2.5 px-3">Outlet</th>
                    <th className="py-2.5 px-3">Kategori</th>
                    <th className="py-2.5 px-3 text-right">Sales Kategori</th>
                    <th className="py-2.5 px-3 text-right">COGS</th>
                    <th className="py-2.5 px-3 text-right">Pembelian</th>
                    <th className="py-2.5 px-3 text-right">Waste</th>
                    <th className="py-2.5 px-3 text-center w-24">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {categoryData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-4 text-center text-slate-400">
                        Belum ada data analisa kategori yang tercatat.
                      </td>
                    </tr>
                  ) : (
                    categoryData.slice(0, 6).map((item) => (
                      <tr key={item.id} className="hover:bg-amber-50/30 transition-colors">
                        <td className="py-2 px-3 font-medium text-slate-900">{item.periode}</td>
                        <td className="py-2 px-3 font-semibold text-slate-800">{item.outlet}</td>
                        <td className="py-2 px-3 font-medium text-amber-900">{item.kategori}</td>
                        <td className="py-2 px-3 text-right font-mono tabular-nums">{formatIDR(item.salesKategori)}</td>
                        <td className="py-2 px-3 text-right font-mono font-semibold tabular-nums">{formatIDR(item.cogsPenggunaan)}</td>
                        <td className="py-2 px-3 text-right font-mono tabular-nums">{formatIDR(item.pembelian)}</td>
                        <td className="py-2 px-3 text-right font-mono text-red-700 tabular-nums">{formatIDR(item.waste)}</td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => onDeleteCategory?.(item.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-red-700 bg-red-50 hover:bg-red-100 hover:text-red-900 border border-red-200 rounded-lg transition-colors cursor-pointer"
                            title="Hapus baris ini dari Sheet Analisa Kategori"
                          >
                            <Trash2 className="w-3 h-3 text-red-600" />
                            <span>Hapus</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Table for Target Sheet: Log Waste */}
          {targetSheet === 'log_waste' && (
            <div className="overflow-x-auto border border-slate-200 rounded-xl bg-slate-50/50">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Tanggal</th>
                    <th className="py-2.5 px-3">Outlet</th>
                    <th className="py-2.5 px-3">Item Bahan Baku</th>
                    <th className="py-2.5 px-3 text-center">Qty / Satuan</th>
                    <th className="py-2.5 px-3 text-right">Nilai Kerugian</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-center w-24">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {wasteData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-4 text-center text-slate-400">
                        Belum ada catatan log waste yang tercatat.
                      </td>
                    </tr>
                  ) : (
                    wasteData.slice(0, 5).map((item) => (
                      <tr key={item.id} className="hover:bg-red-50/30 transition-colors">
                        <td className="py-2 px-3 font-medium text-slate-900 whitespace-nowrap">{item.tanggal}</td>
                        <td className="py-2 px-3 font-semibold text-slate-800">{item.outlet}</td>
                        <td className="py-2 px-3 font-medium text-slate-900">{item.itemBahanBaku}</td>
                        <td className="py-2 px-3 text-center font-mono tabular-nums">{item.qtyWaste} {item.satuan}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-red-700 tabular-nums">{formatIDR(item.nilaiWaste)}</td>
                        <td className="py-2 px-3 text-center">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            item.status === 'OPEN' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => onDeleteWaste?.(item.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-red-700 bg-red-50 hover:bg-red-100 hover:text-red-900 border border-red-200 rounded-lg transition-colors cursor-pointer"
                            title="Hapus baris ini dari Sheet Log Waste"
                          >
                            <Trash2 className="w-3 h-3 text-red-600" />
                            <span>Hapus</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
