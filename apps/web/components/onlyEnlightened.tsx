import { Trans } from "@lingui/macro";
import { setUser } from "@sentry/nextjs";
import { getFunctions, httpsCallable } from "firebase/functions";
import { ReactChild, useState, useContext } from 'react';
import { CloseIcon } from "../icons";
import { app } from "../lib/firebase";
import { UserContext } from '../lib/context';

type Props = {
    pageName: string;
}

const functions = getFunctions(app, 'europe-west1');

export default function OnlyEnlightened({ pageName }: Props) {
    const [inviteError, setInviteError] = useState<string>("");
    const [inviteCode, setInviteCode] = useState<string>("");
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [linkingModal, setLinkingModal] = useState<boolean>(true);
    const [stage, setStage] = useState(0)

    async function validateInvite(e) {
        e.preventDefault();
        setSubmitting(true);
        setInviteError("");
        if (inviteCode.length < 5) {
            setInviteError("Invalid invite code.")
            return;
        }
        const validateInvite = httpsCallable(functions, 'validateInvite');
        await validateInvite({ inviteId: inviteCode }).then((result) => {
            const data = result.data as { error?: string, success?: boolean };
            if (!data.success) {
                setInviteError(data.error);
            } else {
                setInviteError("");
                setStage(1);
                //setEnlightened(true);
            }
        }, error => {
            console.log(error);
            setInviteError(error.message);
        });
        setSubmitting(false);
    }

    return (
        <main className="min-h-[100vh] bg">
            <div className='header mb-2 py-2' onClick={() => setStage(1)}>
                <h1 className="text-center text-2xl font-semibold text-v">{pageName}</h1>
            </div>
            <div className={`${stage === 0 ? "" : "hidden"} mt-10`}>
                <img src="/KoiDesign.svg" alt="Koi" className="portrait:w-[90vw] landscape:h-[80vh] mx-auto" />
                <h1 className="text text-2xl text-center font-bold"><Trans id='woahThere'>Whoah there!</Trans></h1>
                <p className="text text-center"><Trans id="inviteOnlyFeature">You found an invite only feature.</Trans></p>
                <div className="border-b border-gray-600 mx-2 my-5" />
                <h1 className="text text-center">Do you have an invite code?</h1>
                <form className="px-4 mt-2" onSubmit={validateInvite}>
                    <label className="text flex flex-col">
                        Enter invite code
                        <input className="input" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} />
                    </label>
                    <p className="text-red-400">{inviteError}</p>
                    <button id="submit" type="submit" className="text text-lg border-2 border-violet-700 p-1 rounded-lg float-right mt-2" disabled={submitting}>Submit</button>
                </form>
            </div>
            <div className={`${stage === 1 ? "" : "hidden"}`}>
                {linkingModal && <LinkSchoolAccountForm setModal={setLinkingModal} />}
            </div>
        </main>
    )
}

function LinkSchoolAccountForm({ setModal }) {
    const [password, setPassword] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [error, setError] = useState<ReactChild>("");
    const [submitting, setSubmitting] = useState<boolean>(false);

    function closeModal() {
        setModal(false);
    }

    async function linkSchoolAccount(e) {
        e.preventDefault();
        setSubmitting(true);
        // validate username
        if (!username) {
            setError(<Trans id="usernameRequired">Username is required</Trans>);
            setSubmitting(false);
            return;
        } else if (!new RegExp("^[a-zA-Z]{1,}\.[a-zA-Z]{1,5}$").test(username)) {
            setError(<Trans id="invalidUsername">Invalid username</Trans>);
            setSubmitting(false);
            return;
        }
        // validate password
        if (!password) {
            setError(<Trans id="passwordRequired">Password is required</Trans>);
            setSubmitting(false);
            return;
        } else if (!new RegExp("((?=.*\d)(?=.*[a-zA-ZöäüÖÄÜß-]).{6,})?([0-9]{8})?").test(password)) {
            setError(<Trans id="invalidPassword">Invalid Password</Trans>);
            setSubmitting(false);
            return;
        }
        const checkCredentials = httpsCallable(functions, 'checkCredentials');
        const fetchData = httpsCallable(functions, 'fetchEverything');
        await checkCredentials({ "passw": password, "user": username }).then((result) => {
            console.log("Verified credentials successfully.");
            const data = result.data as { error: boolean, message: string };
            if (data.error === true) {
                setError(data.message);
            } else {
                fetchData().then((result) => {
                    const data = result.data as { error?: string, success: boolean };
                    if (data.success) {
                        closeModal();
                        
                    } else {
                        setError(data.error);
                    }
                }).catch((error) => {
                    console.log(error);
                    setError(error.message);
                });
            }
        });
        setSubmitting(false);
    }

    return (
        <div className="absolute top-0 left-0 w-[100vw] backdrop-brightness-50 backdrop-grayscale h-[100vh]">
            <div className="bg absolute inset-x-1/2 inset-y-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-max px-2 py-2">
                <CloseIcon className="icon text-3xl" onClick={closeModal} />
                <h1 className="text text-center text-xl mt-2">Enter your school account credentials</h1>
                <form onSubmit={linkSchoolAccount}>
                    <label className="flex flex-col mt-2 font-semibold text">
                        <Trans id="username">Username</Trans>
                        <input type="text" className="input" value={username} onChange={(e) => setUsername(e.target.value)} />
                    </label>
                    <label className="text flex flex-col mt-2 font-semibold">
                        <Trans id="password">Password</Trans>
                        <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </label>
                    <p className="text-red-400">{error}</p>
                    <button type="submit" disabled={submitting} className="text border-2 border-violet-600 py-1 px-2 text-lg float-right mt-2 rounded-lg">Submit</button>
                </form>
                <p className="text clear-both text-center text-sm pt-2">You can always do this later in your settings.</p>
            </div>
        </div>
    )
}
