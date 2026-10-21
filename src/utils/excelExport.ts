import * as XLSX from 'xlsx';
import { MonthlyReportEntry, CategoryAnalysisEntry, WasteLogEntry } from '../types';
import { formatDateToExcelStyle } from './formatters';

export function exportToKontrolExcel(
  monthlyData: MonthlyReportEntry[],
  categoryData: CategoryAnalysisEntry[],
  wasteData: WasteLogEntry[],
  fileName = 'Kontrol_COGS_KOPIKLAN.xlsx'
) {
  const wb = XLSX.utils.book_new();

  // 1. Sheet Bulanan
  const monthlyRows = monthlyData.map((row) => ({
    'Periode': row.periode,
    'Outlet': row.outlet,
    'Sales Profit FnB': row.salesProfitFnB,
    'Total Sales Outlet': row.totalSalesOutlet,
    'Pemakaian FnB': row.pemakaianFnB,
    'HPP Non-Bahan Baku': row.hppNonBahanBaku,
    'Total HPP': row.totalHPP,
    'Pembelian Bahan Baku': row.pembelianBahanBaku,
  }));
  const wsMonthly = XLSX.utils.json_to_sheet(monthlyRows);
  XLSX.utils.book_append_sheet(wb, wsMonthly, 'Sheet Bulanan');

  // 2. Sheet Analisa Kategori
  const categoryRows = categoryData.map((row) => ({
    'Periode': row.periode,
    'Outlet': row.outlet,
    'Kategori': row.kategori,
    'Sales Kategori': row.salesKategori,
    'COGS / Penggunaan': row.cogsPenggunaan,
    'Pembelian': row.pembelian,
    'Waste': row.waste,
  }));
  const wsCategory = XLSX.utils.json_to_sheet(categoryRows);
  XLSX.utils.book_append_sheet(wb, wsCategory, 'Sheet Analisa Kategori');

  // 3. Sheet Log Waste
  const wasteRows = wasteData.map((row) => ({
    'Tanggal': formatDateToExcelStyle(row.tanggal),
    'Periode': row.periode,
    'Outlet': row.outlet,
    'Kategori': row.kategori,
    'Item Bahan Baku': row.itemBahanBaku,
    'Satuan': row.satuan,
    'Qty Waste': row.qtyWaste,
    'Harga/Unit': row.hargaUnit,
    'Nilai Waste': row.nilaiWaste,
    'Penyebab': row.penyebab,
    'Tindakan Koreksi': row.tindakanKoreksi || '',
    'PIC': row.pic,
    'Status': row.status,
  }));
  const wsWaste = XLSX.utils.json_to_sheet(wasteRows);
  XLSX.utils.book_append_sheet(wb, wsWaste, 'Sheet Log Waste');

  XLSX.writeFile(wb, fileName);
}

export async function parseImportedExcel(file: File): Promise<{
  monthly?: MonthlyReportEntry[];
  category?: CategoryAnalysisEntry[];
  waste?: WasteLogEntry[];
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const result: {
          monthly?: MonthlyReportEntry[];
          category?: CategoryAnalysisEntry[];
          waste?: WasteLogEntry[];
        } = {};

        // Parse Sheet Bulanan
        const bulananSheetName = workbook.SheetNames.find((n) =>
          n.toLowerCase().includes('bulanan') || n.toLowerCase().includes('monthly')
        );
        if (bulananSheetName) {
          const sheet = workbook.Sheets[bulananSheetName];
          const raw: any[] = XLSX.utils.sheet_to_json(sheet);
          result.monthly = raw.map((r, idx) => {
            const pemakaian = Number(r['Pemakaian FnB'] || r['pemakaian'] || 0);
            const nonBahanBaku = Number(r['HPP Non-Bahan Baku'] || r['hpp_non'] || 0);
            const totalHpp = Number(r['Total HPP'] || pemakaian + nonBahanBaku);
            return {
              id: `imported-m-${Date.now()}-${idx}`,
              periode: String(r['Periode'] || 'Sep-2026'),
              outlet: String(r['Outlet'] || 'KOPI KLAN CIHEULEUT'),
              salesProfitFnB: Number(r['Sales Profit FnB'] || 0),
              totalSalesOutlet: Number(r['Total Sales Outlet'] || 0),
              pemakaianFnB: pemakaian,
              hppNonBahanBaku: nonBahanBaku,
              totalHPP: totalHpp,
              pembelianBahanBaku: Number(r['Pembelian Bahan Baku'] || 0),
            };
          });
        }

        // Parse Sheet Analisa Kategori
        const catSheetName = workbook.SheetNames.find((n) =>
          n.toLowerCase().includes('kategori') || n.toLowerCase().includes('category')
        );
        if (catSheetName) {
          const sheet = workbook.Sheets[catSheetName];
          const raw: any[] = XLSX.utils.sheet_to_json(sheet);
          result.category = raw.map((r, idx) => ({
            id: `imported-c-${Date.now()}-${idx}`,
            periode: String(r['Periode'] || 'Sep-2026'),
            outlet: String(r['Outlet'] || 'KOPI KLAN CIHEULEUT'),
            kategori: String(r['Kategori'] || 'General'),
            salesKategori: Number(r['Sales Kategori'] || 0),
            cogsPenggunaan: Number(r['COGS / Penggunaan'] || r['COGS'] || 0),
            pembelian: Number(r['Pembelian'] || 0),
            waste: Number(r['Waste'] || 0),
          }));
        }

        // Parse Sheet Log Waste
        const wasteSheetName = workbook.SheetNames.find((n) =>
          n.toLowerCase().includes('waste') || n.toLowerCase().includes('log')
        );
        if (wasteSheetName) {
          const sheet = workbook.Sheets[wasteSheetName];
          const raw: any[] = XLSX.utils.sheet_to_json(sheet);
          result.waste = raw.map((r, idx) => {
            const qty = Number(r['Qty Waste'] || r['Qty'] || 0);
            const harga = Number(r['Harga/Unit'] || r['Harga'] || 0);
            return {
              id: `imported-w-${Date.now()}-${idx}`,
              tanggal: String(r['Tanggal'] || new Date().toISOString().split('T')[0]),
              periode: String(r['Periode'] || 'Sep-2026'),
              outlet: String(r['Outlet'] || 'KOPI KLAN CIHEULEUT'),
              kategori: String(r['Kategori'] || 'Pastry'),
              itemBahanBaku: String(r['Item Bahan Baku'] || r['Item'] || 'Item'),
              satuan: String(r['Satuan'] || 'PCS'),
              qtyWaste: qty,
              hargaUnit: harga,
              nilaiWaste: Number(r['Nilai Waste'] || qty * harga),
              penyebab: String(r['Penyebab'] || 'Spillage'),
              tindakanKoreksi: String(r['Tindakan Koreksi'] || ''),
              pic: String(r['PIC'] || 'BAR'),
              status: (r['Status'] || 'OPEN') as any,
            };
          });
        }

        resolve(result);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}
