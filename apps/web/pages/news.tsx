import { getAuth } from "firebase/auth";
import { collection, getDocs, getFirestore, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { app } from "../lib/firebase";

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

    useEffect(() => {
        console.log("news", news);
        if (!authLoading && user.uid) {
            fetchNews();
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
        console.log(newsList);
        setNews(newsList);
    }

    function parseMessageText(text: string) {
        if (!text.includes('<a href="')) {
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
        let finalTag = (<></>);
        for (let index = 0; index < tags.length; index++) {
            const tag = tags[index];
            const hasNext = index + 1 < tags.length;
            if (index !== 0) {
                finalTag = (<>{finalTag}
                    <p>{text.substring(tags[index - 1].end + 1, tag.start - 1)}</p>
                    <a href={tag.href} target="_blank" rel="noreferrer" className="underline">Link</a>
                    <p>{text.substring(tag.end + 1, hasNext ? tags[index + 1].start - 1 : undefined)}</p>
                </>);
            }
            finalTag = (<>
                <p>{`${text.substring(0, tag.start - 1)} `}
                    <a href={tag.href} target="_blank" rel="noreferrer" className="underline text-blue-900">Link</a>
                    {`${text.substring(tag.end + 1)}`}</p>
            </>);
        }
        return finalTag;
    }

    function formatDate(date: string) {
        const dateObj = new Date(date);
        return dateObj.toLocaleDateString();
    }

    return (
        <>
            <div className='rounded-b-xl mb-2 drop-shadow-md bg-white py-2'>
                <h1 className="text-center text-2xl">News</h1>
            </div>
            {news.length > 0 ? <div className="px-2 mb-24">
                {news.map((news) => (
                    <div key={news.timestamp} className="max-w-[100vw] border mt-5 p-2 rounded-lg drop-shadow-md bg-white">
                        {parseMessageText(news.text)}
                        <p className="text-right mt-2 text-gray-500 text-sm">{news.sender}</p>
                        <p className="text-right text-gray-500 text-sm">{formatDate(news.timestamp)}</p>
                    </div>
                ))}
            </div> : <div className="px-2 mb-24">
                <p className="text-center text-gray-600 text-xl">No news</p>
            </div>}
        </>
    )
}