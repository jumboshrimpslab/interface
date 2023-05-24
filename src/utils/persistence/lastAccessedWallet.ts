import store from 'store';
import type { Wallet } from 'manta-extension-connect';

const LAST_WALLET_STORAGE_KEY = 'lastAccessedWallet';

export const getLastAccessedWallet = () => {
  return store.get(LAST_WALLET_STORAGE_KEY);
};

export const setLastAccessedWallet = (wallet: Wallet) => {
  store.set(LAST_WALLET_STORAGE_KEY, wallet);
};
