import { createContext, useContext, useState, useCallback } from "react";

interface LinkedInCardContextType {
  isCardVisible: boolean;
  setCardVisible: (visible: boolean) => void;
  showInHeader: boolean;
}

const LinkedInCardContext = createContext<LinkedInCardContextType>({
  isCardVisible: true,
  setCardVisible: () => {},
  showInHeader: false,
});

export function LinkedInCardProvider({ children }: { children: React.ReactNode }) {
  const [isCardVisible, setIsCardVisible] = useState(true);

  const setCardVisible = useCallback((visible: boolean) => {
    setIsCardVisible(visible);
  }, []);

  const showInHeader = !isCardVisible;

  return (
    <LinkedInCardContext.Provider value={{ isCardVisible, setCardVisible, showInHeader }}>
      {children}
    </LinkedInCardContext.Provider>
  );
}

export function useLinkedInCard() {
  return useContext(LinkedInCardContext);
}
