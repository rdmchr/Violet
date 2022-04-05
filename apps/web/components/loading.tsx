import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";

function Loading({ settings = false, small = false }) {
    const router = useRouter();

    return (
        <div className="w-[100vw] h-[100vh] bg">
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-max`}>
                <img src="/KoiDesign.svg" alt="Koi" className="portrait:w-[90vw] landscape:h-[80vh]" />
                <h1 className="text-center text-2xl">Loading</h1>
            </div>
        </div>
    )
}

export default Loading;