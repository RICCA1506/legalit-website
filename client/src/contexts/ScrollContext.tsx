import { createContext, useContext, useState, ReactNode } from "react";

interface ScrollContextType {
  hasScrolled: boolean;
  setHasScrolled: (value: boolean) => void;
  modalOpen: boolean;
  setModalOpen: (value: boolean) => void;
}

const ScrollContext = createContext<ScrollContextType | undefined>(undefined);

export function ScrollProvider({ children }: { children: ReactNode }) {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <ScrollContext.Provider value={{ hasScrolled, setHasScrolled, modalOpen, setModalOpen }}>
      {children}
    </ScrollContext.Provider>
  );
}

export function useScrollState() {
  const context = useContext(ScrollContext);
  if (context === undefined) {
    throw new Error("useScrollState must be used within a ScrollProvider");
  }
  return context;
}
