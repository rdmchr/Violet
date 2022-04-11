import { app } from '../lib/firebase'
import { getFirestore } from "firebase/firestore";
import { useContext, useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth, User } from 'firebase/auth';
import { TableIcon, CalendarIcon } from '../icons';
import Loading from '../components/loading';
import { Trans } from '@lingui/macro';
import { GetStaticProps } from 'next';
import { loadTranslation } from '../lib/transUtil';
import { useRouter } from 'next/router';
import { UserContext } from '../lib/context';

const db = getFirestore(app);
const auth = getAuth(app);

export const getStaticProps: GetStaticProps = async (ctx) => {
    const translation = await loadTranslation(
        ctx.locale!,
        process.env.NODE_ENV === 'production'
    )
    return {
        props: {
            translation
        }
    }
}

export default function TimetableEditor() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, authLoading, authError] = useAuthState(auth);

    useEffect(() => {
        if (!authLoading && user) {
            doStuff();
        }
    }, [authLoading, user]);

    if (!authLoading && !user) {
        router.push("/");
        return <></>;
    }

    if (authLoading || loading) {
        return (<Loading />);
    }

    function doStuff() {
        setLoading(false)
    }

    return (
        <main className='w-full min-h-[100vh] bg'>
            <h1 className="text">
                Hello!
            </h1>
            </main>
    )
}