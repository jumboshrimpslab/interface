import { useState } from 'react';
import BannerImage from 'resources/images/banner.png';
import Connect from 'components/Connect';
import ConnectWallet from 'components/Connect/ConnectWallet';
import { useAccount } from 'contexts/AccountContext';
import { useModal } from 'hooks';
import DepositModal from 'components/Modal/DepositModal';

const Banner = () => {
  const { selectedAccount } = useAccount();
  const { ModalWrapper, showModal, hideModal } = useModal();
  const [drawHasEnded] = useState(false);
  const ButtonBlock = () => {
    if (drawHasEnded) {
      return (
        <button className="bg-[#FC6A00]/20 border border-[#FC6A00]/50 text-secondary/80 px-[48px] h-[66px] font-title text-xl rounded-xl cursor-default">
          Deposit for draw #4 has ended
        </button>
      );
    }
    if (selectedAccount) {
      return (
        <>
          <button
            onClick={showModal}
            className="bg-[#FC6A00] w-[280px] h-[66px] font-title text-xl rounded-xl"
          >
            Deposit Now
          </button>
          <ModalWrapper>
            <DepositModal hideModal={hideModal} />
          </ModalWrapper>
        </>
      );
    }

    return <ConnectWallet btnText="Deposit Now" />;
  };

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
