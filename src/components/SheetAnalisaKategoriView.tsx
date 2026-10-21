import React, { useState } from 'react';
import { CategoryAnalysisEntry } from '../types';
import { formatIDR, formatPercent } from '../utils/formatters';
import { INITIAL_PERIODS, INITIAL_OUTLETS, INITIAL_CATEGORIES } from '../data/initialData';
import {
  Edit2,
  Trash2,
  Check,
  X,
  Filter,
  BookOpen,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Layers,
  ArrowUpDown
} from 'lucide-react';

interface SheetAnalisaKategoriViewProps {
  data: CategoryAnalysisEntry[];
  onUpdate: (id: string, updated: Partial<CategoryAnalysisEntry>) => void;
  onDelete: (id: string) => void;
  onOpenAddForm: () => void;
}

// Benchmark Target Industri F&B Coffee Shop
export const CATEGORY_BENCHMARKS: Record<string, { min: number; max: number; label: string; desc: string }> = {
  'Coffee': { min: 25, max: 30, label: '25% - 30%', desc: 'Komoditas utama espresso & manual brew. Margin kotor ideal 70-75%.' },
  'Milk & Dairy': { min: 35, max: 40, label: '35% - 40%', desc: 'Bahan segar sensitif kadaluarsa. Perlu par-stock harian & FIFO ketat.' },
  'Pastry': { min: 30, max: 35, label: '30% - 35%', desc: 'Produk chiller & bakery showcase. Pantau shelf-life & showcase chiller.' },
  'Food / Kitchen': { min: 35, max: 38, label: '35% - 38%', desc: 'Bahan protein, saus & bahan makanan berat. Kontrol yield pemotongan.' },
  'Non-Coffee': { min: 28, max: 33, label: '28% - 33%', desc: 'Syrup, matcha, cokelat, powder artisan & artisan tea.' },
  'Syrup & Powder': { min: 22, max: 28, label: '22% - 28%', desc: 'Bahan perasa sekunder terkonsentrasi. Volume kecil margin tinggi.' },
  'Packaging': { min: 4, max: 7, label: '4% - 7%', desc: 'Cup paper/plastic, lid, sedotan, bag take-away. Maks 6% dari omzet.' },
  'Other Supplies': { min: 3, max: 8, label: '3% - 8%', desc: 'Chemicals, pembersih mesin espresso, perlengkapan sanitasi.' }
};

export const SheetAnalisaKategoriView: React.FC<SheetAnalisaKategoriViewProps> = ({
  data,
  onUpdate,
  onDelete,
  onOpenAddForm
}) => {
  const [filterOutlet, setFilterOutlet] = useState<string>('ALL');
  const [filterPeriode, setFilterPeriode] = useState<string>('ALL');
  const [filterKategori, setFilterKategori] = useState<string>('ALL');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<CategoryAnalysisEntry>>({});

  // State for reference guide accordion
  const [showFormulaGuide, setShowFormulaGuide] = useState<boolean>(false);

  // State for Control Board selected (Periode + Outlet)
  const [activeBoardKey, setActiveBoardKey] = useState<string>('ALL');

  const filteredData = data.filter((item) => {
    const matchOutlet = filterOutlet === 'ALL' || item.outlet === filterOutlet;
    const matchPeriod = filterPeriode === 'ALL' || item.periode === filterPeriode;
    const matchCat = filterKategori === 'ALL' || item.kategori === filterKategori;
    return matchOutlet && matchPeriod && matchCat;
  });

  const startEdit = (row: CategoryAnalysisEntry) => {
    setEditingId(row.id);
    setEditForm({ ...row });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = (id: string) => {
    onUpdate(id, editForm);
    setEditingId(null);
  };

  // Sums across filtered table
  const sumSales = filteredData.reduce((acc, r) => acc + r.salesKategori, 0);
  const sumCOGS = filteredData.reduce((acc, r) => acc + r.cogsPenggunaan, 0);
  const sumPembelian = filteredData.reduce((acc, r) => acc + r.pembelian, 0);
  const sumWaste = filteredData.reduce((acc, r) => acc + r.waste, 0);

  // =========================================================================
  // Per-Periode & Per-Outlet Specific Ratios (Uncombined / Tidak Digabung!)
  // =========================================================================
  const uniqueOutletPeriodPairs = Array.from(
    new Set(filteredData.map((r) => `${r.periode}__${r.outlet}`))
  ).map((key) => {
    const [periode, outlet] = key.split('__');
    const rows = filteredData.filter((r) => r.periode === periode && r.outlet === outlet);
    const pSales = rows.reduce((acc, r) => acc + r.salesKategori, 0);
    const pCOGS = rows.reduce((acc, r) => acc + r.cogsPenggunaan, 0);
    const pPembelian = rows.reduce((acc, r) => acc + r.pembelian, 0);
    const pWaste = rows.reduce((acc, r) => acc + r.waste, 0);

    const cogsRatio = pSales > 0 ? (pCOGS / pSales) * 100 : 0;
    const purchaseRatio = pSales > 0 ? (pPembelian / pSales) * 100 : 0;
    const wasteRatio = pSales > 0 ? (pWaste / pSales) * 100 : 0;
    const grossMargin = pSales - pCOGS;
    const grossMarginRatio = pSales > 0 ? (grossMargin / pSales) * 100 : 0;
    const buffer = pPembelian - pCOGS; // Selisih Beli vs Pakai
    const alignmentRatio = pPembelian > 0 ? (pCOGS / pPembelian) * 100 : 0; // Alignment %

    return {
      key,
      periode,
      outlet,
      rowsCount: rows.length,
      pSales,
      pCOGS,
      pPembelian,
      pWaste,
      grossMargin,
      grossMarginRatio,
      cogsRatio,
      purchaseRatio,
      wasteRatio,
      buffer,
      alignmentRatio,
      status: cogsRatio <= 35 ? 'Optimal (<35%)' : cogsRatio <= 40 ? 'Toleransi (35-40%)' : 'Over Target (>40%)'
    };
  });

  // Selected report for the detailed Category Intelligence Matrix
  const selectedBoardReports = activeBoardKey === 'ALL'
    ? filteredData
    : filteredData.filter((r) => `${r.periode}__${r.outlet}` === activeBoardKey);

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. Panduan Referensi Hitungan Analisa Purchasing F&B (Formula Guide)      */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div
          onClick={() => setShowFormulaGuide(!showFormulaGuide)}
          className="p-4 bg-amber-50/70 border-b border-amber-200 flex items-center justify-between cursor-pointer hover:bg-amber-100/60 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-700 text-white flex items-center justify-center text-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-950">
                Kamus & Referensi Kalkulasi Analisa Purchasing F&B
              </h3>
              <p className="text-xs text-amber-800">
                Klik untuk melihat rumus hitungan standar COGS, rasio pembelian, penentuan buffer stok, dan benchmark industri coffee shop.
              </p>
            </div>
          </div>
          <button type="button" className="text-amber-800 hover:text-amber-950 p-1">
            {showFormulaGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showFormulaGuide && (
          <div className="p-4 sm:p-6 bg-amber-50/20 text-xs text-slate-700 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Formula 1: Rasio COGS */}
              <div className="p-3.5 bg-white border border-amber-200 rounded-lg shadow-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900">1. Rasio COGS / Pemakaian</span>
                  <span className="font-mono text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">Rumus</span>
                </div>
                <div className="font-mono text-slate-800 bg-slate-50 p-2 rounded border border-slate-200 text-[11px]">
                  (COGS / Sales Kategori) × 100%
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  <strong>Target Industri F&B:</strong> Coffee (25-30%), Pastry (30-35%), Dairy (35-40%), Kitchen (35-38%), Packaging (4-7%).
                  Jika melampaui batas, evaluasi porsi resep atau negosiasi ulang harga vendor.
                </p>
              </div>

              {/* Formula 2: Rasio Pembelian vs Penjualan */}
              <div className="p-3.5 bg-white border border-amber-200 rounded-lg shadow-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900">2. Rasio Belanja ke Sales</span>
                  <span className="font-mono text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">Rumus</span>
                </div>
                <div className="font-mono text-slate-800 bg-slate-50 p-2 rounded border border-slate-200 text-[11px]">
                  (Pembelian / Sales Kategori) × 100%
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Mengukur arus kas keluar purchasing terhadap pemasukan. Jika rasio belanja jauh melampaui rasio COGS, terjadi penumpukan persediaan (over-procurement).
                </p>
              </div>

              {/* Formula 3: Selisih Beli vs Pakai (Buffer Stok) */}
              <div className="p-3.5 bg-white border border-amber-200 rounded-lg shadow-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900">3. Buffer Stok Masuk / Keluar</span>
                  <span className="font-mono text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">Rumus</span>
                </div>
                <div className="font-mono text-slate-800 bg-slate-50 p-2 rounded border border-slate-200 text-[11px]">
                  Selisih = Pembelian − COGS Penggunaan
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  <strong>Positif (+):</strong> Penambahan stok di gudang cabang (safety buffer).<br />
                  <strong>Negatif (−):</strong> Pengurangan persediaan/menghabiskan sisa stok lama.
                </p>
              </div>

              {/* Formula 4: Waste Ratio */}
              <div className="p-3.5 bg-white border border-amber-200 rounded-lg shadow-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900">4. Rasio Kerugian Waste</span>
                  <span className="font-mono text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">Rumus</span>
                </div>
                <div className="font-mono text-slate-800 bg-slate-50 p-2 rounded border border-slate-200 text-[11px]">
                  (Waste / Sales Kategori) × 100%
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  <strong>Batas Toleransi:</strong> Maksimal 1.0% – 1.5% dari omzet. Jika &gt; 2%, cabang mengalami masalah penyimpanan suhu showcase, kadaluarsa, atau spillage barista.
                </p>
              </div>

              {/* Formula 5: Gross Margin Kontribusi */}
              <div className="p-3.5 bg-white border border-amber-200 rounded-lg shadow-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900">5. Margin Kontribusi Kotor</span>
                  <span className="font-mono text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">Rumus</span>
                </div>
                <div className="font-mono text-slate-800 bg-slate-50 p-2 rounded border border-slate-200 text-[11px]">
                  Sales Kategori − COGS
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Laba kotor yang disumbangkan oleh kategori tersebut sebelum dipotong biaya operasional lain. Target coffee shop: minimal 60% – 65% gross margin.
                </p>
              </div>

              {/* Formula 6: Alignment Index */}
              <div className="p-3.5 bg-white border border-amber-200 rounded-lg shadow-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900">6. Indeks Penyelarasan Belanja</span>
                  <span className="font-mono text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">Rumus</span>
                </div>
                <div className="font-mono text-slate-800 bg-slate-50 p-2 rounded border border-slate-200 text-[11px]">
                  (COGS / Pembelian) × 100%
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  <strong>Ideal:</strong> 95% – 105% (Pengadaan selaras persis dengan pemakaian aktual). Di bawah 90% mengindikasikan over-stocking.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. Main Spreadsheet Table (Excel Format)                                  */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Control Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Filter className="w-3.5 h-3.5 text-amber-700" />
              <span>Filter Sheet:</span>
            </div>

            {/* Filter Periode */}
            <select
              value={filterPeriode}
              onChange={(e) => setFilterPeriode(e.target.value)}
              className="h-8 px-2 text-xs bg-white border border-slate-300 rounded-md text-slate-800 font-medium"
            >
              <option value="ALL">Semua Periode</option>
              {INITIAL_PERIODS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            {/* Filter Outlet */}
            <select
              value={filterOutlet}
              onChange={(e) => setFilterOutlet(e.target.value)}
              className="h-8 px-2 text-xs bg-white border border-slate-300 rounded-md text-slate-800 font-medium"
            >
              <option value="ALL">Semua Outlet</option>
              {INITIAL_OUTLETS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>

            {/* Filter Kategori */}
            <select
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              className="h-8 px-2 text-xs bg-white border border-slate-300 rounded-md text-slate-800 font-medium"
            >
              <option value="ALL">Semua Kategori</option>
              {INITIAL_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <span className="text-xs text-slate-400">
              {filteredData.length} baris data kategori
            </span>
          </div>

          <button
            onClick={onOpenAddForm}
            className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            + Tambah Analisa Kategori
          </button>
        </div>

        {/* Spreadsheet Table matching Image 3 */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              {/* Column letters row like Google Sheets */}
              <tr className="bg-amber-50/60 text-slate-500 font-mono text-[11px] text-center border-b border-amber-200">
                <th className="py-1 px-3 w-10 border-r border-slate-200 font-normal">#</th>
                <th className="py-1 px-3 border-r border-slate-200 font-normal">A</th>
                <th className="py-1 px-3 border-r border-slate-200 font-normal">B</th>
                <th className="py-1 px-3 border-r border-slate-200 font-normal">C</th>
                <th className="py-1 px-3 border-r border-slate-200 font-normal">D</th>
                <th className="py-1 px-3 border-r border-slate-200 font-normal">E</th>
                <th className="py-1 px-3 border-r border-slate-200 font-normal">F</th>
                <th className="py-1 px-3 border-r border-slate-200 font-normal">G</th>
                <th className="py-1 px-3 font-normal">Aksi</th>
              </tr>

              {/* Header row from screenshot 3: Orange/Brown with filter dropdown icons */}
              <tr className="border-b border-amber-900 text-white">
                <th className="py-3 px-3 bg-[#92400e] text-center font-mono border-r border-amber-900">1</th>
                <th className="py-3 px-4 bg-[#b45309] text-left font-bold border-r border-amber-800 whitespace-nowrap">
                  <div className="flex items-center justify-between gap-1">
                    <span>Periode</span>
                    <span className="text-[10px] opacity-75">▼</span>
                  </div>
                </th>
                <th className="py-3 px-4 bg-[#b45309] text-left font-bold border-r border-amber-800 whitespace-nowrap">
                  <div className="flex items-center justify-between gap-1">
                    <span>Outlet</span>
                    <span className="text-[10px] opacity-75">▼</span>
                  </div>
                </th>
                <th className="py-3 px-4 bg-[#b45309] text-left font-bold border-r border-amber-800 whitespace-nowrap">
                  <div className="flex items-center justify-between gap-1">
                    <span>Kategori</span>
                    <span className="text-[10px] opacity-75">▼</span>
                  </div>
                </th>
                <th className="py-3 px-4 bg-[#b45309] text-right font-bold border-r border-amber-800 whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Sales Kategori</span>
                    <span className="text-[10px] opacity-75">▼</span>
                  </div>
                </th>
                <th className="py-3 px-4 bg-[#b45309] text-right font-bold border-r border-amber-800 whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5">
                    <span>COGS / Penggunaan</span>
                    <span className="text-[10px] opacity-75">▼</span>
                  </div>
                </th>
                <th className="py-3 px-4 bg-[#b45309] text-right font-bold border-r border-amber-800 whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Pembelian</span>
                    <span className="text-[10px] opacity-75">▼</span>
                  </div>
                </th>
                <th className="py-3 px-4 bg-[#b45309] text-right font-bold border-r border-amber-800 whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Waste</span>
                    <span className="text-[10px] opacity-75">▼</span>
                  </div>
                </th>
                <th className="py-3 px-3 bg-[#b45309] text-center font-medium">
                  Opsi
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    Belum ada data analisa kategori untuk filter ini.
                  </td>
                </tr>
              ) : (
                filteredData.map((row, idx) => {
                  const isEditing = editingId === row.id;

                  if (isEditing) {
                    return (
                      <tr key={row.id} className="bg-amber-50">
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
                          <select
                            value={editForm.kategori}
                            onChange={(e) => setEditForm({ ...editForm, kategori: e.target.value })}
                            className="w-full h-8 px-2 bg-white border border-slate-300 rounded text-xs font-semibold"
                          >
                            {INITIAL_CATEGORIES.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-1 border-r border-slate-200">
                          <input
                            type="number"
                            value={editForm.salesKategori}
                            onChange={(e) => setEditForm({ ...editForm, salesKategori: Number(e.target.value) || 0 })}
                            className="w-full h-8 px-2 bg-white border border-slate-300 rounded text-xs font-mono text-right"
                          />
                        </td>
                        <td className="p-1 border-r border-slate-200">
                          <input
                            type="number"
                            value={editForm.cogsPenggunaan}
                            onChange={(e) => setEditForm({ ...editForm, cogsPenggunaan: Number(e.target.value) || 0 })}
                            className="w-full h-8 px-2 bg-white border border-slate-300 rounded text-xs font-mono text-right"
                          />
                        </td>
                        <td className="p-1 border-r border-slate-200">
                          <input
                            type="number"
                            value={editForm.pembelian}
                            onChange={(e) => setEditForm({ ...editForm, pembelian: Number(e.target.value) || 0 })}
                            className="w-full h-8 px-2 bg-white border border-slate-300 rounded text-xs font-mono text-right"
                          />
                        </td>
                        <td className="p-1 border-r border-slate-200">
                          <input
                            type="number"
                            value={editForm.waste}
                            onChange={(e) => setEditForm({ ...editForm, waste: Number(e.target.value) || 0 })}
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

                  const cogsRatio = row.salesKategori > 0 ? (row.cogsPenggunaan / row.salesKategori) * 100 : 0;
                  const purchaseRatio = row.salesKategori > 0 ? (row.pembelian / row.salesKategori) * 100 : 0;
                  const wasteRatio = row.salesKategori > 0 ? (row.waste / row.salesKategori) * 100 : 0;
                  const buffer = row.pembelian - row.cogsPenggunaan;
                  const benchmark = CATEGORY_BENCHMARKS[row.kategori];

                  return (
                    <tr key={row.id} className="hover:bg-amber-100/40 transition-colors">
                      {/* Row Index */}
                      <td className="py-2 px-3 text-center font-mono text-slate-400 bg-slate-50 border-r border-slate-200">
                        {idx + 2}
                      </td>

                      {/* A: Periode - Yellow Input */}
                      <td className="py-2 px-4 bg-[#fefce8] text-slate-900 font-medium border-r border-slate-200 whitespace-nowrap">
                        {row.periode}
                      </td>

                      {/* B: Outlet - Yellow Input */}
                      <td className="py-2 px-4 bg-[#fefce8] text-slate-900 font-bold border-r border-slate-200 whitespace-nowrap">
                        {row.outlet}
                      </td>

                      {/* C: Kategori - Yellow Input */}
                      <td className="py-2 px-4 bg-[#fefce8] text-slate-900 font-medium border-r border-slate-200 whitespace-nowrap">
                        <div className="flex items-center justify-between gap-1.5">
                          <span>{row.kategori}</span>
                          {benchmark && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({benchmark.label})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* D: Sales Kategori - Yellow Input */}
                      <td className="py-2 px-4 bg-[#fefce8] text-right font-mono tabular-nums text-slate-900 border-r border-slate-200 font-semibold">
                        {formatIDR(row.salesKategori, '')}
                      </td>

                      {/* E: COGS / Penggunaan - Yellow Input */}
                      <td className="py-2 px-4 bg-[#fefce8] text-right font-mono tabular-nums text-slate-900 border-r border-slate-200">
                        <div className="font-semibold">{formatIDR(row.cogsPenggunaan, '')}</div>
                        <div className="text-[10px] text-amber-800 font-sans font-medium flex items-center justify-end gap-1">
                          <span>{cogsRatio.toFixed(1)}% sales</span>
                          {benchmark && cogsRatio > benchmark.max && (
                            <span className="text-red-600 font-bold" title="Di atas target benchmark!">▲</span>
                          )}
                        </div>
                      </td>

                      {/* F: Pembelian - Yellow Input */}
                      <td className="py-2 px-4 bg-[#fefce8] text-right font-mono tabular-nums text-slate-900 border-r border-slate-200">
                        <div className="font-semibold">{formatIDR(row.pembelian, '')}</div>
                        <div className="text-[10px] text-slate-500 font-sans">
                          {purchaseRatio.toFixed(1)}% sales
                        </div>
                      </td>

                      {/* G: Waste - Yellow Input */}
                      <td className="py-2 px-4 bg-[#fefce8] text-right font-mono tabular-nums text-red-700 font-medium border-r border-slate-200">
                        <div className="font-bold">{formatIDR(row.waste, '')}</div>
                        <div className="text-[10px] text-slate-500 font-sans">
                          {wasteRatio.toFixed(2)}%
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-2 px-3 text-center bg-white whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => startEdit(row)}
                            className="p-1 text-slate-400 hover:text-amber-700 cursor-pointer"
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

            {/* Table Summary Footer - Per Periode & Outlet Specific Breakdown */}
            {filteredData.length > 0 && (
              <tfoot className="border-t-2 border-slate-300 bg-amber-50/60 font-semibold text-slate-900">
                {/* Total Ringkasan Akumulasi (Σ) */}
                <tr className="border-b border-amber-200">
                  <td className="py-2 px-3 text-center border-r border-slate-200 font-mono">Σ</td>
                  <td className="py-2 px-4 border-r border-slate-200">Total Akumulasi</td>
                  <td className="py-2 px-4 border-r border-slate-200">-</td>
                  <td className="py-2 px-4 border-r border-slate-200">{filteredData.length} Kategori</td>
                  <td className="py-2 px-4 text-right font-mono tabular-nums border-r border-slate-200">
                    {formatIDR(sumSales, '')}
                  </td>
                  <td className="py-2 px-4 text-right font-mono tabular-nums border-r border-slate-200">
                    {formatIDR(sumCOGS, '')}
                  </td>
                  <td className="py-2 px-4 text-right font-mono tabular-nums border-r border-slate-200">
                    {formatIDR(sumPembelian, '')}
                  </td>
                  <td className="py-2 px-4 text-right font-mono tabular-nums text-red-700 border-r border-slate-200">
                    {formatIDR(sumWaste, '')}
                  </td>
                  <td></td>
                </tr>

                {/* Individual Rasio Per Periode & Per Outlet (Uncombined!) */}
                {uniqueOutletPeriodPairs.map((p, pIdx) => (
                  <tr
                    key={p.key}
                    className={`text-[11px] font-normal border-b border-amber-200 ${
                      pIdx === 0 ? 'bg-amber-100/60 font-medium' : pIdx % 2 === 0 ? 'bg-amber-50/70' : 'bg-white'
                    }`}
                  >
                    <td colSpan={4} className="py-2 px-4 text-right font-semibold text-slate-800 border-r border-slate-200">
                      <span className="text-amber-900 font-bold">{p.periode}</span> · <span className="text-slate-900 font-bold">{p.outlet}</span> ({p.rowsCount} Kategori):
                    </td>
                    <td className="py-2 px-4 text-right font-mono text-slate-600 border-r border-slate-200">
                      100% Sales
                    </td>
                    <td className="py-2 px-4 text-right font-mono font-bold text-amber-900 border-r border-slate-200">
                      {p.cogsRatio.toFixed(1)}% COGS
                    </td>
                    <td className="py-2 px-4 text-right font-mono font-medium text-slate-800 border-r border-slate-200">
                      {p.purchaseRatio.toFixed(1)}% Beli
                    </td>
                    <td className="py-2 px-4 text-right font-mono text-red-700 font-medium border-r border-slate-200">
                      {p.wasteRatio.toFixed(2)}% Waste
                    </td>
                    <td className="py-2 px-2 text-center whitespace-nowrap">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          p.cogsRatio <= 35
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.cogsRatio <= 40
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. Panel Analisa & Kontrol Kategori per Periode & per Outlet             */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-700" />
                Matriks Analisa & Kontrol Kategori per Outlet dan Periode
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluasi spesifik margin, persentase COGS terhadap benchmark F&B, penyelarasan belanja, dan buffer per kategori.
              </p>
            </div>

            {/* Quick Segment Selector per (Periode & Outlet) */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">Pilih Laporan:</span>
              <select
                value={activeBoardKey}
                onChange={(e) => setActiveBoardKey(e.target.value)}
                className="h-8 px-2.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-bold"
              >
                <option value="ALL">Semua Laporan Cabang ({uniqueOutletPeriodPairs.length})</option>
                {uniqueOutletPeriodPairs.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.periode} · {p.outlet} ({p.rowsCount} Kat)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Category Detailed Intelligence Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Periode</th>
                <th className="py-2.5 px-3">Outlet Cabang</th>
                <th className="py-2.5 px-3">Kategori</th>
                <th className="py-2.5 px-3 text-right">Sales Kategori (% Share)</th>
                <th className="py-2.5 px-3 text-right">COGS / Pemakaian (% Ratio)</th>
                <th className="py-2.5 px-3 text-center">Benchmark F&B</th>
                <th className="py-2.5 px-3 text-right">Gross Margin (Rp & %)</th>
                <th className="py-2.5 px-3 text-right">Pembelian Bahan (% Belanja)</th>
                <th className="py-2.5 px-3 text-right">Buffer Beli vs Pakai</th>
                <th className="py-2.5 px-3 text-right">Waste (% Kerugian)</th>
                <th className="py-2.5 px-3 text-center">Analisa Purchasing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono tabular-nums">
              {selectedBoardReports.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400 font-sans">
                    Tidak ada data analisa kategori yang sesuai.
                  </td>
                </tr>
              ) : (
                selectedBoardReports.map((row) => {
                  const cogsRatio = row.salesKategori > 0 ? (row.cogsPenggunaan / row.salesKategori) * 100 : 0;
                  const purchaseRatio = row.salesKategori > 0 ? (row.pembelian / row.salesKategori) * 100 : 0;
                  const wasteRatio = row.salesKategori > 0 ? (row.waste / row.salesKategori) * 100 : 0;
                  const grossMargin = row.salesKategori - row.cogsPenggunaan;
                  const grossMarginRatio = row.salesKategori > 0 ? (grossMargin / row.salesKategori) * 100 : 0;
                  const buffer = row.pembelian - row.cogsPenggunaan;
                  const benchmark = CATEGORY_BENCHMARKS[row.kategori];

                  // Evaluate purchasing diagnosis
                  const isOverCogs = benchmark && cogsRatio > benchmark.max;
                  const isHighWaste = wasteRatio > 1.2;
                  const isOverPurchasing = buffer > (row.cogsPenggunaan * 0.15) && buffer > 2000000;

                  return (
                    <tr key={`${row.id}-intelligence`} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-sans font-bold text-slate-900">{row.periode}</td>
                      <td className="py-2.5 px-3 font-sans font-semibold text-blue-900 whitespace-nowrap">
                        {row.outlet}
                      </td>
                      <td className="py-2.5 px-3 font-sans font-bold text-slate-800 whitespace-nowrap">
                        {row.kategori}
                      </td>

                      {/* Sales */}
                      <td className="py-2.5 px-3 text-right font-medium text-slate-900">
                        <div>{formatIDR(row.salesKategori, '')}</div>
                        <div className="text-[10px] text-slate-500 font-sans">Omzet Kategori</div>
                      </td>

                      {/* COGS & % Ratio */}
                      <td className="py-2.5 px-3 text-right">
                        <div className="font-bold text-amber-950">{formatIDR(row.cogsPenggunaan, '')}</div>
                        <div className={`text-[10px] font-sans font-semibold ${
                          isOverCogs ? 'text-red-700' : 'text-emerald-700'
                        }`}>
                          {cogsRatio.toFixed(1)}% COGS
                        </div>
                      </td>

                      {/* Benchmark Target */}
                      <td className="py-2.5 px-3 text-center font-sans">
                        {benchmark ? (
                          <div>
                            <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                              {benchmark.label}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[10px]">Std ~35%</span>
                        )}
                      </td>

                      {/* Gross Margin */}
                      <td className="py-2.5 px-3 text-right">
                        <div className="font-semibold text-slate-800">{formatIDR(grossMargin, '')}</div>
                        <div className="text-[10px] font-sans text-emerald-700 font-medium">
                          {grossMarginRatio.toFixed(1)}% Margin
                        </div>
                      </td>

                      {/* Pembelian */}
                      <td className="py-2.5 px-3 text-right">
                        <div className="font-semibold text-slate-800">{formatIDR(row.pembelian, '')}</div>
                        <div className="text-[10px] font-sans text-slate-500">{purchaseRatio.toFixed(1)}% Belanja</div>
                      </td>

                      {/* Buffer Beli vs Pakai */}
                      <td className="py-2.5 px-3 text-right font-semibold">
                        <span className={buffer >= 0 ? 'text-blue-700' : 'text-red-700'}>
                          {buffer >= 0 ? `+${formatIDR(buffer)}` : formatIDR(buffer)}
                        </span>
                        <div className="text-[10px] text-slate-500 font-sans">
                          {buffer >= 0 ? 'Penambahan Stok' : 'Penyusutan'}
                        </div>
                      </td>

                      {/* Waste */}
                      <td className="py-2.5 px-3 text-right">
                        <div className="font-bold text-red-700">{formatIDR(row.waste, '')}</div>
                        <div className={`text-[10px] font-sans ${wasteRatio > 1.0 ? 'text-red-600 font-semibold' : 'text-slate-500'}`}>
                          {wasteRatio.toFixed(2)}% dari sales
                        </div>
                      </td>

                      {/* Diagnosis & Purchasing Recommendation */}
                      <td className="py-2.5 px-3 font-sans">
                        {isOverCogs ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded whitespace-nowrap">
                            <AlertTriangle className="w-3 h-3 text-red-600" />
                            <span>COGS &gt; Benchmark</span>
                          </span>
                        ) : isOverPurchasing ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded whitespace-nowrap">
                            <span>Over-Procurement</span>
                          </span>
                        ) : isHighWaste ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-800 bg-red-50 border border-red-200 px-2 py-0.5 rounded whitespace-nowrap">
                            <span>Waste &gt; 1.2%</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded whitespace-nowrap">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Optimal & Selaras</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
