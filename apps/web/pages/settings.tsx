import { Trans } from "@lingui/macro";
import { getAuth } from "firebase/auth";
import { doc, getFirestore, updateDoc } from "firebase/firestore";
import { GetStaticProps } from "next";
import { useRouter } from "next/router";
import { useContext } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import Loading from "../components/loading";
import Toggle from "../components/toggle";
import CarbonArrowLeft from "../icons/CarbonArrowLeft";
import { UserContext } from "../lib/context";
import { app } from "../lib/firebase";
import { loadTranslation } from "../lib/transUtil";

const auth = getAuth(app());
const db = getFirestore(app());

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
    const { name, loading, colorScheme, setColorScheme, loadingAnimation, setLoadingAnimation, installPWA, setInstallPWA } = useContext(UserContext)

    if (authLoading || loading) {
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

    function setScheme(dark: boolean) {
        if (dark)
            document.documentElement.classList.add('dark');
        else
            document.documentElement.classList.remove('dark');
        setColorScheme(dark ? 'dark' : 'light');
        updateDoc(doc(db, 'users', user.uid), {
            colorScheme: dark ? 'dark' : 'light'
        })
    }

    function updateLoadingAnimation() {
        updateDoc(doc(db, 'users', user.uid), {
            loadingAnimation: !loadingAnimation
        })
        setLoadingAnimation(!loadingAnimation);
    }

    function installPrompt() {
        installPWA.prompt();
        setInstallPWA(null);
    }

    return (
        <main className="bg min-h-[100vh] pt-2 px-2">
            <CarbonArrowLeft className="text-2xl icon" onClick={() => router.back()} />
            <h1 className="text text-center text-2xl font-semibold mb-2">Settings</h1>
            <div className="px-2">
                <div className="flex items-center gap-2 justify-between">
                    <div>
                        <h1 className="text font-semibold"><Trans id="darkmode">Darkmode</Trans></h1>
                        <p className="text-500"><Trans id="darkmodeText">Switch the theme to a dark version</Trans></p>
                    </div>
                    <div>
                        <Toggle initialState={colorScheme === "dark"} onClick={(_e, newState) => { setScheme(newState) }} />
                    </div>
                </div>
                <br />
                <div className="flex items-center gap-2 justify-between">
                    <div>
                        <h1 className="text font-semibold"><Trans id="loadingAnimation">Loading animation</Trans></h1>
                        <p className="text-500"><Trans id="loadingAnimationText">Toggle the loading animation</Trans></p>
                    </div>
                    <div>
                        <Toggle initialState={loadingAnimation} onClick={updateLoadingAnimation} />
                    </div>
                </div>
                <br />
                {installPWA ?
                    <>
                        <div className="cursor-pointer" onClick={installPrompt}>
                            <p className="text font-semibold"><Trans id="installViolet">Install Violet</Trans></p>
                            <p className="text-500 max-w-screen -mt-1"><Trans id="clickToInstall">Click here to install Violet</Trans></p>
                        </div>
                        <br />
                    </>
                    : null}
                <div className="cursor-pointer" onClick={logout}>
                    <p className="text font-semibold"><Trans id="logOut">Log out</Trans></p>
                    <p className="text-500 max-w-screen -mt-1"><Trans id="loggedInAs">You are currently logged in as</Trans> {name.length > 15 ? `${name.slice(0, 14)}...` : name}</p>
                </div>
            </div>
        </main>
    )
}