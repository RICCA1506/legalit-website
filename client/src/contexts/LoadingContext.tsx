import { createContext, useContext } from "react";

export const LoadingContext = createContext({ loadingComplete: true });
export function useLoadingState() { return useContext(LoadingContext); }
