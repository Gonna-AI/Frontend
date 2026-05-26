import { createContext, useContext, useState } from 'react';

interface CRMContextType {
  search: string;
  setSearch: (s: string) => void;
}

const CRMContext = createContext<CRMContextType>({ search: '', setSearch: () => {} });

export function CRMProvider({ children }: { children: React.ReactNode }) {
  const [search, setSearch] = useState('');
  return <CRMContext.Provider value={{ search, setSearch }}>{children}</CRMContext.Provider>;
}

export const useCRMSearch = () => useContext(CRMContext);
