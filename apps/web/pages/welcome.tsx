import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { useEffect, useState } from "react";
import Header from "../components/header";
import { app } from "../lib/firebase";
import { RightArrow } from "../icons";
import { useRouter } from "next/router";
import { Trans } from '@lingui/macro'
import { GetStaticProps } from "next";
import { loadTranslation } from "../lib/transUtil";
import { messages as de} from '../translations/locale/de/messages';
import { messages as en} from '../translations/locale/en/messages';
import { fa } from "make-plural";

const auth = getAuth(app);
const functions = getFunctions(app);
var messages = en;

export const getStaticProps: GetStaticProps = async (ctx) => {
    const translation = await loadTranslation(
        ctx.locale!,
        process.env.NODE_ENV === 'production'
    )
    return {
        props: {
            translation
        }
    }
}

export default function Welcome(props) {
    const router = useRouter();
    const { locale, locales, defaultLocale } = router;
    const [name, setName] = useState("");
    const [stage, setStage] = useState(0);

    function nextStage() {
        setStage(stage + 1);
    }

    useEffect(() => {
        const hrefs = window.location.href.split('/');
        const len = hrefs[3];
      
      switch (len){
        case "de":
          messages = de;
          break;
        default:
          messages = en;
          break;
      }
      });

      if(false) {
        (<div className='hidden'> 
        <Trans id='emailAlreadyInUse'>The Email is already in use</Trans>
        <Trans id='passwordTooWeak'> The Password is too weak</Trans>
        </div>)
      }

    return (
        <div>
            <div>
                <Header small />
            </div>
            <div className="px-2 mt-2">
                <div className={`${stage === 0 ? "" : "hidden"}`}>
                    <div className="absolute top-1/2 left-1/2 w-max h-max -translate-y-1/2 -translate-x-1/2">
                        <h1 className="text-2xl font-bold text-violet-900">
                            <Trans id="hello">Hello!</Trans>
                        </h1>
                        <h1 className="w-[75vw]">
                            <Trans id="slogan">Welcome to Violet, the better way to interact with your school online.</Trans>
                        </h1>
                        <button className="px-2 py-1 rounded-lg mt-5 text-lg w-full flex items-center" onClick={() => nextStage()}>
                            <Trans id="getStarted">Get started</Trans>
                            <RightArrow className="text-xl ml-2" />
                        </button>
                    </div>
                </div>
                <div className={`${stage === 1 ? "" : "hidden"}`}>
                    <h1 className="text-xl font-semi-bold text-center mt-20 mb-5">
                        <Trans id="createAccount">Let&apos;s create your account!</Trans>
                    </h1>
                    <p className="text-sm">
                        <Trans id="createAccountDisclaimerOne">You will use this account to log into Violet.</Trans>
                    </p>
                    <p className="mb-5 text-sm">
                        <Trans id="createAccountDisclaimerTwo">This account is separate from your school account.</Trans>
                    </p>
                    <CreateAccountForm nextStage={nextStage} setName={setName} />
                </div>
                <div className={`${stage === 2 ? "" : "hidden"}`}>
                    <h1 className="text-xl font-semi-bold text-center mt-20 mb-5">
                        <Trans id="connectToSchool">Let&apos;s connect your account to the school website!</Trans>
                    </h1>
                    <p className="text-sm">
                        <Trans id="connectToSchoolDisclaimer">We need these details to get your timetable.</Trans>
                    </p>
                    <SchoolPageForm nextStage={nextStage} />
                </div>
                <div className={`${stage === 3 ? "" : "hidden"}`}>
                    <div className="absolute top-1/2 left-1/2 w-max h-max -translate-y-1/2 -translate-x-1/2">
                        <h1 className="text-2xl font-bold text-violet-900">
                            <Trans id="helloName" values={{ name }}>Hello, {name}!</Trans>
                        </h1>
                        <h1 className="w-[75vw]">
                            <Trans id="pleaseWait">Please give us one moment, we are fetching your timetable.</Trans>
                        </h1>
                    </div>
                </div>
            </div>
        </div>
    )
}

function SchoolPageForm({ nextStage }) {
    const [error, setError] = useState("");
    return (
        <Formik
            initialValues={{ username: '', password: '' }}
            validate={values => {
                const errors: { username?: any, password?: any } = {};
                // validate username
                if (!values.username) {
                    errors.username = <Trans id="required">Required</Trans>;
                } else if (!new RegExp("^[a-zA-Z]{1,}\.[a-zA-Z]{1,5}$").test(values.username)) {
                    errors.username = <Trans id="invalidUsername">Invalid username</Trans>;
                }
                // validate password
                if (!values.password) {
                    errors.password = <Trans id="required">Required</Trans>;
                } else if (!new RegExp("((?=.*\d)(?=.*[a-zA-ZöäüÖÄÜß-]).{6,})?([0-9]{8})?").test(values.password)) {
                    errors.password = <Trans id="invalidPassword">Invalid Password</Trans>;
                }
                return errors;
            }}
            onSubmit={(values, { setSubmitting, setErrors }) => {
                const addMessage = httpsCallable(functions, 'checkCredentials');
                addMessage({ "passw": values.password, "user": values.username }).then((result) => {
                    console.log(result);
                    const data = result.data as { error: boolean, message: string };
                    if (data.error === true) {
                        setError(data.message);
                    } else {
                        nextStage();
                    }
                });
                setSubmitting(false);
            }}
        >
            {({ isSubmitting }) => (
                <Form>
                    <label className="flex flex-col mt-2 font-semibold">
                        <Trans id="username">Username</Trans>
                        <Field type="text" name="username" className="border-2 border-black text-lg rounded-lg p-1" />
                    </label>
                    <ErrorMessage name="username" component="div" className="text-red-400" />
                    <label className="flex flex-col mt-2 font-semibold">
                        <Trans id="password">Password</Trans>
                        <Field type="password" name="password" className="border-2 border-black text-lg rounded-lg p-1" />
                    </label>
                    <ErrorMessage name="password" component="div" className="text-red-400" />
                    {error && <div className="text-red-400">{error}</div>}
                    <button type="submit" disabled={isSubmitting} className="border-violet-900 border-2 px-2 py-1 rounded-lg float-right mt-2 text-lg">
                        <Trans id="submit">Submit</Trans>
                    </button>
                </Form>
            )}
        </Formik>
    )
}

function CreateAccountForm({ nextStage, setName }) {
    const [error, setError] = useState("");

    return (
        <Formik
            initialValues={{ name: '', email: '', password: ''}}
            validate={values => {
                const errors: { name?: any, email?: any, password?: any } = {};
                // validate name
                if (!values.name) {
                    errors.name = <Trans id="required">Required</Trans>;
                } else if (values.name.length < 3) {
                    errors.name = <Trans id="mustBe3Long">Must be at least 3 characters</Trans>;
                }
                // validate email
                if (!values.email) {
                    errors.email = <Trans id="required">Required</Trans>;
                } else if (
                    !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
                ) {
                    errors.email = <Trans id="invalidEmail">Invalid email address</Trans>;
                }
                // validate password
                if (!values.password) {
                    errors.password = <Trans id="required">Required</Trans>;
                } else if (values.password.length < 8) {
                    errors.password = <Trans id="mustBe8Long">Must be at least 8 characters</Trans>;
                }
                return errors;
            }}
            onSubmit={(values, { setSubmitting, setErrors }) => {
                setName(values.name);
                createUserWithEmailAndPassword(auth, values.email, values.password).then((user) => {
                    console.log(user);
                    nextStage();
                }, (err) => {
                    switch (err.code) {
                        case "auth/email-already-in-use":
                            setErrors({ email: messages.emailAlreadyInUse });
                            break;
                        case "auth/invalid-email":
                            setErrors({ email: messages.invalidEmail });
                            break;
                        case "auth/weak-password":
                            setErrors({ password: messages.passwordTooWeak });
                            break;
                        default:
                            setError("An unknown error occured");
                    }
                    setSubmitting(false)
                });
            }}
        >
            {({ isSubmitting }) => (
                <Form>
                    <label className="flex flex-col font-semibold">
                        <Trans id="name">Name</Trans>
                        <Field type="text" name="name" className="border-2 border-black text-lg rounded-lg p-1" />
                    </label>
                    <ErrorMessage name="name" component="div" className="text-red-400" />
                    <label className="flex flex-col mt-2 font-semibold">
                        <Trans id="email">Email</Trans>
                        <Field type="email" name="email" className="border-2 border-black text-lg rounded-lg p-1" />
                    </label>
                    <ErrorMessage name="email" component="div" className="text-red-400" />
                    <label className="flex flex-col mt-2 font-semibold">
                        <Trans id="password">Password</Trans>
                        <Field type="password" name="password" className="border-2 border-black text-lg rounded-lg p-1" />
                    </label>
                    <ErrorMessage name="password" component="div" className="text-red-400" />
                    {error && <div className="text-red-400">{error}</div>}
                    <button type="submit" disabled={isSubmitting} className="border-violet-900 border-2 px-2 py-1 rounded-lg float-right mt-2 text-lg">
                        <Trans id="submit">Submit</Trans>
                    </button>
                </Form>
            )}
        </Formik>
    )
}


/* export const getStaticProps = async (context) => {
    return {
        props: { context },
    };
}; */