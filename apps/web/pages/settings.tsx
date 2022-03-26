import { getAuth } from "firebase/auth";
import { useRouter } from "next/router";
import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import CarbonArrowLeft from "../icons/CarbonArrowLeft";
import { app } from "../lib/firebase";
import { CloseIcon } from '../icons'
import { collection, doc, getDoc, getDocs, getFirestore, onSnapshot, query, updateDoc, where, } from "firebase/firestore";

const auth = getAuth(app);
const db = getFirestore(app);

export default function Settings() {
    const router = useRouter();
    const [user, authLoading, authError] = useAuthState(auth);
    const [tictactoe, setTictactoe] = useState(false);
    const [tttState, setTTTState] = useState<[string[]]>([[]]);
    const [hasTurn, setHasTurn] = useState(false);
    const [tttID, setTTTID] = useState('');
    const [tttEnemy, setTTTEnemy] = useState('');

    async function loadTTTState() {
        const tttRef = collection(db, "tictactoe");
        const q = await query(tttRef, where("users", "array-contains", user.uid));
        const tttSnaps = await getDocs(q);
        let tttId = '';
        tttSnaps.forEach((doc) => {
            tttId = doc.id;
            setTTTID(tttId);
            doc.data().users.forEach((tttUser) => {
                console.log({ tttUser })
                if (tttUser !== user.uid) {
                    setTTTEnemy(tttUser);
                }
            });
        });
        if (!tttId) {
            console.log("CREATE NEW GAME");
        }
        console.log(tttId);
        const unsub = onSnapshot(doc(db, "tictactoe", tttId), (doc) => {
            console.log(tttId)
            if (doc.exists && doc.data()) {
                const data = doc.data();
                console.log("Current data: ", data);
                console.log(data.turn)
                setHasTurn(data.turn === user.uid);
                setTTTState(JSON.parse(data.state));
            }
        });
    }

    let counter = 0;
    function clickAbout() {
        counter++;
        if (counter === 1) {
            setTictactoe(true);
            loadTTTState();
        }
    }

    /**
     * Check the tic tac toe state for a winner
     */
    function checkForWinner() {
        let winner = false;
        // check horizontal
        tttState.forEach((row) => {
            if (row.every((cell) => cell === user.uid)) {
                winner = true;
            }
        });
        if (winner) {
            return true;
        }
        // check vertical
        for (let i = 0; i < 3; i++) {
            let row = [];
            for (let j = 0; j < 3; j++) {
                row.push(tttState[j][i]);
            }
            if (row.every((cell) => cell === user.uid)) {
                winner = true;
            }
        }
        if (winner) {
            return true;
        }
        // check diagonal
        let diag1 = [];
        let diag2 = [];
        for (let i = 0; i < 3; i++) {
            diag1.push(tttState[i][i]);
            diag2.push(tttState[i][2 - i]);
        }
        if (diag1.every((cell) => cell === user.uid) || diag2.every((cell) => cell === user.uid)) {
            winner = true;
        }
        return winner;
    }

    async function placePiece(x: number, y: number) {
        if (!hasTurn) return;
        if (tttState[x][y] !== '') return;
        const newState = tttState;
        newState[x][y] = user.uid;
        setTTTState(newState);
        const tttRef = doc(db, "tictactoe", tttID);
        console.log({ tttEnemy });
        console.log(checkForWinner());
        await updateDoc(tttRef, {
            state: JSON.stringify(newState),
            turn: tttEnemy,
        });
    }

    function handlePropagation(e) {
        e.stopPropagation();
    }

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
            <CarbonArrowLeft className="text-2xl ml-2 mt-2" onClick={() => router.back()} />
            <h1 className="text-center text-2xl font-semibold mb-2">Settings</h1>
            <div className="px-2 cursor-pointer" onClick={logout}>
                <p className="font-semibold">Log out</p>
                <p className="text-gray-400 max-w-screen -mt-1">You are currently logged in as {user.email.length > 15 ? `${user.email.slice(0, 14)}...` : user.email}</p>
            </div>
            <div className="px-2 cursor-pointer" onClick={clickAbout}>
                <p className="font-semibold">About</p>
                <p className="text-gray-400 max-w-screen -mt-1">A simple App made by Tim and Marc</p>
            </div>
            <div className={`absolute top-0 left-0 w-full h-full backdrop-blur-sm backdrop-brightness-90 ${!tictactoe ? "hidden" : "inline"}`} onClick={() => { setTictactoe(false) }}>
                <div className={`absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 portrait:h-[100vw] landscape:w-[100vh] max-w-[500px] max-h-[500px] bg-white z-10 drop-shadow-md aspect-square`} onClick={handlePropagation}>
                    <div className="w-full mt-2 px-2 relative">
                        <h1 className="text-center w-full text-lg font-semibold">Tic Tac Toe</h1>
                        <button onClick={() => (setTictactoe(false))} className="absolute top-0 right-2"><CloseIcon className="text-2xl" /></button>
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">
                        {tttState.length > 0 && tttState.map((row, i) => {
                            return (
                                <div className="grid grid-cols-[repeat(3,_max-content)] items-center justify-items-center gap-2 mt-2 w-max mx-auto" key={`${row}${i}`}>
                                    {row.map((cell, j) => {
                                        return (
                                            <div className="" key={`${cell}${j}`}>
                                                <div className="bg-gray-200 rounded-full h-12 w-12 flex items-center justify-center" onClick={() => placePiece(i, j)}>
                                                    <p className="text-center text-lg">{cell ? cell === user.uid ? "X" : "O" : ""}</p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )
                        })}
                        <h1 className="text-center mt-2">{hasTurn ? "It's your turn" : "It's your enemies turn"}</h1>
                    </div>
                </div>
            </div>
        </main>
    )
}