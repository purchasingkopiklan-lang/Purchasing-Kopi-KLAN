import React from 'react';
import { MonthlyReportEntry, CategoryAnalysisEntry, WasteLogEntry } from '../types';
import { formatIDR, formatPercent } from '../utils/formatters';
import { CheckCircle2, AlertCircle, RefreshCw, BarChart3 } from 'lucide-react';

interface CrossSheetReconciliationProps {
  monthlyData: MonthlyReportEntry[];
  categoryData: CategoryAnalysisEntry[];
  wasteData: WasteLogEntry[];
  onSyncWasteToCategory: () => void;
}

export const CrossSheetReconciliation: React.FC<CrossSheetReconciliationProps> = ({
  monthlyData,
  categoryData,
  wasteData,
  onSyncWasteToCategory,
}) => {
  // Aggregate data by unique (Outlet, Periode)
  const uniqueKeys = Array.from(
    new Set([
      ...monthlyData.map((m) => `${m.outlet}__${m.periode}`),
      ...categoryData.map((c) => `${c.outlet}__${c.periode}`),
      ...wasteData.map((w) => `${w.outlet}__${w.periode}`),
    ])
  );

  // Waste by Cause
  const wasteByCause = wasteData.reduce((acc, curr) => {
    acc[curr.penyebab] = (acc[curr.penyebab] || 0) + curr.nilaiWaste;
    return acc;
  }, {} as Record<string, number>);

  const sortedCauses = Object.entries(wasteByCause).sort((a, b) => b[1] - a[1]);
  const totalAllWaste = wasteData.reduce((acc, curr) => acc + curr.nilaiWaste, 0);

  // Waste by Outlet
  const wasteByOutlet = wasteData.reduce((acc, curr) => {
    acc[curr.outlet] = (acc[curr.outlet] || 0) + curr.nilaiWaste;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Top Banner & Sync Tool */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Validasi & Sinkronisasi Antar-Sheet
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Memeriksa konsistensi angka antara Sheet Bulanan (Total FnB), Sheet Analisa Kategori (COGS & Pembelian), dan Sheet Log Waste.
          </p>
        </div>

        <button
          onClick={onSyncWasteToCategory}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sinkronisasi Nilai Waste ke Kategori</span>
        </button>
      </div>

      {/* Cross-sheet Reconciliation Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Rekonsiliasi per Outlet & Periode
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Periode</th>
                <th className="py-2.5 px-3">Outlet</th>
                <th className="py-2.5 px-3 text-right">Pemakaian Sheet Bulanan</th>
                <th className="py-2.5 px-3 text-right">Total COGS Kategori</th>
                <th className="py-2.5 px-3 text-right">Pembelian Bulanan</th>
                <th className="py-2.5 px-3 text-right">Total Pembelian Kategori</th>
                <th className="py-2.5 px-3 text-right">Waste Kategori</th>
                <th className="py-2.5 px-3 text-right">Total Log Waste</th>
                <th className="py-2.5 px-3 text-center">Status Konsistensi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono tabular-nums">
              {uniqueKeys.map((key) => {
                const [outlet, periode] = key.split('__');
                const monthlyRow = monthlyData.find((m) => m.outlet === outlet && m.periode === periode);

                const catRows = categoryData.filter((c) => c.outlet === outlet && c.periode === periode);
                const sumCatCOGS = catRows.reduce((acc, c) => acc + c.cogsPenggunaan, 0);
                const sumCatPembelian = catRows.reduce((acc, c) => acc + c.pembelian, 0);
                const sumCatWaste = catRows.reduce((acc, c) => acc + c.waste, 0);

                const wasteRows = wasteData.filter((w) => w.outlet === outlet && w.periode === periode);
                const sumLogWaste = wasteRows.reduce((acc, w) => acc + w.nilaiWaste, 0);

                const monthlyPemakaian = monthlyRow ? monthlyRow.pemakaianFnB : 0;
                const monthlyPembelian = monthlyRow ? monthlyRow.pembelianBahanBaku : 0;

                const cogsDiff = Math.abs(monthlyPemakaian - sumCatCOGS);
                const purchaseDiff = Math.abs(monthlyPembelian - sumCatPembelian);
                const wasteDiff = Math.abs(sumCatWaste - sumLogWaste);

                const isConsistent = (!monthlyRow || (cogsDiff < 1000 && purchaseDiff < 1000)) && (catRows.length === 0 || wasteDiff < 1000);

                return (
                  <tr key={key} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-800">{periode}</td>
                    <td className="py-2.5 px-3 font-sans font-bold text-slate-900">{outlet}</td>
                    <td className="py-2.5 px-3 text-right text-slate-700">
                      {monthlyRow ? formatIDR(monthlyPemakaian, '') : <span className="text-slate-400 font-sans italic">Belum Ada</span>}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-700">
                      {catRows.length > 0 ? formatIDR(sumCatCOGS, '') : <span className="text-slate-400 font-sans italic">Belum Ada</span>}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-700">
                      {monthlyRow ? formatIDR(monthlyPembelian, '') : <span className="text-slate-400 font-sans italic">Belum Ada</span>}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-700">
                      {catRows.length > 0 ? formatIDR(sumCatPembelian, '') : <span className="text-slate-400 font-sans italic">Belum Ada</span>}
                    </td>
                    <td className="py-2.5 px-3 text-right text-red-700">
                      {formatIDR(sumCatWaste, '')}
                    </td>
                    <td className="py-2.5 px-3 text-right text-red-700 font-semibold">
                      {formatIDR(sumLogWaste, '')}
                    </td>
                    <td className="py-2.5 px-3 text-center font-sans">
                      {isConsistent ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Cocok</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Ada Selisih</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analytics Breakdown: Waste Pareto & Outlets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Waste Pareto by Cause */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-red-600" />
              Pareto Penyebab Waste (Root Cause)
            </h4>
            <span className="text-xs font-mono text-slate-500 font-semibold">
              Total: {formatIDR(totalAllWaste)}
            </span>
          </div>

          <div className="space-y-3">
            {sortedCauses.map(([cause, value]) => {
              const pct = totalAllWaste > 0 ? (value / totalAllWaste) * 100 : 0;
              return (
                <div key={cause}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-800">{cause}</span>
                    <span className="font-mono tabular-nums text-slate-600">
                      {formatIDR(value)} ({pct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-600 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(3, pct))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Waste Breakdown by Outlet */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
            Total Waste per Outlet
          </h4>

          <div className="space-y-3">
            {Object.entries(wasteByOutlet).map(([outlet, value]) => {
              const pct = totalAllWaste > 0 ? (value / totalAllWaste) * 100 : 0;
              return (
                <div key={outlet}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-800">{outlet}</span>
                    <span className="font-mono tabular-nums text-slate-600">
                      {formatIDR(value)} ({pct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-600 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(3, pct))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 leading-relaxed">
            <strong>Catatan Purchasing Officer:</strong> Outlet <strong>Beo</strong> memiliki nilai waste terbesar yang disebabkan oleh kerusakan showcase chiller pada Basque Burnt Cheesecake. Rekomendasi tindak lanjut: maintenance unit pendingin dan monitoring suhu harian.
          </div>
        </div>
      </div>
    </div>
  );
};
