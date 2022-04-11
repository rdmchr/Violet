import { getAuth, User } from 'firebase/auth';
import { collection, getDocs, getFirestore, query, where } from "firebase/firestore";
import { useEffect, useState, useContext } from 'react';
import { useAuthState } from "react-firebase-hooks/auth";
import Loading from "../components/loading";
import { app } from "../lib/firebase";
import { UserContext } from '../lib/context';
import OnlyEnlightened from '../components/onlyEnlightened';

const auth = getAuth(app);
const db = getFirestore(app);

type News = {
    sender: string;
    timestamp: string;
    text: string;
};

type Tag = {
    tagName: string;
    start: number;
    end: number;
    href?: string;
}

export default function News() {
    const [user, authLoading, authError] = useAuthState(auth);
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const { loadingAnimation, enlightened } = useContext(UserContext);

    useEffect(() => {
        if (!authLoading && user.uid && enlightened) {
            fetchNews();
        }
        if (!authLoading && user.uid && !enlightened) {
            console.log("not enlightened");
            setLoading(false);
        }
    }, [authLoading, user]);

    async function fetchNews() {
        const messagesRef = collection(db, "messages")
        const q = query(messagesRef, where("permittedUsers", "array-contains", user.uid));
        const querySnapshot = await getDocs(q);
        const newsList: News[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data().data;
            const news: News = {
                text: data[0],
                sender: data[1],
                timestamp: data[2],
            };
            newsList.push(news);
        });
        setNews(newsList);
        if (loadingAnimation) { await Promise.resolve(new Promise(resolve => setTimeout(resolve, 400))); }
        setLoading(false);
    }

    function parseMessageText(text: string) {
        if (!text.includes('<a href="') && !text.includes('<br />')) {
            return (<p>{text}</p>)
        }
        const charArray = text.split('');
        let isInTag = false;
        let isInClosingTag = false;
        let tagStart = 0;
        let tagName = '';
        let href = '';
        const tags: Tag[] = []
        for (let i = 0; i < charArray.length; i++) {
            // detect start of tag
            if (charArray[i] === '<' && charArray[i + 1] !== '/') {
                isInTag = true;
                tagStart = i;
                for (let j = i + 1; j < charArray.length; j++) {
                    if (charArray[j] === ' ') {
                        break;
                    }
                    tagName += charArray[j];
                }
            }
            // detect href attribute
            if (isInTag && charArray[i] === 'h' && charArray[i + 1] === 'r' && charArray[i + 2] === 'e' && charArray[i + 3] === 'f' && charArray[i + 4] === '=' && charArray[i + 5] === '"') {
                for (let j = i + 6; j < charArray.length; j++) {
                    if (charArray[j] === '"') {
                        break;
                    }
                    href += charArray[j];
                }
            }
            // detect closing tag
            if (charArray[i] === '<' && charArray[i + 1] === '/') {
                isInClosingTag = true;
            }
            if (isInTag && charArray[i] === '/' && charArray[i + 1] === '>') {
                tags.push({
                    tagName,
                    start: tagStart,
                    end: i + 1
                });
                tagName = '';
                tagStart = 0;
                isInTag = false;
                href = '';
                isInClosingTag = false;
            }

            // detect end of closing tag
            if (isInClosingTag && charArray[i] === '>') {
                isInClosingTag = false;
                const tag: Tag = {
                    tagName,
                    start: tagStart,
                    end: i,
                    href,
                }
                tags.push(tag);
                tagName = '';
                tagStart = 0;
                isInTag = false;
                href = '';
            }
        }
        let finalTag = (<span className=""></span>);
        for (let index = 0; index < tags.length; index++) {
            const tag = tags[index];
            const hasNext = index + 1 < tags.length;
            if (tag.tagName === 'a') {
                if (index !== 0) {
                    finalTag = (<>{finalTag}
                        <a href={tag.href} target="_blank" rel="noreferrer" className="underline text-link">Link</a>
                        {text.substring(tag.end + 1, hasNext ? tags[index + 1].start : Number.MAX_VALUE)}
                    </>);
                } else {
                    finalTag = (<>
                        {`${text.substring(0, tag.start)} `}
                        <a href={tag.href} target="_blank" rel="noreferrer" className="underline text-link">Link</a>
                        {`${text.substring(tag.end + 1, hasNext ? tags[index + 1].start - 1 : Number.MAX_VALUE)}`}
                    </>);
                }
            } else if (tag.tagName === 'br') {
                if (index !== 0) {
                    finalTag = (<>{finalTag}
                        <br />
                        {text.substring(tag.end + 1, hasNext ? tags[index + 1].start : Number.MAX_VALUE)}
                    </>);
                } else {
                    finalTag = (<>
                        {`${text.substring(0, tag.start)} `}
                        <br />
                        {`${text.substring(tag.end + 1, hasNext ? tags[index + 1].start - 1 : Number.MAX_VALUE)}`}
                    </>);
                }
            }
        }
        return finalTag;
    }

    function formatDate(date: string) {
        const dateObj = new Date(date);
        return dateObj.toLocaleDateString();
    }

    if (authLoading || loading) {
        return (<Loading />);
    }

    if (!enlightened) {
        return (
            <OnlyEnlightened pageName='News' />
        )
    }

    return (
        <main className="bg min-h-[100vh]">
            <div className='header mb-2 py-2'>
                <h1 className="text-center text-2xl font-semibold text-v">News</h1>
            </div>
            {news.length > 0 ? <div className="px-2 mb-24">
                {news.map((news) => (
                    <div key={news.timestamp} className="max-w-[100vw] border mt-5 p-2 rounded-lg drop-shadow-md bg">
                        <span className="inline text">{parseMessageText(news.text)}</span>
                        <p className="text-right mt-2 text-500 text-sm">{news.sender}</p>
                        <p className="text-right text-500 text-sm">{formatDate(news.timestamp)}</p>
                    </div>
                ))}
            </div> : <div className="px-2 mb-24">
                <p className="text-center text-600 text-xl">No news</p>
            </div>}
        </main>
    )
}