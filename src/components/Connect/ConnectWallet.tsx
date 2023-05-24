import { useKeyring } from 'contexts/KeyringContext';
import { useModal } from 'hooks';
import ConnectWalletModal from 'components/Modal/connectWalletModal';
import Icon from 'components/Icon';

const ConnectWallet = ({ isButton = true }: { isButton?: boolean }) => {
  const { resetWalletConnectingErrorMessages } = useKeyring();
  const { ModalWrapper, showModal, hideModal } = useModal({
    closeCallback: () => resetWalletConnectingErrorMessages()
  });

  const ButtonComponent = () => {
    if (isButton) {
      return (
        <button className="text-sm h-10 w-44 rounded-lg bg-[#00AFA5]">
          Connect Wallet
        </button>
      );
    }
    return <Icon name="plusCircle" className="cursor-pointer" />;
  };

  return (
    <>
      <div onClick={showModal}>
        <ButtonComponent />
      </div>
      <ModalWrapper>
        <ConnectWalletModal hideModal={hideModal} />
      </ModalWrapper>
    </>
  );
};

export default ConnectWallet;
