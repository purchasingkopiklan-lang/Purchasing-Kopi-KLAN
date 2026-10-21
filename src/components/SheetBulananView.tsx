import React, { useState } from 'react';
import { MonthlyReportEntry } from '../types';
import { formatIDR, formatPercent } from '../utils/formatters';
import { INITIAL_PERIODS, INITIAL_OUTLETS } from '../data/initialData';
import { Edit2, Trash2, Check, X, Filter, Plus, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

interface SheetBulananViewProps {
  data: MonthlyReportEntry[];
  onUpdate: (id: string, updated: Partial<MonthlyReportEntry>) => void;
  onDelete: (id: string) => void;
  onOpenAddForm: () => void;
  onAddMonthly?: (entry: Omit<MonthlyReportEntry, 'id'>) => void;
}

export const SheetBulananView: React.FC<SheetBulananViewProps> = ({
  data,
  onUpdate,
  onDelete,
  onOpenAddForm,
  onAddMonthly
}) => {
  const [filterOutlet, setFilterOutlet] = useState<string>('ALL');
  const [filterPeriode, setFilterPeriode] = useState<string>('ALL');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<MonthlyReportEntry>>({});

  // Inline dynamic form state for Sheet Bulanan
  const [showInlineForm, setShowInlineForm] = useState<boolean>(true);
  const [inPeriode, setInPeriode] = useState('Sep-2026');
  const [inOutlet, setInOutlet] = useState('KOPI KLAN CIHEULEUT');
  const [inSalesFnB, setInSalesFnB] = useState<number | ''>(575170585);
  const [inTotalSales, setInTotalSales] = useState<number | ''>(584110154);
  const [inPemakaian, setInPemakaian] = useState<number | ''>(220189658);
  const [inNonBahan, setInNonBahan] = useState<number | ''>(18273627);
  const [inPembelian, setInPembelian] = useState<number | ''>(235521653);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const calculatedTotalHPP = (Number(inPemakaian) || 0) + (Number(inNonBahan) || 0);

  const handleInlineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddMonthly) {
      onAddMonthly({
        periode: inPeriode,
        outlet: inOutlet,
        salesProfitFnB: Number(inSalesFnB) || 0,
        totalSalesOutlet: Number(inTotalSales) || 0,
        pemakaianFnB: Number(inPemakaian) || 0,
        hppNonBahanBaku: Number(inNonBahan) || 0,
        totalHPP: calculatedTotalHPP,
        pembelianBahanBaku: Number(inPembelian) || 0,
        notes: `Input bulanan ${inOutlet} ${inPeriode}`
      });
      setSuccessMsg(`Data ${inOutlet} (${inPeriode}) berhasil dimasukkan ke Sheet 'Bulanan' file Kontrol_COGS_KOPIKLAN!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      onOpenAddForm();
    }
  };

  const filteredData = data.filter((item) => {
    const matchOutlet = filterOutlet === 'ALL' || item.outlet === filterOutlet;
    const matchPeriod = filterPeriode === 'ALL' || item.periode === filterPeriode;
    return matchOutlet && matchPeriod;
  });

  const startEdit = (row: MonthlyReportEntry) => {
    setEditingId(row.id);
    setEditForm({ ...row });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = (id: string) => {
    const pemakaian = Number(editForm.pemakaianFnB) || 0;
    const nonBahan = Number(editForm.hppNonBahanBaku) || 0;
    const totalHPP = pemakaian + nonBahan;
    onUpdate(id, {
      ...editForm,
      totalHPP
    });
    setEditingId(null);
  };

  // Totals
  const sumSalesFnB = filteredData.reduce((acc, r) => acc + r.salesProfitFnB, 0);
  const sumTotalSales = filteredData.reduce((acc, r) => acc + r.totalSalesOutlet, 0);
  const sumPemakaian = filteredData.reduce((acc, r) => acc + r.pemakaianFnB, 0);
  const sumNonBahan = filteredData.reduce((acc, r) => acc + r.hppNonBahanBaku, 0);
  const sumTotalHPP = filteredData.reduce((acc, r) => acc + r.totalHPP, 0);
  const sumPembelian = filteredData.reduce((acc, r) => acc + r.pembelianBahanBaku, 0);

  // Control Board outlet tab filter
  const [panelOutletFilter, setPanelOutletFilter] = useState<string>('ALL');

  // Individual report ratios (Calculated PER OUTLET and PER PERIODE - never merged!)
  const reportRatios = filteredData.map((row) => {
    const fnbSalesRatio = row.totalSalesOutlet > 0 ? (row.salesProfitFnB / row.totalSalesOutlet) * 100 : 0;
    const pemakaianRatio = row.salesProfitFnB > 0 ? (row.pemakaianFnB / row.salesProfitFnB) * 100 : 0;
    const nonBahanRatio = row.totalSalesOutlet > 0 ? (row.hppNonBahanBaku / row.totalSalesOutlet) * 100 : 0;
    const hppRatio = row.totalSalesOutlet > 0 ? (row.totalHPP / row.totalSalesOutlet) * 100 : 0;
    const purchaseRatio = row.totalSalesOutlet > 0 ? (row.pembelianBahanBaku / row.totalSalesOutlet) * 100 : 0;
    const buffer = row.pembelianBahanBaku - row.pemakaianFnB;

    // Track MoM trend specifically for the SAME outlet across chronological periods
    const outletPastRows = data
      .filter((r) => r.outlet === row.outlet)
      .sort((a, b) => INITIAL_PERIODS.indexOf(a.periode) - INITIAL_PERIODS.indexOf(b.periode));
    
    const thisIndex = outletPastRows.findIndex(
      (r) => r.id === row.id || (r.periode === row.periode && r.outlet === row.outlet)
    );
    const prevRow = thisIndex > 0 ? outletPastRows[thisIndex - 1] : null;

    let momHppDelta: number | null = null;
    let prevPeriodLabel: string | null = null;
    if (prevRow && prevRow.totalSalesOutlet > 0) {
      const prevRatio = (prevRow.totalHPP / prevRow.totalSalesOutlet) * 100;
      momHppDelta = hppRatio - prevRatio;
      prevPeriodLabel = prevRow.periode;
    }

    return {
      id: row.id,
      periode: row.periode,
      outlet: row.outlet,
      salesFnB: row.salesProfitFnB,
      totalSales: row.totalSalesOutlet,
      pemakaian: row.pemakaianFnB,
      nonBahan: row.hppNonBahanBaku,
      totalHPP: row.totalHPP,
      pembelian: row.pembelianBahanBaku,
      fnbSalesRatio,
      pemakaianRatio,
      nonBahanRatio,
      hppRatio,
      purchaseRatio,
      buffer,
      momHppDelta,
      prevPeriodLabel,
      status: hppRatio <= 35 ? 'Optimal (<35%)' : hppRatio <= 40 ? 'Toleransi (35-40%)' : 'Over Target (>40%)'
    };
  });

  const panelReports = reportRatios.filter(
    (r) => panelOutletFilter === 'ALL' || r.outlet === panelOutletFilter
  );

  return (
    <div className="space-y-6">
      {/* Inline Dynamic Input Form Section for Sheet Bulanan */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div
          onClick={() => setShowInlineForm(!showInlineForm)}
          className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-blue-900 text-white flex items-center justify-center text-xs font-bold">
              +
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Formulir Input Dinamis — Sheet Bulanan (Kontrol_COGS_HPP_Pembelian_Waste)
              </h3>
              <p className="text-xs text-slate-500">
                Masukkan Periode, Outlet, Sales Profit FnB, Total Sales, Pemakaian, HPP Non-Bahan Baku, dan Pembelian
              </p>
            </div>
          </div>
          <button type="button" className="text-slate-500 hover:text-slate-800 p-1">
            {showInlineForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showInlineForm && (
          <form onSubmit={handleInlineSubmit} className="p-4 sm:p-5 space-y-4">
            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Field 1: Periode */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Periode <span className="text-amber-600 font-normal">(Kuning)</span>
                </label>
                <select
                  value={inPeriode}
                  onChange={(e) => setInPeriode(e.target.value)}
                  className="w-full h-9 px-3 bg-[#fefce8] border border-amber-300 focus:border-amber-500 rounded-lg text-xs font-medium text-slate-900 focus:outline-none"
                  required
                >
                  {INITIAL_PERIODS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* Field 2: Outlet */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Outlet <span className="text-amber-600 font-normal">(Kuning)</span>
                </label>
                <select
                  value={inOutlet}
                  onChange={(e) => setInOutlet(e.target.value)}
                  className="w-full h-9 px-3 bg-[#fefce8] border border-amber-300 focus:border-amber-500 rounded-lg text-xs font-medium text-slate-900 focus:outline-none"
                  required
                >
                  {INITIAL_OUTLETS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>

              {/* Field 3: Sales Profit FnB */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sales Profit FnB <span className="text-amber-600 font-normal">(Kuning)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs text-slate-400">Rp</span>
                  <input
                    type="number"
                    min="0"
                    value={inSalesFnB}
                    onChange={(e) => setInSalesFnB(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="396176414"
                    className="w-full h-9 pl-8 pr-2.5 bg-[#fefce8] border border-amber-300 focus:border-amber-500 rounded-lg text-xs font-mono tabular-nums text-slate-900 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Field 4: Total Sales Outlet */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Total Sales Outlet <span className="text-amber-600 font-normal">(Kuning)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs text-slate-400">Rp</span>
                  <input
                    type="number"
                    min="0"
                    value={inTotalSales}
                    onChange={(e) => setInTotalSales(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="434887864"
                    className="w-full h-9 pl-8 pr-2.5 bg-[#fefce8] border border-amber-300 focus:border-amber-500 rounded-lg text-xs font-mono tabular-nums text-slate-900 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Field 5: Pemakaian FnB */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pemakaian FnB <span className="text-amber-600 font-normal">(Kuning)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs text-slate-400">Rp</span>
                  <input
                    type="number"
                    min="0"
                    value={inPemakaian}
                    onChange={(e) => setInPemakaian(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="144963842"
                    className="w-full h-9 pl-8 pr-2.5 bg-[#fefce8] border border-amber-300 focus:border-amber-500 rounded-lg text-xs font-mono tabular-nums text-slate-900 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Field 6: HPP Non-Bahan Baku */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  HPP Non-Bahan Baku <span className="text-amber-600 font-normal">(Kuning)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs text-slate-400">Rp</span>
                  <input
                    type="number"
                    min="0"
                    value={inNonBahan}
                    onChange={(e) => setInNonBahan(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="9810481"
                    className="w-full h-9 pl-8 pr-2.5 bg-[#fefce8] border border-amber-300 focus:border-amber-500 rounded-lg text-xs font-mono tabular-nums text-slate-900 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Formula Result: Total HPP */}
              <div>
                <label className="block text-xs font-semibold text-blue-900 mb-1">
                  Total HPP (Otomatis: E + F)
                </label>
                <div className="w-full h-9 px-3 bg-blue-50 border border-blue-200 rounded-lg text-xs font-mono font-bold text-blue-950 flex items-center justify-between tabular-nums">
                  <span>{formatIDR(calculatedTotalHPP)}</span>
                  <span className="text-[10px] text-blue-700">Formula</span>
                </div>
              </div>

              {/* Field 7: Pembelian Bahan Baku */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pembelian Bahan Baku <span className="text-amber-600 font-normal">(Kuning)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs text-slate-400">Rp</span>
                  <input
                    type="number"
                    min="0"
                    value={inPembelian}
                    onChange={(e) => setInPembelian(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="148410477"
                    className="w-full h-9 pl-8 pr-2.5 bg-[#fefce8] border border-amber-300 focus:border-amber-500 rounded-lg text-xs font-mono tabular-nums text-slate-900 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                Data akan otomatis masuk ke tabel Sheet Bulanan dan diekspor ke file <strong className="text-slate-700">Kontrol_COGS_HPP_Pembelian_Waste.xlsx</strong>.
              </span>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Simpan ke Sheet Bulanan</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Spreadsheet Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Control Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Filter Sheet:</span>
            </div>

            {/* Filter Outlet */}
            <select
              value={filterOutlet}
              onChange={(e) => setFilterOutlet(e.target.value)}
              className="h-8 px-2 text-xs bg-white border border-slate-300 rounded-md text-slate-800"
            >
            <option value="ALL">Semua Outlet</option>
            {INITIAL_OUTLETS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>

          {/* Filter Periode */}
          <select
            value={filterPeriode}
            onChange={(e) => setFilterPeriode(e.target.value)}
            className="h-8 px-2 text-xs bg-white border border-slate-300 rounded-md text-slate-800"
          >
            <option value="ALL">Semua Periode</option>
            {INITIAL_PERIODS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <span className="text-xs text-slate-400">
            Menampilkan {filteredData.length} baris
          </span>
        </div>

        <button
          onClick={onOpenAddForm}
          className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
        >
          + Tambah Data Bulanan
        </button>
      </div>

      {/* Spreadsheet Table matching Image 1 */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            {/* Column letters row like Google Sheets/Excel */}
            <tr className="bg-slate-100 text-slate-400 font-mono text-[11px] text-center border-b border-slate-200">
              <th className="py-1 px-3 w-10 border-r border-slate-200 font-normal">#</th>
              <th className="py-1 px-3 border-r border-slate-200 font-normal">A</th>
              <th className="py-1 px-3 border-r border-slate-200 font-normal">B</th>
              <th className="py-1 px-3 border-r border-slate-200 font-normal">C</th>
              <th className="py-1 px-3 border-r border-slate-200 font-normal">D</th>
              <th className="py-1 px-3 border-r border-slate-200 font-normal">E</th>
              <th className="py-1 px-3 border-r border-slate-200 font-normal">F</th>
              <th className="py-1 px-3 border-r border-slate-200 font-normal bg-blue-100 text-blue-900 font-bold">G</th>
              <th className="py-1 px-3 border-r border-slate-200 font-normal">H</th>
              <th className="py-1 px-3 font-normal">Aksi</th>
            </tr>

            {/* Header row from screenshot: Deep Navy with light blue for Column G */}
            <tr className="border-b border-slate-300 text-white">
              <th className="py-3 px-3 bg-[#172554] text-center font-mono border-r border-blue-950">1</th>
              <th className="py-3 px-4 bg-[#1e3a5f] text-left font-bold border-r border-blue-900">
                Periode
              </th>
              <th className="py-3 px-4 bg-[#1e3a5f] text-left font-bold border-r border-blue-900">
                Outlet
              </th>
              <th className="py-3 px-4 bg-[#1e3a5f] text-right font-bold border-r border-blue-900">
                Sales Profit FnB
              </th>
              <th className="py-3 px-4 bg-[#1e3a5f] text-right font-bold border-r border-blue-900">
                Total Sales Outlet
              </th>
              <th className="py-3 px-4 bg-[#1e3a5f] text-right font-bold border-r border-blue-900">
                Pemakaian FnB
              </th>
              <th className="py-3 px-4 bg-[#1e3a5f] text-right font-bold border-r border-blue-900">
                HPP Non-Bahan Baku
              </th>
              <th className="py-3 px-4 bg-[#dbeafe] text-[#1e3a5f] text-right font-bold border-r border-blue-200">
                Total HPP
              </th>
              <th className="py-3 px-4 bg-[#1e3a5f] text-right font-bold border-r border-blue-900">
                Pembelian Bahan Baku
              </th>
              <th className="py-3 px-3 bg-[#1e3a5f] text-center font-medium">
                Opsi
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-10 text-center text-slate-400">
                  Belum ada data bulanan yang sesuai dengan filter.
                </td>
              </tr>
            ) : (
              filteredData.map((row, idx) => {
                const isEditing = editingId === row.id;

                if (isEditing) {
                  const currentPemakaian = Number(editForm.pemakaianFnB) || 0;
                  const currentNonBahan = Number(editForm.hppNonBahanBaku) || 0;
                  const liveTotalHPP = currentPemakaian + currentNonBahan;

                  return (
                    <tr key={row.id} className="bg-blue-50/50">
                      <td className="py-2 px-2 text-center font-mono text-slate-400 border-r border-slate-200">
                        {idx + 2}
                      </td>
                      <td className="p-1 border-r border-slate-200">
                        <select
                          value={editForm.periode}
                          onChange={(e) => setEditForm({ ...editForm, periode: e.target.value })}
                          className="w-full h-8 px-2 bg-white border border-slate-300 rounded text-xs"
                        >
                          {INITIAL_PERIODS.map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-1 border-r border-slate-200">
                        <select
                          value={editForm.outlet}
                          onChange={(e) => setEditForm({ ...editForm, outlet: e.target.value })}
                          className="w-full h-8 px-2 bg-white border border-slate-300 rounded text-xs"
                        >
                          {INITIAL_OUTLETS.map((o) => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-1 border-r border-slate-200">
                        <input
                          type="number"
                          value={editForm.salesProfitFnB}
                          onChange={(e) => setEditForm({ ...editForm, salesProfitFnB: Number(e.target.value) || 0 })}
                          className="w-full h-8 px-2 bg-white border border-slate-300 rounded text-xs font-mono text-right"
                        />
                      </td>
                      <td className="p-1 border-r border-slate-200">
                        <input
                          type="number"
                          value={editForm.totalSalesOutlet}
                          onChange={(e) => setEditForm({ ...editForm, totalSalesOutlet: Number(e.target.value) || 0 })}
                          className="w-full h-8 px-2 bg-white border border-slate-300 rounded text-xs font-mono text-right"
                        />
                      </td>
                      <td className="p-1 border-r border-slate-200">
                        <input
                          type="number"
                          value={editForm.pemakaianFnB}
                          onChange={(e) => setEditForm({ ...editForm, pemakaianFnB: Number(e.target.value) || 0 })}
                          className="w-full h-8 px-2 bg-white border border-slate-300 rounded text-xs font-mono text-right"
                        />
                      </td>
                      <td className="p-1 border-r border-slate-200">
                        <input
                          type="number"
                          value={editForm.hppNonBahanBaku}
                          onChange={(e) => setEditForm({ ...editForm, hppNonBahanBaku: Number(e.target.value) || 0 })}
                          className="w-full h-8 px-2 bg-white border border-slate-300 rounded text-xs font-mono text-right"
                        />
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-blue-900 border-r border-slate-200">
                        {formatIDR(liveTotalHPP, '')}
                      </td>
                      <td className="p-1 border-r border-slate-200">
                        <input
                          type="number"
                          value={editForm.pembelianBahanBaku}
                          onChange={(e) => setEditForm({ ...editForm, pembelianBahanBaku: Number(e.target.value) || 0 })}
                          className="w-full h-8 px-2 bg-white border border-slate-300 rounded text-xs font-mono text-right"
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => saveEdit(row.id)}
                            className="p-1 text-emerald-600 hover:text-emerald-800 cursor-pointer"
                            title="Simpan"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                            title="Batal"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={row.id} className="hover:bg-amber-50/30 transition-colors">
                    {/* Row Index */}
                    <td className="py-2 px-3 text-center font-mono text-slate-400 bg-slate-50 border-r border-slate-200">
                      {idx + 2}
                    </td>

                    {/* A: Periode - Yellow Input Column from Screenshot */}
                    <td className="py-2 px-4 bg-[#fefce8] text-slate-900 font-medium border-r border-slate-200 whitespace-nowrap">
                      <div className="flex items-center justify-between">
                        <span>{row.periode}</span>
                        <span className="text-[10px] text-amber-600">▼</span>
                      </div>
                    </td>

                    {/* B: Outlet - Yellow Input Column from Screenshot */}
                    <td className="py-2 px-4 bg-[#fefce8] text-slate-900 font-semibold border-r border-slate-200 whitespace-nowrap">
                      <div className="flex items-center justify-between">
                        <span>{row.outlet}</span>
                        <span className="text-[10px] text-amber-600">▼</span>
                      </div>
                    </td>

                    {/* C: Sales Profit FnB - Yellow Input */}
                    <td className="py-2 px-4 bg-[#fefce8] text-right font-mono tabular-nums text-slate-900 border-r border-slate-200">
                      {formatIDR(row.salesProfitFnB)}
                    </td>

                    {/* D: Total Sales Outlet - Yellow Input */}
                    <td className="py-2 px-4 bg-[#fefce8] text-right font-mono tabular-nums text-slate-900 border-r border-slate-200">
                      {formatIDR(row.totalSalesOutlet)}
                    </td>

                    {/* E: Pemakaian FnB - Yellow Input */}
                    <td className="py-2 px-4 bg-[#fefce8] text-right font-mono tabular-nums text-slate-900 border-r border-slate-200">
                      {formatIDR(row.pemakaianFnB)}
                    </td>

                    {/* F: HPP Non-Bahan Baku - Yellow Input */}
                    <td className="py-2 px-4 bg-[#fefce8] text-right font-mono tabular-nums text-slate-900 border-r border-slate-200">
                      {formatIDR(row.hppNonBahanBaku)}
                    </td>

                    {/* G: Total HPP - White/Calculated column (not yellow) */}
                    <td className="py-2 px-4 bg-white text-right font-mono tabular-nums font-bold text-slate-900 border-r border-slate-200">
                      {formatIDR(row.totalHPP, '')}
                    </td>

                    {/* H: Pembelian Bahan Baku - Yellow Input */}
                    <td className="py-2 px-4 bg-[#fefce8] text-right font-mono tabular-nums text-slate-900 border-r border-slate-200">
                      {formatIDR(row.pembelianBahanBaku)}
                    </td>

                    {/* Action */}
                    <td className="py-2 px-3 text-center bg-white whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => startEdit(row)}
                          className="p-1 text-slate-400 hover:text-blue-600 cursor-pointer"
                          title="Edit baris"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(row.id)}
                          className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                          title="Hapus baris"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Table Summary Footer */}
          {filteredData.length > 0 && (
            <tfoot className="border-t-2 border-slate-300 bg-slate-100 font-semibold text-slate-900">
              <tr>
                <td className="py-2 px-3 text-center border-r border-slate-200 font-mono">Σ</td>
                <td className="py-2 px-4 border-r border-slate-200">Total Ringkasan</td>
                <td className="py-2 px-4 border-r border-slate-200">{filteredData.length} Laporan</td>
                <td className="py-2 px-4 text-right font-mono tabular-nums border-r border-slate-200">
                  {formatIDR(sumSalesFnB)}
                </td>
                <td className="py-2 px-4 text-right font-mono tabular-nums border-r border-slate-200">
                  {formatIDR(sumTotalSales)}
                </td>
                <td className="py-2 px-4 text-right font-mono tabular-nums border-r border-slate-200">
                  {formatIDR(sumPemakaian)}
                </td>
                <td className="py-2 px-4 text-right font-mono tabular-nums border-r border-slate-200">
                  {formatIDR(sumNonBahan)}
                </td>
                <td className="py-2 px-4 text-right font-mono tabular-nums font-bold text-blue-900 border-r border-slate-200">
                  {formatIDR(sumTotalHPP, '')}
                </td>
                <td className="py-2 px-4 text-right font-mono tabular-nums border-r border-slate-200">
                  {formatIDR(sumPembelian)}
                </td>
                <td className="py-2 px-3"></td>
              </tr>
              {reportRatios.map((r, rIdx) => (
                <tr
                  key={`${r.periode}-${r.outlet}-${r.id}`}
                  className={`text-[11px] font-normal border-b border-slate-200 ${
                    rIdx === 0 ? 'bg-amber-50/70' : rIdx % 2 === 0 ? 'bg-amber-50/40' : 'bg-slate-50/80'
                  }`}
                >
                  <td colSpan={3} className="py-2 px-4 text-right font-semibold text-slate-800 border-r border-slate-200">
                    <span className="text-amber-800 font-bold">{r.periode}</span> · <span className="text-slate-900 font-bold">{r.outlet}</span>:
                  </td>
                  <td className="py-2 px-4 text-right font-mono text-slate-700 border-r border-slate-200">
                    {r.fnbSalesRatio.toFixed(1)}% FnB
                  </td>
                  <td className="py-2 px-4 text-right font-mono text-slate-500 border-r border-slate-200">
                    100% Sales
                  </td>
                  <td className="py-2 px-4 text-right font-mono font-medium text-slate-800 border-r border-slate-200">
                    {r.pemakaianRatio.toFixed(1)}% ke Sales FnB
                  </td>
                  <td className="py-2 px-4 text-right font-mono text-slate-600 border-r border-slate-200">
                    {r.nonBahanRatio.toFixed(1)}% Non-BB
                  </td>
                  <td className="py-2 px-4 text-right font-mono font-bold text-blue-900 border-r border-slate-200">
                    {r.hppRatio.toFixed(1)}% Total HPP
                  </td>
                  <td className="py-2 px-4 text-right font-mono font-medium text-slate-800 border-r border-slate-200">
                    {r.purchaseRatio.toFixed(1)}% Pembelian
                  </td>
                  <td className="py-2 px-2 text-center whitespace-nowrap">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        r.hppRatio <= 35
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.hppRatio <= 40
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tfoot>
          )}
        </table>
      </div>
    </div>

    {/* Panel Kontrol Rasio Bulanan (MoM COGS & Purchasing Control Board Per Periode & Outlet) */}
    {reportRatios.length > 0 && (
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Panel Kontrol Rasio Bulanan per Periode & per Outlet
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluasi performa COGS, pemakaian, dan selisih pembelian secara independen per cabang dan per periode bulan (tidak digabung).
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-600 shrink-0">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Optimal: &le; 35%</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>Toleransi: 35-40%</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span>Over: &gt; 40%</span>
              </span>
            </div>
          </div>

          {/* Filter Tab per Outlet */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-200/70 rounded-lg">
            <button
              type="button"
              onClick={() => setPanelOutletFilter('ALL')}
              className={`px-3 py-1 text-xs font-semibold rounded-md cursor-pointer transition-colors ${
                panelOutletFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/50'
              }`}
            >
              Semua Outlet ({reportRatios.length} Report)
            </button>
            {INITIAL_OUTLETS.map((o) => {
              const count = reportRatios.filter((r) => r.outlet === o).length;
              return (
                <button
                  type="button"
                  key={o}
                  onClick={() => setPanelOutletFilter(o)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md cursor-pointer transition-colors ${
                    panelOutletFilter === o
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/50'
                  }`}
                >
                  {o} ({count})
                </button>
              );
            })}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Periode</th>
                <th className="py-2.5 px-3">Outlet Cabang</th>
                <th className="py-2.5 px-3 text-right">Total Sales Outlet</th>
                <th className="py-2.5 px-3 text-right">Pemakaian FnB (% Sales)</th>
                <th className="py-2.5 px-3 text-right">Total HPP (% COGS)</th>
                <th className="py-2.5 px-3 text-right">Pembelian Bahan Baku</th>
                <th className="py-2.5 px-3 text-right">% Pembelian</th>
                <th className="py-2.5 px-3 text-right">Selisih Beli vs Pakai</th>
                <th className="py-2.5 px-3 text-center">Tren MoM HPP Cabang</th>
                <th className="py-2.5 px-3 text-center">Status Kontrol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono tabular-nums">
              {panelReports.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 font-sans">
                    Tidak ada data report bulanan untuk outlet ini.
                  </td>
                </tr>
              ) : (
                panelReports.map((r) => (
                  <tr key={`${r.id}-panel`} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-sans font-bold text-slate-900">{r.periode}</td>
                    <td className="py-2.5 px-3 font-sans font-semibold text-blue-900 whitespace-nowrap">
                      {r.outlet}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-800">{formatIDR(r.totalSales)}</td>
                    <td className="py-2.5 px-3 text-right text-slate-800">
                      <div>{formatIDR(r.pemakaian)}</div>
                      <div className="text-[10px] text-slate-500 font-sans">{r.pemakaianRatio.toFixed(1)}% dari FnB</div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-blue-950">
                      <div>{formatIDR(r.totalHPP)}</div>
                      <div className={`text-[10px] font-sans font-semibold ${
                        r.hppRatio <= 35 ? 'text-emerald-700' : r.hppRatio <= 40 ? 'text-amber-700' : 'text-red-700'
                      }`}>
                        {r.hppRatio.toFixed(2)}% COGS
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-800">{formatIDR(r.pembelian)}</td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-700">{r.purchaseRatio.toFixed(2)}%</td>
                    <td className="py-2.5 px-3 text-right font-semibold">
                      <span className={r.buffer >= 0 ? 'text-blue-700' : 'text-red-700'}>
                        {r.buffer >= 0 ? `+${formatIDR(r.buffer)}` : formatIDR(r.buffer)}
                      </span>
                      <div className="text-[10px] text-slate-500 font-sans">
                        {r.buffer >= 0 ? 'Buffer Stok Masuk' : 'Penyusutan'}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center font-sans">
                      {r.momHppDelta !== null ? (
                        <div>
                          <span className={`font-semibold ${r.momHppDelta > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                            {r.momHppDelta > 0 ? `+${r.momHppDelta.toFixed(1)}% ▲` : `${r.momHppDelta.toFixed(1)}% ▼`}
                          </span>
                          <div className="text-[10px] text-slate-400">vs {r.prevPeriodLabel}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Bulan Pertama</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center font-sans">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        r.hppRatio <= 35
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.hppRatio <= 40
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </div>
  );
};
