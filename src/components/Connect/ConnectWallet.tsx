import { useKeyring } from 'contexts/KeyringContext';
import { useModal } from 'hooks';
import ConnectWalletModal from 'components/Modal/connectWalletModal';
import Icon from 'components/Icon';

const ConnectWallet = ({
  isButton = true,
  buttonWithIcon = false,
  btnText = 'connect wallet'
}: {
  isButton?: boolean;
  buttonWithIcon?: boolean;
  btnText?: string;
}) => {
  const { resetWalletConnectingErrorMessages } = useKeyring();
  const { ModalWrapper, showModal, hideModal } = useModal({
    closeCallback: () => resetWalletConnectingErrorMessages()
  });

  const ButtonComponent = () => {
    if (isButton && buttonWithIcon) {
      return (
        <button className="flex items-center justify-center gap-4 font-title w-[291px] h-[54px] rounded-xl bg-white text-xl text-secondary">
          <Icon name="wallet" />
          {btnText}
        </button>
      );
    }
    if (isButton) {
      return (
        <button className="bg-button-primary w-[280px] h-[66px] font-title text-xl rounded-xl">
          {btnText}
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
