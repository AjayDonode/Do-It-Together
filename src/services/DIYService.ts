// src/services/DIYService.ts
import {
  collection, addDoc, getDoc, doc, updateDoc, serverTimestamp, query, where, getDocs, orderBy,
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebaseConfig';
import { DIYReport } from '../models/DIYReport';

const COL = 'diy_reports';

/** Save a new DIY report (status: 'generating') and return its Firestore ID. */
export async function createReport(report: Omit<DIYReport, 'id' | 'createdAt'>): Promise<string> {
  const ref2 = await addDoc(collection(db, COL), {
    ...report,
    createdAt: serverTimestamp(),
  });
  return ref2.id;
}

/** Fetch a single DIY report by ID. */
export async function getReport(reportId: string): Promise<DIYReport | null> {
  const snap = await getDoc(doc(db, COL, reportId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as DIYReport;
}

/** Update a report's design image URL and mark it complete. */
export async function updateReportImage(reportId: string, imageUrl: string): Promise<void> {
  await updateDoc(doc(db, COL, reportId), {
    designImageUrl: imageUrl,
    status: 'complete',
  });
}

/** Mark a report as errored. */
export async function markReportError(reportId: string): Promise<void> {
  await updateDoc(doc(db, COL, reportId), { status: 'error' });
}

/** Upload a base64 image (data URI) to Firebase Storage and return the public URL. */
export async function uploadDesignImage(reportId: string, dataUri: string): Promise<string> {
  const storageRef = ref(storage, `diy_designs/${reportId}.png`);
  await uploadString(storageRef, dataUri, 'data_url');
  return getDownloadURL(storageRef);
}

/** Get all DIY reports for a user, newest first. */
export async function getUserReports(userId: string): Promise<DIYReport[]> {
  const q = query(
    collection(db, COL),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as DIYReport));
}
