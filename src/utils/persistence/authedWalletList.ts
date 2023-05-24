import store from 'store';

const AUTHED_WALLET_LIST = 'authedWalletList';

export const setAuthedWalletListStorage = (walletNames: string[]) => {
  store.set(AUTHED_WALLET_LIST, walletNames);
};

export const getAuthedWalletListStorage = () => {
  return store.get(AUTHED_WALLET_LIST, []);
};
