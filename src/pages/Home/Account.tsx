import { useCallback, useEffect, useRef, useState } from 'react';
import ConnectWallet from 'components/Connect/ConnectWallet';
import Gift from 'resources/images/gift.png';
import Medal from 'resources/images/medal.png';
import Icon from 'components/Icon';
import { useModal } from 'hooks';
import DepositModal from 'components/Modal/DepositModal';
import WithdrawModal from 'components/Modal/WithdrawModal';
import {
  useUserLotteryData,
  PendingWithdrawal
} from 'contexts/UserLotteryDataContext';
import Balance from 'classes/Balance';
import { useGlobalLotteryData } from 'contexts/GlobalLotteryDataContext';
import { useWallet } from 'contexts/WalletContext';
import ConnectImage from 'resources/images/account-connect-wallet.png';
import DepositSuccessImg from 'resources/images/deposit-success.png';

function secondsToDhm(seconds: number) {
  const day = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.ceil((seconds % 3600) / 60);

  const dDisplay = day > 0 ? day + (day === 1 ? ' day, ' : ' days, ') : '';
  const hDisplay =
    hours > 0 ? hours + (hours === 1 ? ' hour, ' : ' hours, ') : '';
  const mDisplay =
    minutes > 0 ? minutes + (minutes === 1 ? ' minute' : ' minutes') : '';

  return dDisplay + hDisplay + mDisplay;
}

const Account = () => {
  const { selectedAccount } = useWallet();
  const {
    ModalWrapper: DepositModalWrapper,
    showModal: showDepositModal,
    hideModal: hideDepositModal
  } = useModal();
  const {
    ModalWrapper: WithdrawModalWrapper,
    showModal: showWithdrawModal,
    hideModal: hideWithdrawModal
  } = useModal();
  const {
    userPendingWithdrawals,
    userLotteryActiveBalance,
    userWinningChance
  } = useUserLotteryData();

  const {
    lotteryNotInDrawingFreezeout,
    currentBlockNumber,
    nextDrawingBlockNumber,
    unstakeLockTime
  } = useGlobalLotteryData();
  const [totalDepositAmount, setTotalDepositAmount] = useState<Balance | null>(
    null
  );
  const [showClickMore, setShowClickMore] = useState(false);
  const initClickMore = useRef(false);

  const getRemainingTimeToBeLiquid = useCallback(
    (withdrawBlockNumber: number) => {
      if (!unstakeLockTime || !nextDrawingBlockNumber || !currentBlockNumber) {
        return '--';
      }
      let totalRemainingBlocks;
      if (nextDrawingBlockNumber - withdrawBlockNumber <= unstakeLockTime) {
        totalRemainingBlocks =
          nextDrawingBlockNumber - currentBlockNumber + unstakeLockTime;
      } else {
        totalRemainingBlocks = nextDrawingBlockNumber - currentBlockNumber;
      }
      return secondsToDhm(totalRemainingBlocks * 12);
    },
    [currentBlockNumber, nextDrawingBlockNumber, unstakeLockTime]
  );

  useEffect(() => {
    if (userLotteryActiveBalance !== null) {
      let total = userLotteryActiveBalance;
      userPendingWithdrawals?.forEach((withdrawing: PendingWithdrawal) => {
        total = total?.add(withdrawing.balance);
      });
      setTotalDepositAmount(total);
    }
  }, [userLotteryActiveBalance, userPendingWithdrawals]);

  useEffect(() => {
    if (initClickMore.current || userPendingWithdrawals === null) {
      return;
    }
    if (userPendingWithdrawals?.length > 5) {
      setShowClickMore(true);
      initClickMore.current = true;
    }
  }, [userPendingWithdrawals]);

  let _userPendingWithdrawals = userPendingWithdrawals;
  if (showClickMore && userPendingWithdrawals) {
    _userPendingWithdrawals = userPendingWithdrawals?.slice(0, 5);
  }

  const disabled = !lotteryNotInDrawingFreezeout;
  if (!selectedAccount) {
    return (
      <div className="bg-primary h-[370px] rounded-3xl flex flex-col items-center justify-center text-white">
        <img src={ConnectImage} width="200" height="200" alt="connect image" />
        <div className="text-primary font-content mt-4 mb-6 text-xl leading-[25px]">
          Connect wallet to view your balance
        </div>
        <ConnectWallet btnText="Connect Wallet" />
      </div>
    );
  }
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="font-content w-[590px] h-[320px] rounded-3xl bg-gradient-to-b from-[#FF6B00] to-[#FFA800] text-left p-12 text-tertiary relative">
          <div className="text-2xl leading-[30px] font-extrabold">
            Total Balance
          </div>
          <div className="flex items-center gap-2 my-2">
            <span className="font-title text-[40px] leading-[68px]">
              {totalDepositAmount?.toString(2)}
            </span>
            <span className="text-sm font-black">MANTA</span>
          </div>
          <div className="text-base leading-5 h-5">
            {disabled ? 'Deposit and Withdraw will reopen in a day' : ''}
          </div>
          <div className="mt-6 flex items-center justify-between">
            <button
              disabled={disabled}
              onClick={showDepositModal}
              className="btn-primary rounded-xl w-[235px] h-[66px] font-title text-xl"
            >
              Deposit
            </button>
            <DepositModalWrapper>
              <DepositModal hideModal={hideDepositModal} />
            </DepositModalWrapper>
            <button
              disabled={disabled}
              onClick={showWithdrawModal}
              className="btn-secondary rounded-xl w-[235px] h-[66px] font-title text-xl"
            >
              Withdraw
            </button>
            <WithdrawModalWrapper>
              <WithdrawModal
                hideModal={hideWithdrawModal}
                getRemainingTimeToBeLiquid={getRemainingTimeToBeLiquid}
              />
            </WithdrawModalWrapper>
          </div>
          <img
            src={Medal}
            className="absolute -top-[21px] -right-[30px]"
            width={'158'}
            height={'203'}
            alt="medal"
          />
        </div>
        <div className="w-[590px] flex flex-col gap-5">
          <div className="bg-primary h-[320px] rounded-3xl pl-12 pr-8 flex items-start justify-between">
            <div className="mt-[48px]">
              <div className="text-2xl font-content font-extrabold text-left">
                Winner Chance
              </div>
              <div className="font-title text-[40px] leading-[68px] pr-[61px] mt-2">
                {userWinningChance}
              </div>
            </div>
            <img
              src={DepositSuccessImg}
              className="mt-[35px]"
              width="270"
              height={'270'}
              alt="icon"
            />
          </div>
          {/* <div className="bg-primary h-[150px] rounded-3xl px-12 flex items-center justify-between">
            <div className="text-2xl font-content font-extrabold">
              Claimed
              <br />
              Prizes
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-title text-[40px] leading-[68px]">
                to be done
              </span>
              <span className="font-content text-sm font-black">MANTA</span>
            </div>
          </div>
          <div className="bg-primary h-[150px] rounded-3xl px-12 flex items-center justify-between relative">
            <div className="text-2xl font-content font-extrabold">
              Winner
              <br />
              Chance
            </div>
            <div className="font-title text-[40px] leading-[68px] pr-[61px]">
              {userWinningChance}
            </div>
            <img
              src={Gift}
              className="absolute top-[12px] -right-[58px]"
              width="141"
              height={'124'}
              alt="gift icon"
            />
          </div> */}
        </div>
      </div>
      <div>
        <div className="font-title text-xl leading-[34px] mt-6 mb-4">
          Saving
        </div>
        <div className="font-title text-base flex gap-5">
          <span className="bg-primary h-[35px] leading-[35px] flex-1 rounded-[6px]">
            Token
          </span>
          <span className="bg-primary h-[35px] leading-[35px] flex-1 rounded-[6px]">
            Amount
          </span>
          <span className="bg-primary h-[35px] leading-[35px] flex-1 rounded-[6px]">
            Balance
          </span>
        </div>
        <div className="font-content text-base flex gap-5 mt-2">
          <span className="bg-primary h-[48px] flex-1 rounded-[6px] flex items-center justify-center gap-4">
            <Icon name="manta" className="w-[21px] h-[21px]" />
            MANTA
          </span>
          <span className="bg-primary h-[48px] leading-[48px] flex-1 rounded-[6px]">
            {userLotteryActiveBalance?.toString()}
          </span>
          <span className="bg-primary h-[48px] leading-[48px] flex-1 rounded-[6px]">
            --
          </span>
        </div>
      </div>

      <div>
        <div className="font-title text-xl leading-[34px] mt-6 mb-4">
          Withdrawing
        </div>
        <div className="font-title text-base flex gap-5">
          <span className="bg-primary h-[35px] leading-[35px] flex-1 rounded-[6px]">
            Token
          </span>
          <span className="bg-primary h-[35px] leading-[35px] flex-1 rounded-[6px]">
            Amount
          </span>
          <span className="bg-primary h-[35px] leading-[35px] flex-1 rounded-[6px]">
            Time Remaining to be Liquid
          </span>
        </div>

        {_userPendingWithdrawals?.map((withdraw: PendingWithdrawal, index) => (
          <div className="font-content text-base flex gap-5 mt-2" key={index}>
            <span className="bg-primary h-[30px] flex-1 rounded-[6px] flex items-center justify-center gap-4">
              <Icon name="manta" className="w-[21px] h-[21px]" />
              MANTA
            </span>
            <span className="bg-primary h-[30px] leading-[30px] flex-1 rounded-[6px]">
              {withdraw.balance.toString()}
            </span>
            <span className="bg-primary h-[30px] leading-[30px] flex-1 rounded-[6px]">
              {getRemainingTimeToBeLiquid(withdraw.blockNumber)}
            </span>
          </div>
        ))}

        {showClickMore && (
          <div className="flex justify-center mt-4">
            <button
              className="flex flex-col items-center text-base leading-5 gap-2"
              onClick={() => setShowClickMore(false)}
            >
              Click to Show More
              <Icon name="chevronDown" />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Account;
