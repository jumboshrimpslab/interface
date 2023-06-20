import { useWallet } from 'contexts/WalletContext';
import { useModal } from 'hooks';
import ConnectWalletModal from 'components/Modal/connectWalletModal';
import Icon from 'components/Icon';
import { useSubstrate } from 'contexts/SubstrateContext';

const ConnectWallet = ({
  isButton = true,
  buttonWithIcon = false,
  btnText = 'connect wallet'
}: {
  isButton?: boolean;
  buttonWithIcon?: boolean;
  btnText?: string;
}) => {
  const { resetWalletConnectingErrorMessages } = useWallet();
  const { ModalWrapper, showModal, hideModal } = useModal({
    closeCallback: () => resetWalletConnectingErrorMessages()
  });

  const { apiState } = useSubstrate();
  const disabled = apiState !== 'READY';

  const ButtonComponent = () => {
    if (isButton && buttonWithIcon) {
      return (
        <button
          disabled={disabled}
          className="btn-secondary flex items-center justify-center gap-4 font-title w-[291px] h-[54px] rounded-xl text-xl"
        >
          <Icon name="wallet" />
          {btnText}
        </button>
      );
    }
    if (isButton) {
      return (
        <button
          disabled={disabled}
          className="btn-primary w-[280px] h-[66px] font-title text-xl rounded-xl"
        >
          {btnText}
        </button>
      );
    }
    return (
      <div className="text-secondary hover:text-[#FC4C00] active:text-[#B93700]">
        <Icon name="plusCircle" className="cursor-pointer" />
      </div>
    );
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
