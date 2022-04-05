import { BaseSyntheticEvent, useState } from "react"

type Props = {
    onClick?: (e?: BaseSyntheticEvent, newState?: boolean) => void;
    initialState: boolean
}

export default function Toggle({onClick, initialState = false} : Props) {
    const [currentState, setCurrentState] = useState(initialState)
    return (
        <label className="flex items-center cursor-pointer">
            <div className="relative">
                <input id="toogleA" type="checkbox" className="sr-only" onClick={(e) => {onClick(e, !currentState); setCurrentState(!currentState)}} defaultChecked={initialState} />
                <div className="w-10 h-4 bg-gray-400 rounded-full shadow-inner"></div>
                <div className="dot absolute w-6 h-6 bg-white rounded-full shadow -left-1 -top-1 transition"></div>
            </div>
        </label>
    )
}