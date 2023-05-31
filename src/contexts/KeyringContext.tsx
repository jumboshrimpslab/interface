import {
  useState,
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useMemo,
  useCallback,
  useRef
} from 'react';
import { keyring, Keyring } from '@polkadot/ui-keyring';
import getSubstrateWallets from 'utils/getSubstrateWallets';
import APP_NAME from 'constants/AppConstants';
import WALLET_NAME from 'constants/WalletConstants';
import {
  getLastAccessedWallet,
  setLastAccessedWallet
} from 'utils/persistence/lastAccessedWallet';
import {
  getAuthedWalletListStorage,
  setAuthedWalletListStorage
} from 'utils/persistence/authedWalletList';
import config from '../config';
import { useSubstrate } from './SubstrateContext';
import type { Wallet } from 'manta-extension-connect';

type KeyringContextValue = {
  keyring: Keyring;
  isKeyringInit: boolean;
  keyringAddresses: string[];
  selectedWallet: Wallet | null;
  walletConnectingErrorMessages: { [key: string]: string };
  authedWalletList: string[];
  resetWalletConnectingErrorMessages: () => void;
  connectWallet: (
    extensionName: string,
    saveToStorage?: boolean
  ) => Promise<boolean>;
  refreshWalletAccounts: (wallet: Wallet) => Promise<void>;
};
const KeyringContext = createContext<KeyringContextValue | null>(null);

const getInitialWalletConnectingErrorMessages = () => {
  const errorMessages: { [key: string]: string } = {};
  Object.values(WALLET_NAME).forEach(
    (walletName: string) => (errorMessages[walletName] = '')
  );
  return errorMessages;
};

const KeyringContextProvider = ({ children }: { children: ReactNode }) => {
  const { apiState } = useSubstrate();
  const [isKeyringInit, setIsKeyringInit] = useState(false);
  const [keyringAddresses, setKeyringAddresses] = useState<string[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [authedWalletList, setAuthedWalletList] = useState<string[]>([]);
  const [walletConnectingErrorMessages, setWalletConnectingErrorMessages] =
    useState(getInitialWalletConnectingErrorMessages());
  const authedWalletInitialized = useRef(false);

  const resetWalletConnectingErrorMessages = useCallback(() => {
    setWalletConnectingErrorMessages(getInitialWalletConnectingErrorMessages());
  }, []);

  const addWalletName = (walletName: string, walletNameList: string[]) => {
    const copyWalletNameList = [...walletNameList];
    if (!copyWalletNameList.includes(walletName)) {
      copyWalletNameList.push(walletName);
      return copyWalletNameList;
    }
    return copyWalletNameList;
  };

  const refreshWalletAccounts = useCallback(
    async (wallet: Wallet) => {
      const currentKeyringAddresses = keyring
        .getAccounts()
        .map(account => account.address);
      const originUpdatedAccounts = await wallet.getAccounts();
      const updatedAccounts = originUpdatedAccounts.filter(a => {
        // ethereum account address should be avoid in substrate (tailsman)
        // @ts-ignore
        return ['ecdsa', 'ed25519', 'sr25519'].includes(a.type);
      });
      const substrateAddresses: string[] = updatedAccounts.map(
        account => account.address
      );
      currentKeyringAddresses.forEach(address => {
        keyring.forgetAccount(address);
      });

      updatedAccounts.forEach(account => {
        // loadInjected is a privated function, will caused eslint error
        // @ts-ignore
        keyring.loadInjected(account.address, { ...account }, account.type);
      });

      // to prevent re-render when keyringAddresses not change
      const sameLength = keyringAddresses.length === substrateAddresses.length;
      const keyringAddressesNotChanged =
        sameLength &&
        keyringAddresses.filter(addr => !substrateAddresses.includes(addr))
          .length === 0;
      if (!keyringAddressesNotChanged) {
        setKeyringAddresses(substrateAddresses);
      }
      setSelectedWallet(wallet);
    },
    [keyringAddresses]
  );

  const connectWallet = useCallback(
    async (extensionName: string, saveToStorage = true) => {
      if (!isKeyringInit) {
        setWalletConnectingErrorMessages({
          ...walletConnectingErrorMessages,
          ...{ [extensionName]: 'not init keyring yet' }
        });
        return false;
      }
      if (walletConnectingErrorMessages[extensionName]) {
        setWalletConnectingErrorMessages({
          ...walletConnectingErrorMessages,
          ...{ [extensionName]: '' }
        });
      }
      const substrateWallets = getSubstrateWallets();
      const connectingWallet = substrateWallets.find(
        wallet => wallet.extensionName === extensionName
      );

      if (!connectingWallet) {
        setWalletConnectingErrorMessages({
          ...walletConnectingErrorMessages,
          ...{ [extensionName]: `${extensionName} not found` }
        });
        return false;
      }

      try {
        if (
          !connectingWallet?.extension ||
          (extensionName === WALLET_NAME.TALISMAN &&
            !authedWalletList.includes(extensionName))
        ) {
          await connectingWallet?.enable(APP_NAME);
        }
        await refreshWalletAccounts(connectingWallet);
        saveToStorage && setLastAccessedWallet(connectingWallet);

        if (authedWalletInitialized.current) {
          const newAuthedWalletList = addWalletName(
            extensionName,
            authedWalletList
          );
          setAuthedWalletList(newAuthedWalletList);
          setAuthedWalletListStorage(newAuthedWalletList);
        }

        return true;
      } catch (e: any) {
        setWalletConnectingErrorMessages({
          ...walletConnectingErrorMessages,
          ...{ [extensionName]: e.message }
        });
        return false;
      }
    },
    [
      authedWalletList,
      walletConnectingErrorMessages,
      isKeyringInit,
      refreshWalletAccounts
    ]
  );

  const connectWalletExtensions = useCallback(
    async (extensionNames: string[]) => {
      let walletNames = [...authedWalletList];
      const lastAccessExtensionName = getLastAccessedWallet()?.extensionName;
      for (const extensionName of extensionNames.filter(
        name => name !== lastAccessExtensionName
      )) {
        const isConnectedSuccess = await connectWallet(extensionName, false);
        if (isConnectedSuccess) {
          walletNames = addWalletName(extensionName, walletNames);
        }
      }
      if (lastAccessExtensionName) {
        const isConnectedSuccess = await connectWallet(
          lastAccessExtensionName,
          true
        );
        if (isConnectedSuccess) {
          walletNames = addWalletName(lastAccessExtensionName, walletNames);
        }
      }
      setAuthedWalletList(walletNames);
      setAuthedWalletListStorage(walletNames);
    },
    [connectWallet, authedWalletList]
  );

  useEffect(() => {
    function initKeyring() {
      if (apiState === 'READY' && !isKeyringInit) {
        // just template, will change in the future
        // const isCalamari = window.location.pathname?.includes('calamari');
        keyring.loadAll({ ss58Format: config.SS58_FORMAT.CALAMARI }, []);
        setIsKeyringInit(true);
      }
    }
    initKeyring();
  }, [apiState, isKeyringInit]);

  useEffect(() => {
    let unsub: any = null;
    async function subAccounts() {
      if (!selectedWallet?.subscribeAccounts) {
        return;
      }
      unsub = await selectedWallet.subscribeAccounts(() => {
        refreshWalletAccounts(selectedWallet);
      });
    }
    subAccounts().catch(console.error);
    return () => unsub && unsub();
  }, [selectedWallet]);

  useEffect(() => {
    // use authedWalletInitialized.current to make sure only initilize authedWalletList once
    if (!isKeyringInit || authedWalletInitialized.current) {
      return;
    }
    const prevAuthedWalletList = getAuthedWalletListStorage();
    if (prevAuthedWalletList.length !== 0) {
      connectWalletExtensions(prevAuthedWalletList);
    }
    authedWalletInitialized.current = true;
  }, [isKeyringInit, connectWalletExtensions]);

  const state = useMemo(
    () => ({
      keyring,
      isKeyringInit,
      keyringAddresses,
      selectedWallet,
      authedWalletList,
      walletConnectingErrorMessages,
      resetWalletConnectingErrorMessages,
      connectWallet,
      refreshWalletAccounts
    }),
    [
      isKeyringInit,
      keyringAddresses,
      selectedWallet,
      authedWalletList,
      walletConnectingErrorMessages,
      resetWalletConnectingErrorMessages,
      connectWallet,
      refreshWalletAccounts
    ]
  );

  return (
    <KeyringContext.Provider value={state}>{children}</KeyringContext.Provider>
  );
};

const useKeyring = () => useContext(KeyringContext) as KeyringContextValue;

export { KeyringContextProvider, useKeyring };
