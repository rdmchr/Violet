import { getAuth } from "firebase/auth";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import CarbonArrowLeft from "../icons/CarbonArrowLeft";
import { app } from "../lib/firebase";

const auth = getAuth(app);

export default function Settings() {
    const router = useRouter();
    const [user, authLoading, authError] = useAuthState(auth);

    if (authLoading) {
        return <p>Loading...</p>;
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
            <CarbonArrowLeft className="text-2xl ml-2 mt-2" onClick={() => router.back()}/>
            <h1 className="text-center text-2xl font-semibold mb-2">Settings</h1>
            <div className="px-2" onClick={logout}>
                <p className="font-semibold">Log out</p>
                <p className="text-gray-400 max-w-screen -mt-1">You are currently logged in as {user.email.length > 15 ? `${user.email.slice(0, 14)}...` : user.email}</p>
            </div>
        </main>
    )
}