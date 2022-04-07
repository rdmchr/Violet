import { createContext } from "react";

export const UserContext = createContext({user: null, name: null, uid: null, loading: true, colorScheme: null, setColorScheme: null});
