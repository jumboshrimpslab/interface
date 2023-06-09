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

  return (
    <div className="relative mt-6 px-6 py-[18px] flex items-center bg-primary justify-between rounded-xl w-full">
      <div className="flex flex-row items-center gap-4">
        {walletLogo && typeof walletLogo === 'object' ? (
          <img
            src={walletLogo.src}
            alt={walletLogo.alt}
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <Icon name={walletLogo} className="w-6 h-6 rounded-full" />
        )}
        <div className="text-primary text-xl">{walletName}</div>
      </div>

      {isWalletEnabled ? (
        <div className="flex items-center justify-center text-base w-[120px] h-10">
          <div className="flex items-center gap-2 ">
            <div className="rounded-xl full w-3 h-3 bg-button-primary" />
            <div className="text-secondary font-['Rammetto_One']">
              Connected
            </div>
          </div>
        </div>
      ) : isWalletInstalled ? (
        <button
          onClick={connectHandler}
          className="rounded-xl bg-button-primary text-white text-base font-['Rammetto_One'] w-[117px] h-[52px]"
        >
          Connect
        </button>
      ) : (
        <a href={walletInstallLink} target="_blank" rel="noreferrer">
          <div className="text-center rounded-xl bg-button-primary text-white text-base font-['Rammetto_One'] w-[117px] h-[52px] leading-[52px]">
            Install
          </div>
        </a>
      )}

      {errorMessage && (
        <p className="absolute -left-px -bottom-5 flex items-center gap-2 text-warning text-sm">
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
    <div className="w-[509px]">
      <h1 className="text-2xl leading-10 text-secondary font-['Rammetto_One']">
        Connect Wallet
      </h1>
      <SubstrateConnectWalletBlock hideModal={hideModal} />
      <p className="text-primary text-base leading-5 mt-4">
        Already installed? Try refreshing this page
      </p>
    </div>
  );
};

export default ConnectWalletModal;
