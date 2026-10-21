export type OutletName = 'Beo' | 'Ciheuleut' | 'Dago' | 'Riau' | string;

export type CategoryName = 
  | 'Pastry'
  | 'Coffee'
  | 'Non-Coffee'
  | 'Food / Kitchen'
  | 'Milk & Dairy'
  | 'Syrup & Powder'
  | 'Packaging'
  | 'Other Supplies'
  | string;

export type WasteUnit = 'PCS' | 'GR' | 'KG' | 'BTL' | 'PACK' | 'PORTION' | 'LITER' | 'CAN';

export type WasteStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';

export type WastePIC = 'BAR' | 'Kitchen' | 'Purchasing' | 'Floor / Service' | 'Store Manager' | string;

export type WasteCause = 
  | 'Spillage' 
  | 'Expired' 
  | 'Overcooked / Burnt' 
  | 'Contaminated' 
  | 'Damaged in Transit' 
  | 'Wrong Prep / Order' 
  | 'Machine Error' 
  | string;

// Sheet Bulanan (Monthly Sheet)
export interface MonthlyReportEntry {
  id: string;
  periode: string; // e.g., 'Jan-2026', 'Feb-2026', 'Sep-2026'
  outlet: string; // e.g., 'Beo', 'Ciheuleut'
  salesProfitFnB: number; // e.g., 396176414
  totalSalesOutlet: number; // e.g., 434887864
  pemakaianFnB: number; // e.g., 144963842
  hppNonBahanBaku: number; // e.g., 9810481
  totalHPP: number; // calculated: pemakaianFnB + hppNonBahanBaku
  pembelianBahanBaku: number; // e.g., 148410477
  notes?: string;
  createdAt?: string;
}

// Sheet Analisa Kategori
export interface CategoryAnalysisEntry {
  id: string;
  periode: string; // e.g., 'Sep-2026'
  outlet: string; // e.g., 'Beo', 'Ciheuleut'
  kategori: string; // e.g., 'Pastry', 'Coffee', etc.
  salesKategori: number; // Rp
  cogsPenggunaan: number; // Rp (COGS / Penggunaan)
  pembelian: number; // Rp
  waste: number; // Rp
  notes?: string;
  createdAt?: string;
}

// Sheet Log Waste
export interface WasteLogEntry {
  id: string;
  tanggal: string; // e.g., '2026-09-30' or '30-Sep-2026'
  periode: string; // derived: 'Sep-2026'
  outlet: string; // e.g., 'Ciheuleut', 'Beo'
  kategori: string; // e.g., 'Pastry'
  itemBahanBaku: string; // e.g., 'Basque Burnt Cheesecake'
  satuan: WasteUnit | string; // e.g., 'PCS'
  qtyWaste: number; // e.g., 2.00
  hargaUnit: number; // e.g., 19769
  nilaiWaste: number; // calculated: qtyWaste * hargaUnit
  penyebab: WasteCause; // e.g., 'Spillage'
  tindakanKoreksi: string; // e.g., 'Maintenance Showcase'
  pic: WastePIC; // e.g., 'BAR', 'Kitchen'
  status: WasteStatus; // 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED'
  createdAt?: string;
}

export type ActiveSheetTab = 'dashboard' | 'bulanan' | 'analisa_kategori' | 'log_waste' | 'reconciliation';

export type InputTargetSheet = 'bulanan' | 'analisa_kategori' | 'log_waste';
