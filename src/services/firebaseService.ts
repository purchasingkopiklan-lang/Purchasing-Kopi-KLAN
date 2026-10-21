import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import {
  MonthlyReportEntry,
  CategoryAnalysisEntry,
  WasteLogEntry
} from '../types';
import {
  INITIAL_MONTHLY_DATA,
  INITIAL_CATEGORY_DATA,
  INITIAL_WASTE_DATA
} from '../data/initialData';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ----------------------------------------------------------------------
// 1. Sheet Bulanan (Monthly Reports)
// ----------------------------------------------------------------------
const MONTHLY_PATH = 'monthly_reports';

export function subscribeToMonthlyReports(
  onData: (data: MonthlyReportEntry[]) => void,
  onError?: (err: any) => void
) {
  const colRef = collection(db, MONTHLY_PATH);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: MonthlyReportEntry[] = [];
      snapshot.forEach((d) => {
        const item = d.data() as Omit<MonthlyReportEntry, 'id'>;
        items.push({
          id: d.id,
          ...item,
        });
      });
      onData(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, MONTHLY_PATH);
    }
  );
}

export async function addMonthlyReportDoc(entry: Omit<MonthlyReportEntry, 'id'>): Promise<string> {
  const colRef = collection(db, MONTHLY_PATH);
  const newDocRef = doc(colRef);
  try {
    await setDoc(newDocRef, {
      ...entry,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return newDocRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `${MONTHLY_PATH}/${newDocRef.id}`);
  }
}

export async function updateMonthlyReportDoc(
  id: string,
  updated: Partial<MonthlyReportEntry>
): Promise<void> {
  const docRef = doc(db, MONTHLY_PATH, id);
  try {
    await updateDoc(docRef, {
      ...updated,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${MONTHLY_PATH}/${id}`);
  }
}

export async function deleteMonthlyReportDoc(id: string): Promise<void> {
  try {
    const docRef = doc(db, MONTHLY_PATH, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn(`Firestore delete monthly doc ${id}:`, err);
    // Don't crash UI on optimistic delete if offline or already removed
  }
}

// ----------------------------------------------------------------------
// 2. Sheet Analisa Kategori (Category Analysis)
// ----------------------------------------------------------------------
const CATEGORY_PATH = 'category_analysis';

export function subscribeToCategoryAnalysis(
  onData: (data: CategoryAnalysisEntry[]) => void,
  onError?: (err: any) => void
) {
  const colRef = collection(db, CATEGORY_PATH);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: CategoryAnalysisEntry[] = [];
      snapshot.forEach((d) => {
        const item = d.data() as Omit<CategoryAnalysisEntry, 'id'>;
        items.push({
          id: d.id,
          ...item,
        });
      });
      onData(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, CATEGORY_PATH);
    }
  );
}

export async function addCategoryAnalysisDoc(entry: Omit<CategoryAnalysisEntry, 'id'>): Promise<string> {
  const colRef = collection(db, CATEGORY_PATH);
  const newDocRef = doc(colRef);
  try {
    await setDoc(newDocRef, {
      ...entry,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return newDocRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `${CATEGORY_PATH}/${newDocRef.id}`);
  }
}

export async function addCategoryBatchDocs(entries: Omit<CategoryAnalysisEntry, 'id'>[]): Promise<void> {
  const batch = writeBatch(db);
  const now = new Date().toISOString();
  entries.forEach((entry) => {
    const docRef = doc(collection(db, CATEGORY_PATH));
    batch.set(docRef, {
      ...entry,
      createdAt: now,
      updatedAt: now,
    });
  });
  try {
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, CATEGORY_PATH);
  }
}

export async function updateCategoryAnalysisDoc(
  id: string,
  updated: Partial<CategoryAnalysisEntry>
): Promise<void> {
  const docRef = doc(db, CATEGORY_PATH, id);
  try {
    await updateDoc(docRef, {
      ...updated,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${CATEGORY_PATH}/${id}`);
  }
}

export async function deleteCategoryAnalysisDoc(id: string): Promise<void> {
  try {
    const docRef = doc(db, CATEGORY_PATH, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn(`Firestore delete category doc ${id}:`, err);
  }
}

// ----------------------------------------------------------------------
// 3. Sheet Log Waste
// ----------------------------------------------------------------------
const WASTE_PATH = 'waste_logs';

export function subscribeToWasteLogs(
  onData: (data: WasteLogEntry[]) => void,
  onError?: (err: any) => void
) {
  const colRef = collection(db, WASTE_PATH);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: WasteLogEntry[] = [];
      snapshot.forEach((d) => {
        const item = d.data() as Omit<WasteLogEntry, 'id'>;
        items.push({
          id: d.id,
          ...item,
        });
      });
      onData(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, WASTE_PATH);
    }
  );
}

export async function addWasteLogDoc(entry: Omit<WasteLogEntry, 'id'>): Promise<string> {
  const colRef = collection(db, WASTE_PATH);
  const newDocRef = doc(colRef);
  try {
    await setDoc(newDocRef, {
      ...entry,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return newDocRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `${WASTE_PATH}/${newDocRef.id}`);
  }
}

export async function updateWasteLogDoc(
  id: string,
  updated: Partial<WasteLogEntry>
): Promise<void> {
  const docRef = doc(db, WASTE_PATH, id);
  try {
    await updateDoc(docRef, {
      ...updated,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${WASTE_PATH}/${id}`);
  }
}

export async function deleteWasteLogDoc(id: string): Promise<void> {
  try {
    const docRef = doc(db, WASTE_PATH, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn(`Firestore delete waste doc ${id}:`, err);
  }
}

// ----------------------------------------------------------------------
// Database Initializer / Seed Check
// ----------------------------------------------------------------------
export async function initializeDatabaseIfEmpty(): Promise<void> {
  try {
    const monthlySnap = await getDocs(collection(db, MONTHLY_PATH));
    if (monthlySnap.empty) {
      console.log('Seeding initial monthly reports to Firestore...');
      const batch = writeBatch(db);
      INITIAL_MONTHLY_DATA.forEach((item) => {
        const docRef = doc(db, MONTHLY_PATH, item.id);
        batch.set(docRef, {
          ...item,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });
      await batch.commit();
    }

    const catSnap = await getDocs(collection(db, CATEGORY_PATH));
    if (catSnap.empty) {
      console.log('Seeding initial category data to Firestore...');
      const batch = writeBatch(db);
      INITIAL_CATEGORY_DATA.forEach((item) => {
        const docRef = doc(db, CATEGORY_PATH, item.id);
        batch.set(docRef, {
          ...item,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });
      await batch.commit();
    }

    const wasteSnap = await getDocs(collection(db, WASTE_PATH));
    if (wasteSnap.empty) {
      console.log('Seeding initial waste logs to Firestore...');
      const batch = writeBatch(db);
      INITIAL_WASTE_DATA.forEach((item) => {
        const docRef = doc(db, WASTE_PATH, item.id);
        batch.set(docRef, {
          ...item,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });
      await batch.commit();
    }
  } catch (error) {
    console.warn('Initial seed error or already populated:', error);
  }
}
