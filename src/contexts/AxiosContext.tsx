import {
  useState,
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useEffect
} from 'react';
import initAxios from 'utils/api/initAxios';
import config from 'config';

type AxiosContextValue = {
  axiosIsInit: boolean;
};
const AxiosContext = createContext<AxiosContextValue | null>(null);

const AxiosContextProvider = ({ children }: { children: ReactNode }) => {
  const [axiosIsInit, setAxiosIsInit] = useState(false);

  useEffect(() => {
    initAxios(config);
    setAxiosIsInit(true);
  }, []);

  const state = useMemo(() => ({ axiosIsInit }), [axiosIsInit]);

  return (
    <AxiosContext.Provider value={state}>{children}</AxiosContext.Provider>
  );
};

const useAxios = () => useContext(AxiosContext) as AxiosContextValue;

export { AxiosContextProvider, useAxios };
