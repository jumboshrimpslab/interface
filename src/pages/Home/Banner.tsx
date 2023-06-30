import classNames from 'classnames';
import BannerImage from 'resources/images/banner.png';
import Connect from 'components/Connect';
import ConnectWallet from 'components/Connect/ConnectWallet';
import { useModal } from 'hooks';
import DepositModal from 'components/Modal/DepositModal';
import { useGlobalLotteryData } from 'contexts/GlobalLotteryDataContext';
import { useWallet } from 'contexts/WalletContext';

const ButtonBlock = () => {
  const { selectedAccount } = useWallet();
  const { lotteryNotInDrawingFreezeout } = useGlobalLotteryData();
  const { ModalWrapper, showModal, hideModal } = useModal();

  if (selectedAccount) {
    return (
      <>
        <button
          onClick={showModal}
          disabled={!lotteryNotInDrawingFreezeout}
          className={classNames({
            'btn-primary w-[280px] h-[66px] font-title text-xl rounded-xl':
              lotteryNotInDrawingFreezeout && selectedAccount,
            'bg-button-primary/20 text-white/50 px-[48px] h-[66px] font-title text-xl rounded-xl cursor-default':
              !lotteryNotInDrawingFreezeout
          })}
        >
          {lotteryNotInDrawingFreezeout
            ? 'Deposit Now'
            : 'Deposit for Draw #1 has Closed for Winner Selection Underway'}
        </button>
        <ModalWrapper>
          <DepositModal hideModal={hideModal} />
        </ModalWrapper>
      </>
    );
  }

  return <ConnectWallet btnText="Deposit Now" />;
};

const Banner = () => {
  return (
    <div className="h-[522px] bg-[url(resources/images/banner-background.png)] bg-[length:100%] bg-no-repeat	">
      <img src={BannerImage} width="1440" height="522" className="mx-auto" />
      <div className="relative bottom-[322px] text-white text-center">
        <div className="font-title text-[64px]">Win by Saving</div>
        <div className="font-content text-base leading-5 mt-2 mb-6">
          Save money and have a chance to win every week. <br />
          Even if you don&apos;t win, keep all of your money!
        </div>
        <ButtonBlock />
      </div>
      <div className="absolute top-[65px] right-[120px]">
        <Connect />
      </div>
    </div>
  );
};

export default Banner;
