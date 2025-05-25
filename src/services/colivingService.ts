
import { db } from '@/lib/firebase'; // db is now Firestore instance
import { collection, getDocs, doc, getDoc, type DocumentData, type QueryDocumentSnapshot } from 'firebase/firestore';
import type { ColivingSpace } from '@/types';

// Helper function to map Firestore document to ColivingSpace
const mapDocToColivingSpace = (document: QueryDocumentSnapshot<DocumentData> | DocumentData): ColivingSpace => {
  const data = document.data();
  return {
    id: document.id,
    name: data?.name || '',
    address: data?.address || '',
    logoUrl: data?.logoUrl || 'https://placehold.co/100x100.png', // Default placeholder
    description: data?.description || '',
    videoUrl: data?.videoUrl,
    slackLink: data?.slackLink,
    whatsappLink: data?.whatsappLink,
    tags: data?.tags || [],
    dataAiHint: data?.dataAiHint,
    monthlyPrice: data?.monthlyPrice || 0,
    hasPrivateBathroom: data?.hasPrivateBathroom || false,
    hasCoworking: data?.hasCoworking || false,
  } as ColivingSpace;
};

export async function getAllColivingSpaces(): Promise<ColivingSpace[]> {
  try {
    const colivingsCollectionRef = collection(db, 'colivings');
    const querySnapshot = await getDocs(colivingsCollectionRef);
    
    const spaces: ColivingSpace[] = [];
    querySnapshot.forEach((document) => {
      spaces.push(mapDocToColivingSpace(document));
    });
    
    if (spaces.length === 0) {
      console.log("No data available for coliving spaces in Firestore collection 'colivings'.");
    }
    return spaces;

  } catch (error) {
    console.error("Error fetching coliving spaces from Firestore:", error);
    return [];
  }
}

export async function getColivingSpaceById(id: string): Promise<ColivingSpace | null> {
  try {
    if (!id) {
      console.error("Error: No ID provided to getColivingSpaceById");
      return null;
    }
    const docRef = doc(db, 'colivings', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return mapDocToColivingSpace(docSnap);
    } else {
      console.log(`No data available for coliving space with id: ${id} in Firestore.`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching coliving space with id ${id} from Firestore:`, error);
    return null;
  }
}

    