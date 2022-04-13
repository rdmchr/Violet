import { Trans } from "@lingui/react"
import { useState } from "react"
import { CloseIcon } from "../icons"
import { useRouter } from 'next/router';

type Props = {
    weekMissing: number
}

function NoTimetableData({ weekMissing }: Props) {
    const router = useRouter();
    var elem = <></>

    if (weekMissing === 0) {
        elem = (
            <div className="absolute top-0 left-0 w-[100vw] backdrop-brightness-50 backdrop-grayscale h-[100vh]">
                <div className="bg absolute inset-x-1/2 inset-y-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-max px-2 py-2">
                    <CloseIcon className="icon text-3xl" onClick={() => router.push('/')} />
                    <h1 className="text text-center text-xl mt-2">Uups, No data</h1>
                    <p className="text clear-both text-center text-m mt-2">
                        It seems you dont have any timetable-data for this week available.
                        <br />
                        You can either turn on the auto-fetch option in the settings (if you are enlightened),
                        <br />
                        or you can edit your timetable manually by clicking the button below
                    </p>
                    <div onClick={() => router.push('/timetableEditor')}>
                        <p className="text clear-both text-center text-m mt-2">edit your timetable</p>
                    </div>
                </div>
            </div>
        );
    }

    if (weekMissing === 1) {
        elem = (
            <div className="absolute top-0 left-0 w-[100vw] backdrop-brightness-50 backdrop-grayscale h-[100vh]">
                <div className="bg absolute inset-x-1/2 inset-y-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-max px-2 py-2">
                    <CloseIcon className="icon text-3xl" onClick={() => console.log('clicked')} />
                    <h1 className="text text-center text-xl mt-2">Uups, No data</h1>
                    <p className="text clear-both text-center text-m mt-2">
                        It seems you dont have any timetable-data for next week available.
                        <br />
                        You can either turn on the auto-fetch option in the settings (if you are enlightened),
                        <br />
                        or you can edit your timetable manually by clicking the button below
                    </p>
                    <div onClick={() => router.push('/timetableEditor')}>
                        <p className="text clear-both text-center text-m mt-2">edit your timetable</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        elem
    )
}

export default NoTimetableData;