import classNames from 'classnames';
import { setLastAccessedWallet } from 'utils/persistence/lastAccessedWallet';
import getSubstrateWallets from 'utils/getSubstrateWallets';
import { useWallet } from 'contexts/WalletContext';
import type { Wallet } from 'manta-extension-connect';

const SubstrateWallets = () => {
  const { selectedWallet, authedWalletList, setSelectedWallet } = useWallet();
  const substrateWallets = getSubstrateWallets();
  const enabledExtentions = substrateWallets.filter(wallet =>
    authedWalletList.includes(wallet.extensionName)
  );
  const onClickWalletIconHandler = (wallet: Wallet) => async () => {
    setSelectedWallet(wallet);
    setLastAccessedWallet(wallet);
  };

  return (
    <>
      {enabledExtentions.map((wallet, index) => (
        <button
          className={classNames('px-5 py-5', {
            'bg-button-primary':
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
