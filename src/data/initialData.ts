import { MonthlyReportEntry, CategoryAnalysisEntry, WasteLogEntry } from '../types';

export const INITIAL_OUTLETS = [
  'KOPI KLAN CIHEULEUT',
  'KOPI KLAN BEO',
  'KOPI KLAN PAMA PERSADA',
  'KOPI KLAN X KANITRA'
];

export const INITIAL_CATEGORIES = [
  'Coffee',
  'Non-Coffee',
  'Pastry',
  'Food / Kitchen',
  'Milk & Dairy',
  'Syrup & Powder',
  'Packaging',
  'Other Supplies'
];

export const INITIAL_PERIODS = [
  'Jan-2026',
  'Feb-2026',
  'Mar-2026',
  'Apr-2026',
  'May-2026',
  'Jun-2026',
  'Jul-2026',
  'Aug-2026',
  'Sep-2026',
  'Oct-2026',
  'Nov-2026',
  'Dec-2026'
];

export const INITIAL_UNITS = ['PCS', 'GR', 'KG', 'BTL', 'PACK', 'PORTION', 'LITER', 'CAN'];

export const INITIAL_CAUSES = [
  'Spillage',
  'Expired',
  'Overcooked / Burnt',
  'Contaminated',
  'Damaged in Transit',
  'Wrong Prep / Order',
  'Machine Error',
  'Quality Failure'
];

export const INITIAL_PICS = ['BAR', 'Kitchen', 'Purchasing', 'Floor / Service', 'Store Manager'];

export const INITIAL_MONTHLY_DATA: MonthlyReportEntry[] = [
  {
    id: 'month-1',
    periode: 'Jan-2026',
    outlet: 'KOPI KLAN BEO',
    salesProfitFnB: 396176414,
    totalSalesOutlet: 434887864,
    pemakaianFnB: 144963842,
    hppNonBahanBaku: 9810481,
    totalHPP: 154774323,
    pembelianBahanBaku: 148410477,
    notes: 'Report closing bulanan Januari KOPI KLAN BEO'
  },
  {
    id: 'month-2',
    periode: 'Feb-2026',
    outlet: 'KOPI KLAN BEO',
    salesProfitFnB: 339565300,
    totalSalesOutlet: 355277400,
    pemakaianFnB: 126365112,
    hppNonBahanBaku: 8157084,
    totalHPP: 134522196,
    pembelianBahanBaku: 159295190,
    notes: 'Report closing bulanan Februari KOPI KLAN BEO'
  },
  {
    id: 'month-3',
    periode: 'Sep-2026',
    outlet: 'KOPI KLAN CIHEULEUT',
    salesProfitFnB: 575170585,
    totalSalesOutlet: 584110154,
    pemakaianFnB: 220189658,
    hppNonBahanBaku: 18273627,
    totalHPP: 238463285,
    pembelianBahanBaku: 235521653,
    notes: 'Report closing bulanan September KOPI KLAN CIHEULEUT'
  },
  {
    id: 'month-4',
    periode: 'Sep-2026',
    outlet: 'KOPI KLAN BEO',
    salesProfitFnB: 412500000,
    totalSalesOutlet: 445200000,
    pemakaianFnB: 156320000,
    hppNonBahanBaku: 11200000,
    totalHPP: 167520000,
    pembelianBahanBaku: 162100000,
    notes: 'Report closing bulanan September KOPI KLAN BEO'
  },
  {
    id: 'month-5',
    periode: 'Sep-2026',
    outlet: 'KOPI KLAN PAMA PERSADA',
    salesProfitFnB: 489200000,
    totalSalesOutlet: 512000000,
    pemakaianFnB: 185600000,
    hppNonBahanBaku: 14500000,
    totalHPP: 200100000,
    pembelianBahanBaku: 198400000,
    notes: 'Report closing bulanan September KOPI KLAN PAMA PERSADA'
  },
  {
    id: 'month-6',
    periode: 'Sep-2026',
    outlet: 'KOPI KLAN X KANITRA',
    salesProfitFnB: 378400000,
    totalSalesOutlet: 395000000,
    pemakaianFnB: 142300000,
    hppNonBahanBaku: 10800000,
    totalHPP: 153100000,
    pembelianBahanBaku: 150200000,
    notes: 'Report closing bulanan September KOPI KLAN X KANITRA'
  }
];

export const INITIAL_CATEGORY_DATA: CategoryAnalysisEntry[] = [
  {
    id: 'cat-1',
    periode: 'Sep-2026',
    outlet: 'KOPI KLAN CIHEULEUT',
    kategori: 'Pastry',
    salesKategori: 86450000,
    cogsPenggunaan: 31200000,
    pembelian: 34100000,
    waste: 39538,
    notes: 'Basque cheesecake waste tercatat'
  },
  {
    id: 'cat-2',
    periode: 'Sep-2026',
    outlet: 'KOPI KLAN CIHEULEUT',
    kategori: 'Coffee',
    salesKategori: 215400000,
    cogsPenggunaan: 78500000,
    pembelian: 82000000,
    waste: 145000,
    notes: 'Kalibrasi grinder & bean test'
  },
  {
    id: 'cat-3',
    periode: 'Sep-2026',
    outlet: 'KOPI KLAN CIHEULEUT',
    kategori: 'Milk & Dairy',
    salesKategori: 124500000,
    cogsPenggunaan: 49800000,
    pembelian: 51200000,
    waste: 168000,
    notes: 'Susu fresh milk steamer'
  },
  {
    id: 'cat-4',
    periode: 'Sep-2026',
    outlet: 'KOPI KLAN CIHEULEUT',
    kategori: 'Food / Kitchen',
    salesKategori: 112800000,
    cogsPenggunaan: 46200000,
    pembelian: 48900000,
    waste: 95000,
    notes: 'Bahan saus & protein'
  },
  {
    id: 'cat-5',
    periode: 'Sep-2026',
    outlet: 'KOPI KLAN CIHEULEUT',
    kategori: 'Packaging',
    salesKategori: 36020585,
    cogsPenggunaan: 14489658,
    pembelian: 19321653,
    waste: 45000,
    notes: 'Cup lid dented'
  },
  {
    id: 'cat-6',
    periode: 'Sep-2026',
    outlet: 'KOPI KLAN BEO',
    kategori: 'Pastry',
    salesKategori: 72100000,
    cogsPenggunaan: 27500000,
    pembelian: 29800000,
    waste: 439112,
    notes: 'Showcase chiller kendala pendingin'
  },
  {
    id: 'cat-7',
    periode: 'Sep-2026',
    outlet: 'KOPI KLAN BEO',
    kategori: 'Coffee',
    salesKategori: 165000000,
    cogsPenggunaan: 61000000,
    pembelian: 63500000,
    waste: 180000,
    notes: 'Espresso calibration'
  },
  {
    id: 'cat-8',
    periode: 'Sep-2026',
    outlet: 'KOPI KLAN PAMA PERSADA',
    kategori: 'Coffee',
    salesKategori: 198000000,
    cogsPenggunaan: 72000000,
    pembelian: 76000000,
    waste: 110000,
    notes: 'Kalibrasi pagi'
  },
  {
    id: 'cat-9',
    periode: 'Sep-2026',
    outlet: 'KOPI KLAN X KANITRA',
    kategori: 'Coffee',
    salesKategori: 154000000,
    cogsPenggunaan: 58000000,
    pembelian: 60500000,
    waste: 95000,
    notes: 'Trial house blend'
  }
];

export const INITIAL_WASTE_DATA: WasteLogEntry[] = [
  {
    id: 'waste-1',
    tanggal: '2026-09-30',
    periode: 'Sep-2026',
    outlet: 'KOPI KLAN CIHEULEUT',
    kategori: 'Pastry',
    itemBahanBaku: 'Basque Burnt Cheesecake',
    satuan: 'PCS',
    qtyWaste: 2.0,
    hargaUnit: 19769,
    nilaiWaste: 39538,
    penyebab: 'Spillage',
    tindakanKoreksi: '',
    pic: 'BAR',
    status: 'OPEN'
  },
  {
    id: 'waste-2',
    tanggal: '2026-09-30',
    periode: 'Sep-2026',
    outlet: 'KOPI KLAN BEO',
    kategori: 'Pastry',
    itemBahanBaku: 'Basque Burnt Cheesecake',
    satuan: 'PCS',
    qtyWaste: 22.0,
    hargaUnit: 19960,
    nilaiWaste: 439112,
    penyebab: 'Spillage',
    tindakanKoreksi: 'Maintenance Showcase',
    pic: 'Kitchen',
    status: 'OPEN'
  },
  {
    id: 'waste-3',
    tanggal: '2026-09-28',
    periode: 'Sep-2026',
    outlet: 'KOPI KLAN CIHEULEUT',
    kategori: 'Milk & Dairy',
    itemBahanBaku: 'Fresh Milk Pasteurisasi 1L',
    satuan: 'LITER',
    qtyWaste: 8.0,
    hargaUnit: 21000,
    nilaiWaste: 168000,
    penyebab: 'Expired',
    tindakanKoreksi: 'Atur rotasi FIFO di walk-in chiller',
    pic: 'BAR',
    status: 'RESOLVED'
  },
  {
    id: 'waste-4',
    tanggal: '2026-09-25',
    periode: 'Sep-2026',
    outlet: 'KOPI KLAN BEO',
    kategori: 'Coffee',
    itemBahanBaku: 'House Blend Espresso Roast',
    satuan: 'KG',
    qtyWaste: 0.8,
    hargaUnit: 225000,
    nilaiWaste: 180000,
    penyebab: 'Machine Error',
    tindakanKoreksi: 'Kalibrasi ulang flowmeter mesin espresso',
    pic: 'BAR',
    status: 'INVESTIGATING'
  },
  {
    id: 'waste-5',
    tanggal: '2026-09-29',
    periode: 'Sep-2026',
    outlet: 'KOPI KLAN PAMA PERSADA',
    kategori: 'Milk & Dairy',
    itemBahanBaku: 'Oat Milk Barista Edition 1L',
    satuan: 'LITER',
    qtyWaste: 2.0,
    hargaUnit: 38500,
    nilaiWaste: 77000,
    penyebab: 'Expired',
    tindakanKoreksi: 'Evaluasi order par stock',
    pic: 'BAR',
    status: 'OPEN'
  },
  {
    id: 'waste-6',
    tanggal: '2026-09-27',
    periode: 'Sep-2026',
    outlet: 'KOPI KLAN X KANITRA',
    kategori: 'Pastry',
    itemBahanBaku: 'Butter Croissant',
    satuan: 'PCS',
    qtyWaste: 3.0,
    hargaUnit: 16500,
    nilaiWaste: 49500,
    penyebab: 'Overcooked / Burnt',
    tindakanKoreksi: 'Setel timer oven otomatis',
    pic: 'Kitchen',
    status: 'RESOLVED'
  }
];
