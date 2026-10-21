import React from 'react';
import { ActiveSheetTab } from '../types';
import { FileSpreadsheet, PlusCircle, Download, Upload } from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveSheetTab;
  setActiveTab: (tab: ActiveSheetTab) => void;
  onOpenQuickEntry: () => void;
  onExportExcel: () => void;
  onImportExcel: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isCloudConnected?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenQuickEntry,
  onExportExcel,
  onImportExcel,
  isCloudConnected = false,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
              Kontrol COGS & Purchasing
            </span>
            <span className="hidden lg:inline text-xs font-medium text-slate-400 border-l border-slate-200 pl-3 whitespace-nowrap">
              Kopi Klan Multi-Outlet
            </span>
          </div>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap py-1 relative cursor-pointer ${
                activeTab === 'dashboard' ? 'text-slate-900 font-semibold border-b-2 border-slate-900' : ''
              }`}
            >
              Form Input Dinamis
            </button>
            <button
              onClick={() => setActiveTab('bulanan')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap py-1 relative cursor-pointer ${
                activeTab === 'bulanan' ? 'text-slate-900 font-semibold border-b-2 border-blue-900 text-blue-900' : ''
              }`}
            >
              Sheet Bulanan
            </button>
            <button
              onClick={() => setActiveTab('analisa_kategori')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap py-1 relative cursor-pointer ${
                activeTab === 'analisa_kategori' ? 'text-slate-900 font-semibold border-b-2 border-amber-800 text-amber-900' : ''
              }`}
            >
              Analisa Kategori
            </button>
            <button
              onClick={() => setActiveTab('log_waste')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap py-1 relative cursor-pointer ${
                activeTab === 'log_waste' ? 'text-slate-900 font-semibold border-b-2 border-red-800 text-red-900' : ''
              }`}
            >
              Sheet Log Waste
            </button>
            <button
              onClick={() => setActiveTab('reconciliation')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap py-1 relative cursor-pointer ${
                activeTab === 'reconciliation' ? 'text-slate-900 font-semibold border-b-2 border-emerald-800 text-emerald-900' : ''
              }`}
            >
              Ringkasan & Validasi
            </button>
          </nav>

          {/* Zone 3: Primary Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Live Cloud Status */}
            <div
              title={isCloudConnected ? "Tersambung ke Firebase Firestore Real-Time Cloud" : "Menghubungkan ke Cloud..."}
              className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
                isCloudConnected
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-amber-50 text-amber-800 border-amber-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isCloudConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span>{isCloudConnected ? 'Cloud Real-Time' : 'Menghubungkan...'}</span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={onImportExcel}
              accept=".xlsx, .xls, .csv"
              className="hidden"
            />
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Import file Excel Kontrol"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-slate-600" />
              <span>Import Excel</span>
            </button>

            <button
              type="button"
              onClick={onExportExcel}
              title="Download Kontrol_COGS_KOPIKLAN.xlsx"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export .xlsx</span>
            </button>

            <button
              type="button"
              onClick={onOpenQuickEntry}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap cursor-pointer shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>+ Entri Baru</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
