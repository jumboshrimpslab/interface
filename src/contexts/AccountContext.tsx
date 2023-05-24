import {
  useState,
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useEffect,
  useCallback
} from 'react';
import {
  getLastAccessedAccount,
  setLastAccessedAccount
} from 'utils/persistence/lastAccessedAccount';
import { useKeyring } from './KeyringContext';
import type { KeyringPair } from '@polkadot/keyring/types';

type AccountContextValue = {
  selectedAccount: KeyringPair | null;
  accountList: KeyringPair[];
  updateAccountList: (
    account: KeyringPair,
    newAccounts: KeyringPair[]
  ) => Promise<void>;
  changeSelectedAccount: (account: KeyringPair) => Promise<void>;
};
const AccountContext = createContext<AccountContextValue | null>(null);

const AccountContextProvider = ({ children }: { children: ReactNode }) => {
  const [selectedAccount, setSelectedAccount] = useState<KeyringPair | null>(
    null
  );
  const [accountList, setAccountList] = useState<KeyringPair[]>([]);
  const { keyring, isKeyringInit, keyringAddresses } = useKeyring();

  // ensure selectedAccount is the first item of accountList
  const orderAccountList = (
    selectedAccount: KeyringPair,
    newAccounts: KeyringPair[]
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
    async (account: KeyringPair, newAccounts: KeyringPair[]) => {
      setSelectedAccount(account);
      setLastAccessedAccount(account);
      setAccountList(orderAccountList(account, newAccounts));
    },
    []
  );

  const changeSelectedAccount = useCallback(
    async (account: KeyringPair) => {
      updateAccountList(account, accountList);
    },
    [updateAccountList, accountList]
  );

  useEffect(() => {
    if (!isKeyringInit || keyringAddresses.length === 0) {
      return;
    }
    const accounts = keyring.getPairs();
    if (accounts.length === 0) {
      return;
    }
    const {
      meta: { source }
    } = accounts[0];
    // The user's default account is either their last accessed polkadot.js account,
    // or, as a fallback, the first account in their polkadot.js wallet
    const activeAccount =
      getLastAccessedAccount(keyring, source) || accounts[0];
    updateAccountList(activeAccount, accounts);
  }, [isKeyringInit, keyring, keyringAddresses, updateAccountList]);

  const state = useMemo(
    () => ({
      selectedAccount,
      accountList,
      updateAccountList,
      changeSelectedAccount
    }),
    [selectedAccount, accountList, updateAccountList, changeSelectedAccount]
  );

  return (
    <AccountContext.Provider value={state}>{children}</AccountContext.Provider>
  );
};

const useAccount = () => useContext(AccountContext) as AccountContextValue;

export { AccountContextProvider, useAccount };
