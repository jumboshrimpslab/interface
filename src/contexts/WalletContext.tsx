import {
  useState,
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  Dispatch,
  SetStateAction
} from 'react';
import getSubstrateWallets from 'utils/getSubstrateWallets';
import APP_NAME from 'constants/AppConstants';
import WALLET_NAME from 'constants/WalletConstants';
import {
  getLastAccessedWallet,
  setLastAccessedWallet
} from 'utils/persistence/lastAccessedWallet';
import {
  getLastAccessedAccount,
  setLastAccessedAccount
} from 'utils/persistence/lastAccessedAccount';
import {
  getAuthedWalletListStorage,
  setAuthedWalletListStorage
} from 'utils/persistence/authedWalletList';
import { useSubstrate } from './SubstrateContext';
import type { Wallet, WalletAccount } from 'manta-extension-connect';

type WalletContextValue = {
  // wallets
  selectedWallet: Wallet | null;
  walletConnectingErrorMessages: { [key: string]: string };
  authedWalletList: string[];
  setSelectedWallet: Dispatch<SetStateAction<Wallet | null>>;
  resetWalletConnectingErrorMessages: () => void;
  connectWallet: (
    extensionName: string,
    saveToStorage?: boolean
  ) => Promise<boolean>;

  // accounts
  selectedAccount: WalletAccount | null;
  accountList: WalletAccount[];
  changeSelectedAccount: (account: WalletAccount) => Promise<void>;
};

const WalletContext = createContext<WalletContextValue | null>(null);

const getInitialWalletConnectingErrorMessages = () => {
  const errorMessages: { [key: string]: string } = {};
  Object.values(WALLET_NAME).forEach(
    (walletName: string) => (errorMessages[walletName] = '')
  );
  return errorMessages;
};

const WalletContextProvider = ({ children }: { children: ReactNode }) => {
  const { apiState } = useSubstrate();
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [authedWalletList, setAuthedWalletList] = useState<string[]>([]);
  const [walletConnectingErrorMessages, setWalletConnectingErrorMessages] =
    useState(getInitialWalletConnectingErrorMessages());
  const authedWalletInitialized = useRef(false);

  // accounts
  const [selectedAccount, setSelectedAccount] = useState<WalletAccount | null>(
    null
  );
  const [accountList, setAccountList] = useState<WalletAccount[]>([]);

  const [rerenderAccountList, setRerenderAccountList] = useState(false);

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

  const connectWallet = useCallback(
    async (extensionName: string, saveToStorage = true) => {
      if (apiState !== 'READY') {
        setWalletConnectingErrorMessages({
          ...walletConnectingErrorMessages,
          ...{ [extensionName]: 'api not ready, please wait a minute' }
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
        setSelectedWallet(connectingWallet);
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
    [authedWalletList, walletConnectingErrorMessages, apiState]
  );

  const connectWalletExtensions = async (extensionNames: string[]) => {
    let walletNames: string[] = [];
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
  };

  useEffect(() => {
    let unsub: any = null;
    async function subAccounts() {
      if (
        !selectedWallet?.subscribeAccounts ||
        !authedWalletInitialized.current
      ) {
        return;
      }
      unsub = await selectedWallet.subscribeAccounts(async (accounts: any) => {
        if (accounts.length === 0) {
          // disconnect wallet
          const prevAuthedWalletList = getAuthedWalletListStorage();
          const _authedWalletList = [...prevAuthedWalletList];
          const index = _authedWalletList.indexOf(selectedWallet.extensionName);
          if (index > -1) {
            _authedWalletList.splice(index, 1);
            setAuthedWalletList(_authedWalletList);
            setAuthedWalletListStorage(_authedWalletList);
            const wallets = getSubstrateWallets();
            if (_authedWalletList.length > 0) {
              const defaultWallet = wallets.find(
                wallet => wallet.extensionName === _authedWalletList[0]
              );
              if (defaultWallet) {
                setSelectedWallet(defaultWallet);
                setAuthedWalletList(_authedWalletList);
                setAuthedWalletListStorage(_authedWalletList);
                return;
              }
            }
            setSelectedWallet(null);
            setSelectedAccount(null);
            setAuthedWalletList([]);
            setAuthedWalletListStorage([]);
          }
        } else {
          setRerenderAccountList(prev => !prev);
        }
      });
    }
    subAccounts().catch(console.error);
    return () => unsub?.();
  }, [selectedWallet]);

  useEffect(() => {
    async function connectWallets() {
      // use authedWalletInitialized.current to make sure only initilize authedWalletList once
      if (apiState !== 'READY' || authedWalletInitialized.current) {
        return;
      }
      const prevAuthedWalletList = getAuthedWalletListStorage();
      if (prevAuthedWalletList.length !== 0) {
        await connectWalletExtensions(prevAuthedWalletList);
      }
      authedWalletInitialized.current = true;
    }
    connectWallets().catch(console.error);
  }, [apiState]);

  // ensure selectedAccount is the first item of accountList
  const orderAccountList = (
    selectedAccount: WalletAccount,
    newAccounts: WalletAccount[]
  ) => {
    const orderedNewAccounts = [];
    orderedNewAccounts.push(selectedAccount);
    newAccounts.forEach(account => {
      if (account.address !== selectedAccount.address) {
        orderedNewAccounts.push(account);
      }
    });
    return orderedNewAccounts;
  };

  const updateAccountList = useCallback(
    async (account: WalletAccount, newAccounts: WalletAccount[]) => {
      setSelectedAccount(account);
      setLastAccessedAccount(account);
      setAccountList(orderAccountList(account, newAccounts));
    },
    []
  );

  const changeSelectedAccount = useCallback(
    async (account: WalletAccount) => {
      updateAccountList(account, accountList);
    },
    [updateAccountList, accountList]
  );

  useEffect(() => {
    async function renderAccountList() {
      if (!selectedWallet) {
        return;
      }
      const accounts: WalletAccount[] = await selectedWallet.getAccounts();
      // ethereum account address should be avoid in substrate (tailsman)
      const substrateAccounts = accounts.filter((account: any) =>
        ['ecdsa', 'ed25519', 'sr25519'].includes(account.type)
      );
      if (substrateAccounts.length === 0) {
        console.error(`no accounts in ${selectedWallet.extensionName}`);
        return;
      }
      // The user's default account is either their last accessed account,
      // or, as a fallback, the first account in their wallet
      const activeAccount =
        getLastAccessedAccount(
          substrateAccounts,
          selectedWallet.extensionName
        ) || substrateAccounts[0];
      updateAccountList(activeAccount, substrateAccounts);
    }
    renderAccountList().catch(console.error);
  }, [updateAccountList, rerenderAccountList]);

  const state = useMemo(
    () => ({
      selectedWallet,
      authedWalletList,
      walletConnectingErrorMessages,
      selectedAccount,
      accountList,
      changeSelectedAccount,
      setSelectedWallet,
      resetWalletConnectingErrorMessages,
      connectWallet
    }),
    [
      selectedWallet,
      authedWalletList,
      walletConnectingErrorMessages,
      selectedAccount,
      accountList,
      changeSelectedAccount,
      setSelectedWallet,
      resetWalletConnectingErrorMessages,
      connectWallet
    ]
  );

  return (
    <WalletContext.Provider value={state}>{children}</WalletContext.Provider>
  );
};

const useWallet = () => useContext(WalletContext) as WalletContextValue;

export { WalletContextProvider, useWallet };
