import React, { useState } from 'react';
import { WasteLogEntry, WasteStatus, WasteUnit, WasteCause, WastePIC } from '../types';
import { formatIDR, formatDateToExcelStyle } from '../utils/formatters';
import {
  INITIAL_PERIODS,
  INITIAL_OUTLETS,
  INITIAL_CATEGORIES,
  INITIAL_UNITS,
  INITIAL_CAUSES,
  INITIAL_PICS
} from '../data/initialData';
import { Edit2, Trash2, Check, X, Filter } from 'lucide-react';

interface SheetLogWasteViewProps {
  data: WasteLogEntry[];
  onUpdate: (id: string, updated: Partial<WasteLogEntry>) => void;
  onDelete: (id: string) => void;
  onOpenAddForm: () => void;
}

export const SheetLogWasteView: React.FC<SheetLogWasteViewProps> = ({
  data,
  onUpdate,
  onDelete,
  onOpenAddForm
}) => {
  const [filterOutlet, setFilterOutlet] = useState<string>('ALL');
  const [filterPeriode, setFilterPeriode] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<WasteLogEntry>>({});

  const filteredData = data.filter((item) => {
    const matchOutlet = filterOutlet === 'ALL' || item.outlet === filterOutlet;
    const matchPeriod = filterPeriode === 'ALL' || item.periode === filterPeriode;
    const matchStatus = filterStatus === 'ALL' || item.status === filterStatus;
    return matchOutlet && matchPeriod && matchStatus;
  });

  const startEdit = (row: WasteLogEntry) => {
    setEditingId(row.id);
    setEditForm({ ...row });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = (id: string) => {
    const qty = Number(editForm.qtyWaste) || 0;
    const harga = Number(editForm.hargaUnit) || 0;
    const nilaiWaste = qty * harga;
    onUpdate(id, {
      ...editForm,
      nilaiWaste
    });
    setEditingId(null);
  };

  const handleQuickStatusChange = (id: string, nextStatus: WasteStatus) => {
    onUpdate(id, { status: nextStatus });
  };

  const totalNilaiWaste = filteredData.reduce((acc, r) => acc + r.nilaiWaste, 0);
  const totalQtyWaste = filteredData.reduce((acc, r) => acc + r.qtyWaste, 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Control Toolbar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <Filter className="w-3.5 h-3.5 text-red-700" />
            <span>Filter Log Waste:</span>
          </div>

          {/* Filter Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-8 px-2 text-xs bg-white border border-slate-300 rounded-md font-semibold text-red-900"
          >
            <option value="ALL">Semua Status</option>
            <option value="OPEN">OPEN</option>
            <option value="INVESTIGATING">INVESTIGATING</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="CLOSED">CLOSED</option>
          </select>

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
            {filteredData.length} catatan insiden waste
          </span>
        </div>

        <button
          onClick={onOpenAddForm}
          className="px-3 py-1.5 bg-red-800 hover:bg-red-900 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
        >
          + Tambah Log Waste
        </button>
      </div>

      {/* Spreadsheet Table matching Image 2 */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            {/* Column letters */}
            <tr className="bg-slate-100 text-slate-500 font-mono text-[11px] text-center border-b border-slate-200">
              <th className="py-1 px-2 w-8 border-r border-slate-200 font-normal">#</th>
              <th className="py-1 px-3 border-r border-slate-200 font-normal">A</th>
              <th className="py-1 px-3 border-r border-slate-200 font-normal">B</th>
              <th className="py-1 px-3 border-r border-slate-200 font-normal">C</th>
              <th className="py-1 px-3 border-r border-slate-200 font-normal">D</th>
              <th className="py-1 px-3 border-r border-slate-200 font-normal">E</th>
              <th className="py-1 px-2 border-r border-slate-200 font-normal">F</th>
              <th className="py-1 px-2 border-r border-slate-200 font-normal">G</th>
              <th className="py-1 px-3 border-r border-slate-200 font-normal">H</th>
              <th className="py-1 px-3 border-r border-slate-200 font-normal bg-red-100 text-red-900 font-bold">I</th>
              <th className="py-1 px-3 border-r border-slate-200 font-normal">J</th>
              <th className="py-1 px-3 border-r border-slate-200 font-normal">K</th>
              <th className="py-1 px-2 border-r border-slate-200 font-normal">L</th>
              <th className="py-1 px-3 border-r border-slate-200 font-normal">M</th>
              <th className="py-1 px-2 font-normal">Aksi</th>
            </tr>

            {/* Header row from screenshot 2: Red / Crimson with white bold text */}
            <tr className="border-b border-red-950 text-white">
              <th className="py-3 px-2 bg-[#7f1d1d] text-center font-mono border-r border-red-900">1</th>
              <th className="py-3 px-3 bg-[#991b1b] text-left font-bold border-r border-red-900 whitespace-nowrap">
                Tanggal
              </th>
              <th className="py-3 px-3 bg-[#991b1b] text-left font-bold border-r border-red-900 whitespace-nowrap">
                Periode
              </th>
              <th className="py-3 px-3 bg-[#991b1b] text-left font-bold border-r border-red-900 whitespace-nowrap">
                Outlet
              </th>
              <th className="py-3 px-3 bg-[#991b1b] text-left font-bold border-r border-red-900 whitespace-nowrap">
                Kategori
              </th>
              <th className="py-3 px-4 bg-[#991b1b] text-left font-bold border-r border-red-900 whitespace-nowrap">
                Item Bahan Baku
              </th>
              <th className="py-3 px-2 bg-[#991b1b] text-center font-bold border-r border-red-900 whitespace-nowrap">
                Satuan
              </th>
              <th className="py-3 px-3 bg-[#991b1b] text-right font-bold border-r border-red-900 whitespace-nowrap">
                Qty Waste
              </th>
              <th className="py-3 px-3 bg-[#991b1b] text-right font-bold border-r border-red-900 whitespace-nowrap">
                Harga/Unit
              </th>
              <th className="py-3 px-4 bg-white text-red-900 text-right font-bold border-r border-slate-300 whitespace-nowrap">
                Nilai Waste
              </th>
              <th className="py-3 px-3 bg-[#991b1b] text-left font-bold border-r border-red-900 whitespace-nowrap">
                Penyebab
              </th>
              <th className="py-3 px-4 bg-[#991b1b] text-left font-bold border-r border-red-900 whitespace-nowrap">
                Tindakan Koreksi
              </th>
              <th className="py-3 px-3 bg-[#991b1b] text-left font-bold border-r border-red-900 whitespace-nowrap">
                PIC
              </th>
              <th className="py-3 px-3 bg-[#991b1b] text-center font-bold border-r border-red-900 whitespace-nowrap">
                Status
              </th>
              <th className="py-3 px-2 bg-[#991b1b] text-center font-medium">
                Opsi
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={15} className="py-10 text-center text-slate-400">
                  Belum ada log waste tercatat untuk filter ini.
                </td>
              </tr>
            ) : (
              filteredData.map((row, idx) => {
                const isEditing = editingId === row.id;

                if (isEditing) {
                  const currentQty = Number(editForm.qtyWaste) || 0;
                  const currentHarga = Number(editForm.hargaUnit) || 0;
                  const liveNilai = currentQty * currentHarga;

                  return (
                    <tr key={row.id} className="bg-red-50/50">
                      <td className="py-2 px-2 text-center font-mono text-slate-400 border-r border-slate-200">
                        {idx + 2}
                      </td>
                      <td className="p-1 border-r border-slate-200">
                        <input
                          type="date"
                          value={editForm.tanggal}
                          onChange={(e) => setEditForm({ ...editForm, tanggal: e.target.value })}
                          className="w-full h-8 px-1 bg-white border border-slate-300 rounded text-xs"
                        />
                      </td>
                      <td className="p-1 border-r border-slate-200">
                        <select
                          value={editForm.periode}
                          onChange={(e) => setEditForm({ ...editForm, periode: e.target.value })}
                          className="w-full h-8 px-1 bg-white border border-slate-300 rounded text-xs"
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
                          className="w-full h-8 px-1 bg-white border border-slate-300 rounded text-xs"
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
                          className="w-full h-8 px-1 bg-white border border-slate-300 rounded text-xs"
                        >
                          {INITIAL_CATEGORIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-1 border-r border-slate-200">
                        <input
                          type="text"
                          value={editForm.itemBahanBaku}
                          onChange={(e) => setEditForm({ ...editForm, itemBahanBaku: e.target.value })}
                          className="w-full h-8 px-2 bg-white border border-slate-300 rounded text-xs font-medium"
                        />
                      </td>
                      <td className="p-1 border-r border-slate-200">
                        <select
                          value={editForm.satuan}
                          onChange={(e) => setEditForm({ ...editForm, satuan: e.target.value as WasteUnit })}
                          className="w-full h-8 px-1 bg-white border border-slate-300 rounded text-xs"
                        >
                          {INITIAL_UNITS.map((u) => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-1 border-r border-slate-200">
                        <input
                          type="number"
                          step="any"
                          value={editForm.qtyWaste}
                          onChange={(e) => setEditForm({ ...editForm, qtyWaste: Number(e.target.value) || 0 })}
                          className="w-full h-8 px-1 bg-white border border-slate-300 rounded text-xs font-mono text-right"
                        />
                      </td>
                      <td className="p-1 border-r border-slate-200">
                        <input
                          type="number"
                          value={editForm.hargaUnit}
                          onChange={(e) => setEditForm({ ...editForm, hargaUnit: Number(e.target.value) || 0 })}
                          className="w-full h-8 px-1 bg-white border border-slate-300 rounded text-xs font-mono text-right"
                        />
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-red-900 border-r border-slate-200">
                        {formatIDR(liveNilai, '')}
                      </td>
                      <td className="p-1 border-r border-slate-200">
                        <select
                          value={editForm.penyebab}
                          onChange={(e) => setEditForm({ ...editForm, penyebab: e.target.value as WasteCause })}
                          className="w-full h-8 px-1 bg-white border border-slate-300 rounded text-xs"
                        >
                          {INITIAL_CAUSES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-1 border-r border-slate-200">
                        <input
                          type="text"
                          value={editForm.tindakanKoreksi}
                          onChange={(e) => setEditForm({ ...editForm, tindakanKoreksi: e.target.value })}
                          className="w-full h-8 px-2 bg-white border border-slate-300 rounded text-xs"
                        />
                      </td>
                      <td className="p-1 border-r border-slate-200">
                        <select
                          value={editForm.pic}
                          onChange={(e) => setEditForm({ ...editForm, pic: e.target.value as WastePIC })}
                          className="w-full h-8 px-1 bg-white border border-slate-300 rounded text-xs"
                        >
                          {INITIAL_PICS.map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-1 border-r border-slate-200">
                        <select
                          value={editForm.status}
                          onChange={(e) => setEditForm({ ...editForm, status: e.target.value as WasteStatus })}
                          className="w-full h-8 px-1 bg-white border border-slate-300 rounded text-xs font-bold"
                        >
                          <option value="OPEN">OPEN</option>
                          <option value="INVESTIGATING">INVESTIGATING</option>
                          <option value="RESOLVED">RESOLVED</option>
                          <option value="CLOSED">CLOSED</option>
                        </select>
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
                  <tr key={row.id} className="hover:bg-red-50/30 transition-colors">
                    {/* Row Index */}
                    <td className="py-2 px-2 text-center font-mono text-slate-400 bg-slate-50 border-r border-slate-200">
                      {idx + 2}
                    </td>

                    {/* A: Tanggal - Yellow Input */}
                    <td className="py-2 px-3 bg-[#fefce8] text-slate-900 border-r border-slate-200 whitespace-nowrap">
                      {formatDateToExcelStyle(row.tanggal)}
                    </td>

                    {/* B: Periode */}
                    <td className="py-2 px-3 bg-white text-slate-700 border-r border-slate-200 whitespace-nowrap">
                      {row.periode}
                    </td>

                    {/* C: Outlet - Yellow Input */}
                    <td className="py-2 px-3 bg-[#fefce8] text-slate-900 font-semibold border-r border-slate-200 whitespace-nowrap">
                      <div className="flex items-center justify-between gap-1">
                        <span>{row.outlet}</span>
                        <span className="text-[10px] text-amber-600">▼</span>
                      </div>
                    </td>

                    {/* D: Kategori - Yellow Input */}
                    <td className="py-2 px-3 bg-[#fefce8] text-slate-900 border-r border-slate-200 whitespace-nowrap">
                      <div className="flex items-center justify-between gap-1">
                        <span>{row.kategori}</span>
                        <span className="text-[10px] text-amber-600">▼</span>
                      </div>
                    </td>

                    {/* E: Item Bahan Baku - Yellow Input */}
                    <td className="py-2 px-4 bg-[#fefce8] text-slate-900 font-medium border-r border-slate-200">
                      {row.itemBahanBaku}
                    </td>

                    {/* F: Satuan - Yellow Input */}
                    <td className="py-2 px-2 bg-[#fefce8] text-center font-mono text-slate-700 border-r border-slate-200 whitespace-nowrap">
                      {row.satuan}
                    </td>

                    {/* G: Qty Waste - Yellow Input */}
                    <td className="py-2 px-3 bg-[#fefce8] text-right font-mono tabular-nums text-slate-900 border-r border-slate-200 whitespace-nowrap">
                      {row.qtyWaste.toFixed(2)}
                    </td>

                    {/* H: Harga/Unit - Yellow Input */}
                    <td className="py-2 px-3 bg-[#fefce8] text-right font-mono tabular-nums text-slate-900 border-r border-slate-200 whitespace-nowrap">
                      {formatIDR(row.hargaUnit, '')}
                    </td>

                    {/* I: Nilai Waste - Formula Column / White Background */}
                    <td className="py-2 px-4 bg-white text-right font-mono tabular-nums font-bold text-red-700 border-r border-slate-200 whitespace-nowrap">
                      {formatIDR(row.nilaiWaste, '')}
                    </td>

                    {/* J: Penyebab - Yellow Input */}
                    <td className="py-2 px-3 bg-[#fefce8] text-slate-800 border-r border-slate-200 whitespace-nowrap">
                      <div className="flex items-center justify-between gap-1">
                        <span>{row.penyebab}</span>
                        <span className="text-[10px] text-amber-600">▼</span>
                      </div>
                    </td>

                    {/* K: Tindakan Koreksi - Yellow Input */}
                    <td className="py-2 px-4 bg-[#fefce8] text-slate-700 border-r border-slate-200 text-xs">
                      {row.tindakanKoreksi || <span className="text-slate-400 italic">-</span>}
                    </td>

                    {/* L: PIC - Yellow Input */}
                    <td className="py-2 px-3 bg-[#fefce8] text-slate-800 border-r border-slate-200 whitespace-nowrap">
                      {row.pic}
                    </td>

                    {/* M: Status - Yellow Input with Red Highlight from screenshot */}
                    <td className="py-2 px-3 bg-[#fefce8] text-center border-r border-slate-200 whitespace-nowrap">
                      <select
                        value={row.status}
                        onChange={(e) => handleQuickStatusChange(row.id, e.target.value as WasteStatus)}
                        className={`text-xs font-bold px-1.5 py-0.5 rounded cursor-pointer ${
                          row.status === 'OPEN'
                            ? 'text-red-700 bg-red-100/80 hover:bg-red-200'
                            : row.status === 'INVESTIGATING'
                            ? 'text-amber-800 bg-amber-100/80 hover:bg-amber-200'
                            : row.status === 'RESOLVED'
                            ? 'text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200'
                            : 'text-slate-600 bg-slate-200/80'
                        }`}
                      >
                        <option value="OPEN">OPEN</option>
                        <option value="INVESTIGATING">INVESTIGATING</option>
                        <option value="RESOLVED">RESOLVED</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-2 px-2 text-center bg-white whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => startEdit(row)}
                          className="p-1 text-slate-400 hover:text-red-700 cursor-pointer"
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
            <tfoot className="border-t-2 border-slate-300 bg-red-50/60 font-semibold text-slate-900">
              <tr>
                <td className="py-2 px-2 text-center border-r border-slate-200 font-mono">Σ</td>
                <td className="py-2 px-3 border-r border-slate-200">Total Waste</td>
                <td className="py-2 px-3 border-r border-slate-200">-</td>
                <td className="py-2 px-3 border-r border-slate-200">-</td>
                <td className="py-2 px-3 border-r border-slate-200">-</td>
                <td className="py-2 px-4 border-r border-slate-200">{filteredData.length} Item</td>
                <td className="py-2 px-2 border-r border-slate-200 text-center">-</td>
                <td className="py-2 px-3 text-right font-mono tabular-nums border-r border-slate-200">
                  {totalQtyWaste.toFixed(2)}
                </td>
                <td className="py-2 px-3 border-r border-slate-200">-</td>
                <td className="py-2 px-4 text-right font-mono tabular-nums font-bold text-red-700 border-r border-slate-200">
                  {formatIDR(totalNilaiWaste, '')}
                </td>
                <td colSpan={4} className="py-2 px-3 text-slate-600 font-normal">
                  Total Kerugian Waste: <strong className="text-red-800">{formatIDR(totalNilaiWaste)}</strong>
                </td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};
