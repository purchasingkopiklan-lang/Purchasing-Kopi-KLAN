import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { KPICards } from './components/KPICards';
import { DynamicInputForm } from './components/DynamicInputForm';
import { SheetBulananView } from './components/SheetBulananView';
import { SheetAnalisaKategoriView } from './components/SheetAnalisaKategoriView';
import { SheetLogWasteView } from './components/SheetLogWasteView';
import { CrossSheetReconciliation } from './components/CrossSheetReconciliation';
import { QuickEntryModal } from './components/QuickEntryModal';
import {
  MonthlyReportEntry,
  CategoryAnalysisEntry,
  WasteLogEntry,
  ActiveSheetTab,
  InputTargetSheet
} from './types';
import {
  INITIAL_MONTHLY_DATA,
  INITIAL_CATEGORY_DATA,
  INITIAL_WASTE_DATA,
  INITIAL_PERIODS,
  INITIAL_OUTLETS
} from './data/initialData';
import { exportToKontrolExcel, parseImportedExcel } from './utils/excelExport';
import { formatIDR } from './utils/formatters';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import {
  subscribeToMonthlyReports,
  subscribeToCategoryAnalysis,
  subscribeToWasteLogs,
  addMonthlyReportDoc,
  updateMonthlyReportDoc,
  deleteMonthlyReportDoc,
  addCategoryAnalysisDoc,
  addCategoryBatchDocs,
  updateCategoryAnalysisDoc,
  deleteCategoryAnalysisDoc,
  addWasteLogDoc,
  updateWasteLogDoc,
  deleteWasteLogDoc,
  initializeDatabaseIfEmpty
} from './services/firebaseService';
import { RotateCcw, Sparkles, CheckCircle2, Trash2 } from 'lucide-react';

const normalizeOutlet = (outlet: string): string => {
  if (!outlet) return 'KOPI KLAN CIHEULEUT';
  const lower = outlet.toLowerCase().trim();
  if (lower === 'beo' || lower === 'kopi klan beo') return 'KOPI KLAN BEO';
  if (lower === 'ciheuleut' || lower === 'kopi klan ciheuleut') return 'KOPI KLAN CIHEULEUT';
  if (lower.includes('pama') || lower === 'kopi klan pama persada') return 'KOPI KLAN PAMA PERSADA';
  if (lower.includes('kanitra') || lower === 'kopi klan x kanitra') return 'KOPI KLAN X KANITRA';
  return outlet;
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveSheetTab>('dashboard');
  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState(false);
  const [modalTargetSheet, setModalTargetSheet] = useState<InputTargetSheet>('bulanan');
  const [isCloudConnected, setIsCloudConnected] = useState(false);

  // Global filters
  const [selectedOutlet, setSelectedOutlet] = useState<string>('ALL');
  const [selectedPeriode, setSelectedPeriode] = useState<string>('ALL');

  // Primary data states with initial local seed
  const [monthlyData, setMonthlyData] = useState<MonthlyReportEntry[]>(INITIAL_MONTHLY_DATA);
  const [categoryData, setCategoryData] = useState<CategoryAnalysisEntry[]>(INITIAL_CATEGORY_DATA);
  const [wasteData, setWasteData] = useState<WasteLogEntry[]>(INITIAL_WASTE_DATA);

  // Subscribe to Firebase Firestore Real-Time Sync
  useEffect(() => {
    // 1. Initialize and seed cloud collections if empty
    initializeDatabaseIfEmpty().then(() => {
      setIsCloudConnected(true);
    }).catch((err) => {
      console.warn('Database initialization check:', err);
    });

    // 2. Real-time listener for Sheet Bulanan
    const unsubMonthly = subscribeToMonthlyReports((items) => {
      if (items && items.length > 0) {
        setMonthlyData(items.map((m) => ({ ...m, outlet: normalizeOutlet(m.outlet) })));
        setIsCloudConnected(true);
      }
    });

    // 3. Real-time listener for Sheet Analisa Kategori
    const unsubCategory = subscribeToCategoryAnalysis((items) => {
      if (items && items.length > 0) {
        setCategoryData(items.map((c) => ({ ...c, outlet: normalizeOutlet(c.outlet) })));
        setIsCloudConnected(true);
      }
    });

    // 4. Real-time listener for Sheet Log Waste
    const unsubWaste = subscribeToWasteLogs((items) => {
      if (items && items.length > 0) {
        setWasteData(items.map((w) => ({ ...w, outlet: normalizeOutlet(w.outlet) })));
        setIsCloudConnected(true);
      }
    });

    return () => {
      unsubMonthly();
      unsubCategory();
      unsubWaste();
    };
  }, []);

  // In-app Modal & Notification States (No window.confirm/alert)
  interface DeleteTarget {
    type: 'bulanan' | 'kategori' | 'waste' | 'reset';
    id: string;
    title: string;
    details?: { label: string; value: string }[];
  }
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handlers for Sheet Bulanan (Real-Time Cloud Save)
  const handleAddMonthly = async (entry: Omit<MonthlyReportEntry, 'id'>) => {
    try {
      await addMonthlyReportDoc(entry);
      showToast(`Data Bulanan ${entry.outlet} berhasil disimpan ke Cloud.`);
    } catch (e) {
      console.error('Failed to save to Firestore, updating local state', e);
      const newEntry: MonthlyReportEntry = { ...entry, id: `m-${Date.now()}` };
      setMonthlyData((prev) => [newEntry, ...prev]);
    }
  };

  const handleUpdateMonthly = async (id: string, updated: Partial<MonthlyReportEntry>) => {
    try {
      await updateMonthlyReportDoc(id, updated);
      showToast('Perubahan laporan bulanan berhasil diperbarui.');
    } catch (e) {
      console.error('Failed to update in Firestore, updating local state', e);
      setMonthlyData((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
      );
    }
  };

  const handleDeleteMonthly = (id: string) => {
    const item = monthlyData.find((m) => m.id === id);
    setDeleteTarget({
      type: 'bulanan',
      id,
      title: 'Hapus Laporan Bulanan Outlet',
      details: [
        { label: 'Outlet', value: item?.outlet || '-' },
        { label: 'Periode', value: item?.periode || '-' },
        { label: 'Total Sales Outlet', value: item ? formatIDR(item.totalSalesOutlet) : '-' },
        { label: 'Total HPP', value: item ? formatIDR(item.totalHPP) : '-' },
      ]
    });
  };

  // Handlers for Sheet Analisa Kategori (Real-Time Cloud Save)
  const handleAddCategory = async (entry: Omit<CategoryAnalysisEntry, 'id'>) => {
    try {
      await addCategoryAnalysisDoc(entry);
      showToast(`Analisa kategori ${entry.kategori} berhasil disimpan ke Cloud.`);
    } catch (e) {
      console.error('Failed to save category to Firestore, updating local state', e);
      const newEntry: CategoryAnalysisEntry = { ...entry, id: `c-${Date.now()}` };
      setCategoryData((prev) => [newEntry, ...prev]);
    }
  };

  const handleAddCategoryBatch = async (entries: Omit<CategoryAnalysisEntry, 'id'>[]) => {
    try {
      await addCategoryBatchDocs(entries);
      showToast(`${entries.length} baris kategori berhasil disimpan ke Cloud.`);
    } catch (e) {
      console.error('Failed to save batch to Firestore, updating local state', e);
      const newEntries: CategoryAnalysisEntry[] = entries.map((entry, idx) => ({
        ...entry,
        id: `c-${Date.now()}-${idx}`
      }));
      setCategoryData((prev) => [...newEntries, ...prev]);
    }
  };

  const handleUpdateCategory = async (id: string, updated: Partial<CategoryAnalysisEntry>) => {
    try {
      await updateCategoryAnalysisDoc(id, updated);
      showToast('Perubahan analisa kategori berhasil diperbarui.');
    } catch (e) {
      console.error('Failed to update category in Firestore, updating local state', e);
      setCategoryData((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
      );
    }
  };

  const handleDeleteCategory = (id: string) => {
    const item = categoryData.find((c) => c.id === id);
    setDeleteTarget({
      type: 'kategori',
      id,
      title: 'Hapus Baris Analisa Kategori',
      details: [
        { label: 'Outlet', value: item?.outlet || '-' },
        { label: 'Periode', value: item?.periode || '-' },
        { label: 'Kategori', value: item?.kategori || '-' },
        { label: 'Sales Kategori', value: item ? formatIDR(item.salesKategori) : '-' },
        { label: 'COGS', value: item ? formatIDR(item.cogsPenggunaan) : '-' },
      ]
    });
  };

  // Handlers for Sheet Log Waste (Real-Time Cloud Save)
  const handleAddWaste = async (entry: Omit<WasteLogEntry, 'id'>) => {
    try {
      await addWasteLogDoc(entry);
      showToast(`Log waste ${entry.itemBahanBaku} berhasil dicatat ke Cloud.`);
    } catch (e) {
      console.error('Failed to save waste log to Firestore, updating local state', e);
      const newEntry: WasteLogEntry = { ...entry, id: `w-${Date.now()}` };
      setWasteData((prev) => [newEntry, ...prev]);
    }
  };

  const handleUpdateWaste = async (id: string, updated: Partial<WasteLogEntry>) => {
    try {
      await updateWasteLogDoc(id, updated);
      showToast('Status log waste berhasil diperbarui.');
    } catch (e) {
      console.error('Failed to update waste log in Firestore, updating local state', e);
      setWasteData((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
      );
    }
  };

  const handleDeleteWaste = (id: string) => {
    const item = wasteData.find((w) => w.id === id);
    setDeleteTarget({
      type: 'waste',
      id,
      title: 'Hapus Catatan Log Waste',
      details: [
        { label: 'Tanggal', value: item?.tanggal || '-' },
        { label: 'Outlet', value: item?.outlet || '-' },
        { label: 'Item Bahan Baku', value: item?.itemBahanBaku || '-' },
        { label: 'Nilai Kerugian Waste', value: item ? formatIDR(item.nilaiWaste) : '-' },
        { label: 'Status', value: item?.status || '-' },
      ]
    });
  };

  // Execute Deletion Confirm
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      if (deleteTarget.type === 'bulanan') {
        // Optimistic UI update immediately
        setMonthlyData((prev) => prev.filter((item) => item.id !== deleteTarget.id));
        await deleteMonthlyReportDoc(deleteTarget.id);
        showToast('Baris Laporan Bulanan berhasil dihapus dari Cloud.');
      } else if (deleteTarget.type === 'kategori') {
        // Optimistic UI update immediately
        setCategoryData((prev) => prev.filter((item) => item.id !== deleteTarget.id));
        await deleteCategoryAnalysisDoc(deleteTarget.id);
        showToast('Baris Analisa Kategori berhasil dihapus dari Cloud.');
      } else if (deleteTarget.type === 'waste') {
        // Optimistic UI update immediately
        setWasteData((prev) => prev.filter((item) => item.id !== deleteTarget.id));
        await deleteWasteLogDoc(deleteTarget.id);
        showToast('Catatan Log Waste berhasil dihapus dari Cloud.');
      } else if (deleteTarget.type === 'reset') {
        setMonthlyData(INITIAL_MONTHLY_DATA);
        setCategoryData(INITIAL_CATEGORY_DATA);
        setWasteData(INITIAL_WASTE_DATA);
        showToast('Data berhasil dikembalikan ke template awal.');
      }
    } catch (e) {
      console.error('Failed to delete from Firestore:', e);
      showToast('Data telah dihapus dari tampilan.');
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  // Sync Waste from Log Waste to Category Sheet (With Cloud Update)
  const handleSyncWasteToCategory = async () => {
    let updatedCount = 0;
    for (const cat of categoryData) {
      const matchingWaste = wasteData.filter(
        (w) =>
          w.outlet.toLowerCase() === cat.outlet.toLowerCase() &&
          w.periode.toLowerCase() === cat.periode.toLowerCase() &&
          w.kategori.toLowerCase() === cat.kategori.toLowerCase()
      );
      if (matchingWaste.length > 0) {
        const sumWaste = matchingWaste.reduce((acc, curr) => acc + curr.nilaiWaste, 0);
        if (sumWaste !== cat.waste) {
          updatedCount++;
          await updateCategoryAnalysisDoc(cat.id, { waste: sumWaste });
        }
      }
    }
    showToast(`Sinkronisasi selesai! ${updatedCount} kategori diperbarui berdasarkan Sheet Log Waste di Cloud.`);
  };

  // Reset to initial seed data
  const handleResetTemplate = () => {
    setDeleteTarget({
      type: 'reset',
      id: 'template_reset',
      title: 'Kembalikan ke Contoh Data Awal Excel',
      details: [
        { label: 'Tindakan', value: 'Reset ke Data Awal 4 Outlet' },
        { label: 'Peringatan', value: 'Data baru akan digantikan contoh awal' }
      ]
    });
  };

  // Export to Excel
  const handleExportExcel = () => {
    exportToKontrolExcel(
      monthlyData,
      categoryData,
      wasteData,
      'Kontrol_COGS_KOPIKLAN.xlsx'
    );
  };

  // Import from Excel with Cloud Sync
  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseImportedExcel(file);
      let count = 0;
      if (parsed.monthly && parsed.monthly.length > 0) {
        for (const m of parsed.monthly) {
          await addMonthlyReportDoc(m);
        }
        count += parsed.monthly.length;
      }
      if (parsed.category && parsed.category.length > 0) {
        await addCategoryBatchDocs(parsed.category);
        count += parsed.category.length;
      }
      if (parsed.waste && parsed.waste.length > 0) {
        for (const w of parsed.waste) {
          await addWasteLogDoc(w);
        }
        count += parsed.waste.length;
      }
      showToast(`Berhasil mengimpor dan menyinkronkan ${count} baris data ke Cloud dari file "${file.name}"!`);
    } catch (err: any) {
      showToast(`Gagal membaca file Excel: ${err?.message || 'Format tidak valid'}`);
    }
    e.target.value = '';
  };

  // Quick action from sheet views
  const handleOpenAddForTarget = (target: InputTargetSheet) => {
    setModalTargetSheet(target);
    setIsQuickEntryOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col">
      {/* Navbar adhering to Top Bar Contract */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickEntry={() => {
          if (activeTab === 'bulanan') setModalTargetSheet('bulanan');
          else if (activeTab === 'analisa_kategori') setModalTargetSheet('analisa_kategori');
          else if (activeTab === 'log_waste') setModalTargetSheet('log_waste');
          else setModalTargetSheet('bulanan');
          setIsQuickEntryOpen(true);
        }}
        onExportExcel={handleExportExcel}
        onImportExcel={handleImportExcel}
        isCloudConnected={isCloudConnected}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Breadcrumb & Contextual Information */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>Purchasing Officer</span>
              <span aria-hidden="true">·</span>
              <span>Report Bulanan Outlet</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-slate-700">Kontrol_COGS_KOPIKLAN</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {activeTab === 'dashboard' && 'Dashboard Input Dinamis & Multi-Sheet'}
              {activeTab === 'bulanan' && 'Sheet Bulanan (COGS & Sales Outlet)'}
              {activeTab === 'analisa_kategori' && 'Sheet Analisa Kategori'}
              {activeTab === 'log_waste' && 'Sheet Log Waste Bahan Baku'}
              {activeTab === 'reconciliation' && 'Ringkasan, Validasi & Analisis Waste'}
            </h1>
          </div>

          {/* Quick Filter & Reset Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedOutlet}
              onChange={(e) => setSelectedOutlet(e.target.value)}
              style={{
                height: '36px',
                width: '168.5px',
                backgroundColor: '#0013ff',
                color: '#ffffff',
              }}
              className="px-3 text-xs border border-blue-700 rounded-lg font-medium cursor-pointer"
            >
              <option value="ALL" className="text-slate-900 bg-white">Semua Outlet (Global)</option>
              {INITIAL_OUTLETS.map((o) => (
                <option key={o} value={o} className="text-slate-900 bg-white">{o}</option>
              ))}
            </select>

            <select
              value={selectedPeriode}
              onChange={(e) => setSelectedPeriode(e.target.value)}
              style={{
                color: '#ffffff',
                backgroundColor: '#ffd200',
                width: '130.5px',
                height: '36px',
              }}
              className="px-3 text-xs border border-amber-400 rounded-lg font-medium cursor-pointer"
            >
              <option value="ALL" className="text-slate-900 bg-white">Semua Periode</option>
              {INITIAL_PERIODS.map((p) => (
                <option key={p} value={p} className="text-slate-900 bg-white">{p}</option>
              ))}
            </select>

            <button
              onClick={handleResetTemplate}
              title="Reset data ke template default screenshot"
              className="h-9 px-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-600 rounded-lg text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Reset Sample</span>
            </button>
          </div>
        </div>

        {/* Global KPI Cards Strip */}
        <KPICards
          monthlyData={monthlyData}
          wasteData={wasteData}
          categoryData={categoryData}
          selectedOutletFilter={selectedOutlet}
          selectedPeriodeFilter={selectedPeriode}
        />

        {/* Dynamic Tab Switcher Bar for Mobile & Quick Switching */}
        <div className="flex items-center gap-1 mb-6 p-1 bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Form Input Dinamis
          </button>
          <button
            onClick={() => setActiveTab('bulanan')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'bulanan'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-blue-900 hover:bg-blue-50'
            }`}
          >
            Sheet Bulanan ({monthlyData.length})
          </button>
          <button
            onClick={() => setActiveTab('analisa_kategori')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'analisa_kategori'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'text-amber-900 hover:bg-amber-50'
            }`}
          >
            Analisa Kategori ({categoryData.length})
          </button>
          <button
            onClick={() => setActiveTab('log_waste')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'log_waste'
                ? 'bg-red-800 text-white shadow-xs'
                : 'text-red-900 hover:bg-red-50'
            }`}
          >
            Sheet Log Waste ({wasteData.length})
          </button>
          <button
            onClick={() => setActiveTab('reconciliation')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'reconciliation'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-emerald-900 hover:bg-emerald-50'
            }`}
          >
            Ringkasan & Validasi
          </button>
        </div>

        {/* Tab Viewport Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <DynamicInputForm
              defaultTargetSheet="bulanan"
              onAddMonthly={handleAddMonthly}
              onAddCategory={handleAddCategory}
              onAddWaste={handleAddWaste}
              onAddCategoryBatch={handleAddCategoryBatch}
              onNavigateToSheet={(tab) => setActiveTab(tab)}
              monthlyData={monthlyData}
              categoryData={categoryData}
              wasteData={wasteData}
              onDeleteMonthly={handleDeleteMonthly}
              onDeleteCategory={handleDeleteCategory}
              onDeleteWaste={handleDeleteWaste}
            />

            {/* Quick overview of latest entries across all 3 sheets */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Bulanan */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                    Entri Sheet Bulanan Terkini
                  </h4>
                  <button
                    onClick={() => setActiveTab('bulanan')}
                    className="text-xs text-blue-700 hover:underline font-semibold cursor-pointer"
                  >
                    Buka Sheet →
                  </button>
                </div>
                <div className="divide-y divide-slate-100 mt-2">
                  {monthlyData.slice(0, 3).map((item) => (
                    <div key={item.id} className="py-2.5 text-xs flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-bold text-slate-800 truncate">
                          {item.outlet} · <span className="font-normal text-slate-500">{item.periode}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Pemakaian: Rp {item.pemakaianFnB.toLocaleString('id-ID')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right font-mono tabular-nums">
                          <div className="font-bold text-blue-900">
                            Rp {item.totalHPP.toLocaleString('id-ID')}
                          </div>
                          <div className="text-[10px] text-slate-500">Total HPP</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteMonthly(item.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-red-200"
                          title="Hapus entri bulanan ini"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Kategori */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                    Analisa Kategori Terkini
                  </h4>
                  <button
                    onClick={() => setActiveTab('analisa_kategori')}
                    className="text-xs text-amber-800 hover:underline font-semibold cursor-pointer"
                  >
                    Buka Sheet →
                  </button>
                </div>
                <div className="divide-y divide-slate-100 mt-2">
                  {categoryData.slice(0, 3).map((item) => (
                    <div key={item.id} className="py-2.5 text-xs flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-bold text-slate-800 truncate">
                          {item.kategori} · <span className="font-normal text-slate-500">{item.outlet}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">{item.periode}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right font-mono tabular-nums">
                          <div className="font-bold text-amber-800">
                            Rp {item.cogsPenggunaan.toLocaleString('id-ID')}
                          </div>
                          <div className="text-[10px] text-slate-500">COGS</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(item.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-red-200"
                          title="Hapus analisa kategori ini"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Waste */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-xs font-bold text-red-900 uppercase tracking-wider">
                    Log Waste Terkini
                  </h4>
                  <button
                    onClick={() => setActiveTab('log_waste')}
                    className="text-xs text-red-800 hover:underline font-semibold cursor-pointer"
                  >
                    Buka Sheet →
                  </button>
                </div>
                <div className="divide-y divide-slate-100 mt-2">
                  {wasteData.slice(0, 3).map((item) => (
                    <div key={item.id} className="py-2.5 text-xs flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-bold text-slate-800 truncate">{item.itemBahanBaku}</div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {item.outlet} · {item.qtyWaste} {item.satuan} ({item.penyebab})
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right font-mono tabular-nums">
                          <div className="font-bold text-red-700">
                            Rp {item.nilaiWaste.toLocaleString('id-ID')}
                          </div>
                          <span className="text-[10px] font-bold text-red-700 bg-red-50 px-1 py-0.2 rounded">
                            {item.status}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteWaste(item.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-red-200"
                          title="Hapus catatan waste ini"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bulanan' && (
          <SheetBulananView
            data={monthlyData}
            onUpdate={handleUpdateMonthly}
            onDelete={handleDeleteMonthly}
            onOpenAddForm={() => handleOpenAddForTarget('bulanan')}
            onAddMonthly={handleAddMonthly}
          />
        )}

        {activeTab === 'analisa_kategori' && (
          <SheetAnalisaKategoriView
            data={categoryData}
            onUpdate={handleUpdateCategory}
            onDelete={handleDeleteCategory}
            onOpenAddForm={() => handleOpenAddForTarget('analisa_kategori')}
          />
        )}

        {activeTab === 'log_waste' && (
          <SheetLogWasteView
            data={wasteData}
            onUpdate={handleUpdateWaste}
            onDelete={handleDeleteWaste}
            onOpenAddForm={() => handleOpenAddForTarget('log_waste')}
          />
        )}

        {activeTab === 'reconciliation' && (
          <CrossSheetReconciliation
            monthlyData={monthlyData}
            categoryData={categoryData}
            wasteData={wasteData}
            onSyncWasteToCategory={handleSyncWasteToCategory}
          />
        )}
      </main>

      {/* Quick Entry Modal */}
      <QuickEntryModal
        isOpen={isQuickEntryOpen}
        onClose={() => setIsQuickEntryOpen(false)}
        defaultTargetSheet={modalTargetSheet}
        onAddMonthly={handleAddMonthly}
        onAddCategory={handleAddCategory}
        onAddWaste={handleAddWaste}
        onAddCategoryBatch={handleAddCategoryBatch}
        onNavigateToSheet={(tab) => {
          setActiveTab(tab);
          setIsQuickEntryOpen(false);
        }}
        monthlyData={monthlyData}
        categoryData={categoryData}
        wasteData={wasteData}
        onDeleteMonthly={handleDeleteMonthly}
        onDeleteCategory={handleDeleteCategory}
        onDeleteWaste={handleDeleteWaste}
      />

      {/* In-app Confirm Delete Modal (Iframe-safe, no window.confirm) */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title={deleteTarget?.title || 'Konfirmasi Hapus Data'}
        message="Data yang dihapus akan langsung hilang dari tabel dashboard dan server Cloud Firestore secara permanen."
        details={deleteTarget?.details}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isDeleting={isDeleting}
      />

      {/* Floating In-App Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-lg border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Simple Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span>Kontrol COGS, HPP, Pembelian & Waste</span>
            <span aria-hidden="true"> · </span>
            <span>Format Excel Kontrol_COGS_HPP_Pembelian_Waste.xlsx</span>
          </div>
          <div>
            <span>Didesain untuk Purchasing Officer Kopi Klan</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
