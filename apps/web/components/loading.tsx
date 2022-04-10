import { motion } from 'framer-motion'
import { useContext } from 'react';
import { UserContext } from '../lib/context';

function Loading({ settings = false, small = false }) {
    const { loadingAnimation } = useContext(UserContext)

    if (loadingAnimation) {
        return (
            <motion.div initial="hidden" animate="visible" variants={{
                hidden: {
                    scale: .8,
                    opacity: 0
                },
                visible: {
                    scale: 1,
                    opacity: 1,
                    transition: {
                        delay: .2
                    }
                },
            }}>
                <div className="w-[100vw] h-[100vh] bg">
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-max`}>
                        <img src="/KoiDesign.svg" alt="Koi" className="portrait:w-[90vw] landscape:h-[80vh]" />
                        <h1 className="text-center text-2xl text">Loading</h1>
                    </div>
                </div>
            </motion.div>
        )
    }
    else {
        return (
            <div className="w-[100vw] h-[100vh] bg">
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-max`}>
                        <img src="/KoiDesign.svg" alt="Koi" className="portrait:w-[90vw] landscape:h-[80vh]" />
                        <h1 className="text-center text-2xl text">Loading</h1>
                    </div>
                </div>
        )
    }
}

export default Loading;