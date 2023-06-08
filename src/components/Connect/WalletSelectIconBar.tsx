import classNames from 'classnames';
import { setLastAccessedWallet } from 'utils/persistence/lastAccessedWallet';
import getSubstrateWallets from 'utils/getSubstrateWallets';
import { useKeyring } from 'contexts/KeyringContext';
import type { Wallet } from 'manta-extension-connect';

const SubstrateWallets = () => {
  const { refreshWalletAccounts, selectedWallet, authedWalletList } =
    useKeyring();
  const substrateWallets = getSubstrateWallets();
  const enabledExtentions = substrateWallets.filter(wallet =>
    authedWalletList.includes(wallet.extensionName)
  );
  const onClickWalletIconHandler = (wallet: Wallet) => async () => {
    await refreshWalletAccounts(wallet);
    setLastAccessedWallet(wallet);
  };

  return (
    <>
      {enabledExtentions.map((wallet, index) => (
        <button
          className={classNames('px-5 py-5', {
            'bg-[#FF6B00]':
              wallet.extensionName === selectedWallet?.extensionName,
            'rounded-tl-lg': index === 0
          })}
          key={wallet.extensionName}
          onClick={onClickWalletIconHandler(wallet)}
        >
          <img
            className="w-6 h-6 max-w-6 max-h-6"
            src={wallet.logo.src}
            alt={wallet.logo.alt}
          />
        </button>
      ))}
    </>
  );
};

const WalletSelectIconBar = () => {
  return <SubstrateWallets />;
};

export default WalletSelectIconBar;
