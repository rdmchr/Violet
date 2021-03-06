import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from 'react';
import TextTransition, { presets } from "react-text-transition";
import { SettingsIcon } from "../icons";

function Header({ settings = false, small = false }) {
  const router = useRouter();
  let greetings = "Welcome!";

  //useEffect(() => {
  //  const hrefs = window.location.href.split('/');
  //  const len = hrefs[3];
  //
  //switch (len){
  //  case "de":
  //    greetings = "Wilkommen!";
  //    break;
  //  default:
  //    greetings = "Welcome!";
  //    break;
  //}
  //});

  const [topText, setTopText] = useState<string>(greetings);


  setTimeout(() => {
    setTopText("Violet");
  }, 3000);

  return (
    <div className={`bg-violet-900 drop-shadow-md flex items-center px-5 ${small ? 'w-3/4 mx-auto rounded-b-lg' : 'w-screen'} ${settings ? 'justify-between' : 'justify-center'}`}>
      <TextTransition text={topText} springConfig={presets.wobbly} className={`text-white text-center text-xl py-1 transition-all duration-100 ease-in-out flex items-center mt-1`} inline />
      {settings ? <SettingsIcon className="text-2xl fill-white" onClick={() => router.push('/settings')} /> : <></>}
    </div>
  )
}

export default Header;