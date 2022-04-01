import { DecodedIdToken } from 'firebase-admin/auth';
import {auth} from '../'

export default async function verifyUser(token: string): Promise<DecodedIdToken | null> {
    try {
        const user = await auth.verifyIdToken(token);
        return user;
    } catch (err) {
        console.log('User tried to access a restricted resource without a valid token.');
    }
    return null;
}