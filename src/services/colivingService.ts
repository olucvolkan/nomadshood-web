
import { db } from '@/lib/firebase';
import { ref, get, child } from 'firebase/database';
import type { ColivingSpace } from '@/types';

export async function getAllColivingSpaces(): Promise<ColivingSpace[]> {
  try {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, 'colivingSpaces'));
    if (snapshot.exists()) {
      const data = snapshot.val();
      // Convert the object of spaces into an array
      return Object.values(data || {}) as ColivingSpace[];
    } else {
      console.log("No data available for coliving spaces");
      return [];
    }
  } catch (error) {
    console.error("Error fetching coliving spaces:", error);
    return [];
  }
}

export async function getColivingSpaceById(id: string): Promise<ColivingSpace | null> {
  try {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, `colivingSpaces/${id}`));
    if (snapshot.exists()) {
      return snapshot.val() as ColivingSpace;
    } else {
      console.log(`No data available for coliving space with id: ${id}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching coliving space with id ${id}:`, error);
    return null;
  }
}
