import Icon, { IconName } from 'components/Icon';
import { useAccount } from 'contexts/AccountContext';
import getErrMsgAfterRemovePathname from 'utils/display/getErrMsgAfterRemovePathname';
import getWalletDisplayName from 'utils/display/getWalletDisplayName';
import getSubstrateWallets from 'utils/getSubstrateWallets';
import { useKeyring } from 'contexts/KeyringContext';
import WALLET_NAME from 'constants/WalletConstants';

type connectWalletBlock = {
  extensionName: string;
  walletName: string;
  walletInstallLink: string;
  walletLogo: IconName | { src: string; alt: string };
  isWalletInstalled: boolean | undefined;
  isWalletEnabled: boolean;
  connectHandler: () => void;
};

const ConnectWalletBlock = ({
  extensionName,
  walletName,
  isWalletInstalled,
  walletInstallLink,
  walletLogo,
  isWalletEnabled,
  connectHandler
}: connectWalletBlock) => {
  const { walletConnectingErrorMessages } = useKeyring();
  const errorMessage = walletConnectingErrorMessages[extensionName];

  const getDisplayedErrorMessage = () => {
    const talismanExtNotConfiguredString =
      'Talisman extension has not been configured yet. Please continue with onboarding.';
    if (
      extensionName === WALLET_NAME.TALISMAN &&
      errorMessage === talismanExtNotConfiguredString
    ) {
      return 'You have no account in Talisman. Please create one first.';
    }
    return getErrMsgAfterRemovePathname(errorMessage);
  };

  const WalletNameBlock = () => {
    return (
      <div className="text-sm flex items-center gap-3 leading-5">
        {walletName}
      </div>
    );
  };

  return (
    <div className="relative mt-6 p-4 flex items-center justify-between border border-white/10 text-white rounded-lg w-full">
      <div className="flex flex-row items-center gap-4">
        {walletLogo && typeof walletLogo === 'object' ? (
          <img
            src={walletLogo.src}
            alt={walletLogo.alt}
            className="w-6 h-6 rounded-full"
          />
        ) : (
          <Icon name={walletLogo} className="w-6 h-6 rounded-full" />
        )}
        <WalletNameBlock />
      </div>

      {isWalletEnabled ? (
        <div className="flex items-center justify-center text-xs w-[120px] h-10">
          <div className="flex items-center gap-3">
            <div className="rounded full w-2 h-2 bg-green-300" />
            Connected
          </div>
        </div>
      ) : isWalletInstalled ? (
        <button
          onClick={connectHandler}
          className="rounded-lg bg-button-thirdry text-white text-sm w-[120px] h-10"
        >
          Connect
        </button>
      ) : (
        <a href={walletInstallLink} target="_blank" rel="noreferrer">
          <div className="text-center rounded-lg bg-button-fourth text-white text-sm w-[120px] h-10 leading-10">
            Install
          </div>
        </a>
      )}

      {errorMessage && (
        <p className="absolute -left-px -bottom-5 flex flex-row gap-2 b-0 text-warning text-xs">
          <Icon name="information" />
          {getDisplayedErrorMessage()}
        </p>
      )}
    </div>
  );
};

export const SubstrateConnectWalletBlock = ({
  hideModal
}: {
  hideModal: () => void;
}) => {
  const { connectWallet, authedWalletList } = useKeyring();
  const { selectedAccount } = useAccount();

  const substrateWallets = getSubstrateWallets();
  // display Manta Wallet as the first wallet
  const mantaWalletIndex = substrateWallets.findIndex(
    wallet => wallet.extensionName === WALLET_NAME.MANTA
  );
  substrateWallets.unshift(substrateWallets.splice(mantaWalletIndex, 1)[0]);

  const handleConnectWallet = (walletName: string) => async () => {
    const isConnected = await connectWallet(walletName);
    if (isConnected) {
      hideModal();
    }
  };

  return (
    <>
      {substrateWallets.map(wallet => {
        // wallet.extension would not be defined if enabled not called
        // but for Talisman, when user reject, wallet.extension is still true
        // so we need another method to check the wallet connect status
        const isWalletEnabled =
          !!selectedAccount && authedWalletList.includes(wallet.extensionName);
        return (
          <ConnectWalletBlock
            key={wallet.extensionName}
            extensionName={wallet.extensionName}
            walletName={getWalletDisplayName(wallet.extensionName)}
            isWalletInstalled={wallet.installed}
            walletInstallLink={wallet.installUrl}
            walletLogo={wallet.logo}
            isWalletEnabled={isWalletEnabled}
            connectHandler={handleConnectWallet(wallet.extensionName)}
          />
        );
      })}
    </>
  );
};

const ConnectWalletModal = ({ hideModal }: { hideModal: () => void }) => {
  return (
    <div className="w-[506px]">
      <h1 className="text-xl text-white">Connect Wallet</h1>
      <SubstrateConnectWalletBlock hideModal={hideModal} />
      <p className="flex flex-row gap-2 mt-5 text-secondary text-xs">
        <Icon name="information" />
        Already installed? Try refreshing this page
      </p>
    </div>
  );
};

export default ConnectWalletModal;
