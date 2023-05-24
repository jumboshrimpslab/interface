import { getWallets } from 'manta-extension-connect';
import WALLET_NAME from 'constants/WalletConstants';

const getSubstrateWallets = () => {
  return getWallets().filter(wallet =>
    Object.values(WALLET_NAME).includes(wallet.extensionName)
  );
};

export default getSubstrateWallets;
