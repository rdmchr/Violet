import { db } from '../'

/**
 * Get a user's Firebase uid from their school name
 * @param name the school name of the user
 * @returns the Firebase uid of the user or null if user was not found
 */
export default async function getUidFromSchoolName(name: string): Promise<string | null> {
    const userDataRef = db.collection('userData');
    const query = await userDataRef.where('xUser', '==', name).get();
    if (query.empty) return null;
    let id = null;
    query.docs.forEach(doc => {
        id = doc.id;
    });
    return id;
}