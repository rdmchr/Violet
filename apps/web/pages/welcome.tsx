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

const auth = getAuth(app);
const functions = getFunctions(app);

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
    const [name, setName] = useState("Marc");
    const [stage, setStage] = useState(0);

    function nextStage() {
        setStage(stage + 1);
    }

    return (
        <div>
            <div onClick={nextStage}>
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
                            <Trans
                                id="helloName"
                                values={{ name }}
                            >Hello, {name}!</Trans>
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
                const errors: { username?: string, password?: string } = {};
                // validate username
                if (!values.username) {
                    errors.username = 'Required';
                } else if (!new RegExp("^[a-zA-Z]{1,}\.[a-zA-Z]{1,5}$").test(values.username)) {
                    errors.username = 'Invalid username';
                }
                // validate password
                if (!values.password) {
                    errors.password = 'Required';
                } else if (!new RegExp("((?=.*\d)(?=.*[a-zA-ZöäüÖÄÜß-]).{6,})?([0-9]{8})?").test(values.password)) {
                    errors.password = 'Invalid password';
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
            initialValues={{ name: '', email: '', password: '' }}
            validate={values => {
                const errors: { name?: string, email?: string, password?: string } = {};
                // validate name
                if (!values.name) {
                    errors.name = 'Required';
                } else if (values.name.length < 3) {
                    errors.name = 'Must be at least 3 characters';
                }
                // validate email
                if (!values.email) {
                    errors.email = 'Required';
                } else if (
                    !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
                ) {
                    errors.email = 'Invalid email address';
                }
                // validate password
                if (!values.password) {
                    errors.password = 'Required';
                } else if (values.password.length < 8) {
                    errors.password = 'Must be at least 8 characters';
                }
                return errors;
            }}
            onSubmit={(values, { setSubmitting, setErrors }) => {
                setName(values.name);
                createUserWithEmailAndPassword(auth, values.email, values.password).then((user) => {
                    console.log(user);
                    nextStage();
                }, (err) => {
                    console.error(err.code);
                    switch (err.code) {
                        case "auth/email-already-in-use":
                            setErrors({ email: "This email address is already in use" });
                            break;
                        case "auth/invalid-email":
                            setErrors({ email: "This email address is invalid" });
                            break;
                        case "auth/weak-password":
                            setErrors({ password: "This password is too weak" });
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