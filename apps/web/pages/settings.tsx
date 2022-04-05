import { Trans } from "@lingui/macro";
import { getAuth } from "firebase/auth";
import { GetStaticProps } from "next";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import Loading from "../components/loading";
import CarbonArrowLeft from "../icons/CarbonArrowLeft";
import { app } from "../lib/firebase";
import { loadTranslation } from "../lib/transUtil";

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

export default function Settings() {
    const router = useRouter();
    const [user, authLoading, authError] = useAuthState(auth);

    if (authLoading) {
        return (<Loading />);
    }

    if (!user) {
        router.push("/");
        return <></>
    }

    function logout() {
        auth.signOut();
        router.push("/login");
    }

    return (
        <main>
            <CarbonArrowLeft className="text-2xl ml-2 mt-2 icon" onClick={() => router.back()}/>
            <h1 className="text text-center text-2xl font-semibold mb-2">Settings</h1>
            <div className="px-2 cursor-pointer" onClick={logout}>
                <p className="text font-semibold"><Trans id="logOut">Log out</Trans></p>
                <p className="text-500 max-w-screen -mt-1"><Trans id="loggedInAs">You are currently logged in as</Trans> {user.email.length > 15 ? `${user.email.slice(0, 14)}...` : user.email}</p>
            </div>
        </main>
    )
}