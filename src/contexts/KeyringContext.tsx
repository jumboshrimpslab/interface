import {
  useState,
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useMemo
} from 'react';
import { keyring } from '@polkadot/ui-keyring';
import config from '../config';
import { useSubstrate } from './SubstrateContext';

type KeyringContextValue = {
  isKeyringInit: boolean;
};
const KeyringContext = createContext<KeyringContextValue | null>(null);

const KeyringContextProvider = ({ children }: { children: ReactNode }) => {
  const [isKeyringInit, setIsKeyringInit] = useState(false);
  const { apiState } = useSubstrate();

  useEffect(() => {
    function initKeyring() {
      if (apiState === 'READY' && !isKeyringInit) {
        // just template, will change in the future
        const isCalamari = window.location.pathname?.includes('calamari');
        keyring.loadAll(
          {
            ss58Format: isCalamari
              ? config.ss58Format.CALAMARI
              : config.ss58Format.DOLPHIN
          },
          []
        );
        setIsKeyringInit(true);
      }
    }
    initKeyring();
  }, [apiState, isKeyringInit]);

  const state = useMemo(
    () => ({
      isKeyringInit
    }),
    [isKeyringInit]
  );

  return (
    <KeyringContext.Provider value={state}>{children}</KeyringContext.Provider>
  );
};

const useKeyring = () => useContext(KeyringContext);

export { KeyringContextProvider, useKeyring };
