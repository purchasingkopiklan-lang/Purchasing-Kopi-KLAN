import React from 'react';
import { DynamicInputForm } from './DynamicInputForm';
import {
  MonthlyReportEntry,
  CategoryAnalysisEntry,
  WasteLogEntry,
  InputTargetSheet,
  ActiveSheetTab
} from '../types';
import { X } from 'lucide-react';

interface QuickEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTargetSheet: InputTargetSheet;
  onAddMonthly: (entry: Omit<MonthlyReportEntry, 'id'>) => void;
  onAddCategory: (entry: Omit<CategoryAnalysisEntry, 'id'>) => void;
  onAddWaste: (entry: Omit<WasteLogEntry, 'id'>) => void;
  onAddCategoryBatch: (entries: Omit<CategoryAnalysisEntry, 'id'>[]) => void;
  onNavigateToSheet: (tab: ActiveSheetTab) => void;
  monthlyData?: MonthlyReportEntry[];
  categoryData?: CategoryAnalysisEntry[];
  wasteData?: WasteLogEntry[];
  onDeleteMonthly?: (id: string) => void;
  onDeleteCategory?: (id: string) => void;
  onDeleteWaste?: (id: string) => void;
}

export const QuickEntryModal: React.FC<QuickEntryModalProps> = ({
  isOpen,
  onClose,
  defaultTargetSheet,
  onAddMonthly,
  onAddCategory,
  onAddWaste,
  onAddCategoryBatch,
  onNavigateToSheet,
  monthlyData = [],
  categoryData = [],
  wasteData = [],
  onDeleteMonthly,
  onDeleteCategory,
  onDeleteWaste
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <h3 className="text-sm font-bold text-slate-900">
              Formulir Dinamis Entri Kontrol COGS & Waste
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-2 sm:p-4 max-h-[80vh] overflow-y-auto">
          <DynamicInputForm
            defaultTargetSheet={defaultTargetSheet}
            onAddMonthly={(entry) => {
              onAddMonthly(entry);
            }}
            onAddCategory={(entry) => {
              onAddCategory(entry);
            }}
            onAddWaste={(entry) => {
              onAddWaste(entry);
            }}
            onAddCategoryBatch={(entries) => {
              onAddCategoryBatch(entries);
            }}
            onNavigateToSheet={(tab) => {
              onNavigateToSheet(tab);
              onClose();
            }}
            monthlyData={monthlyData}
            categoryData={categoryData}
            wasteData={wasteData}
            onDeleteMonthly={onDeleteMonthly}
            onDeleteCategory={onDeleteCategory}
            onDeleteWaste={onDeleteWaste}
          />
        </div>
      </div>
    </div>
  );
};
