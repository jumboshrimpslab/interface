import classNames from 'classnames';
import { useCallback, useEffect, useState } from 'react';
import { useAccount } from 'contexts/AccountContext';
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

const Account = () => {
  const { selectedAccount } = useAccount();
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

  const getRemainingTimeToBeLiquid = useCallback(
    (withdrawBlockNumber: number) => {
      if (!unstakeLockTime || !nextDrawingBlockNumber || !currentBlockNumber) {
        return;
      }
      let totalRemainingBlocks;
      if (nextDrawingBlockNumber - withdrawBlockNumber <= unstakeLockTime) {
        totalRemainingBlocks =
          nextDrawingBlockNumber - currentBlockNumber + unstakeLockTime;
      } else {
        totalRemainingBlocks = nextDrawingBlockNumber - currentBlockNumber;
      }
      // for now, use minutes, will be updated before production
      return (totalRemainingBlocks * 12) / 60;
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

  const disabled = !lotteryNotInDrawingFreezeout;
  if (!selectedAccount) {
    return (
      <div className="bg-primary h-[202px] rounded-3xl flex flex-col items-center justify-center text-white">
        <div className="text-primary font-content mb-6 text-xl leading-[25px]">
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
              className={classNames(
                ' rounded-xl w-[235px] h-[66px] font-title text-xl',
                {
                  'bg-button-primary': !disabled,
                  'border border-primary/50 bg-secondary/20 text-secondary/80 cursor-not-allowed':
                    disabled
                }
              )}
            >
              Deposit
            </button>
            <DepositModalWrapper>
              <DepositModal hideModal={hideDepositModal} />
            </DepositModalWrapper>
            <button
              disabled={disabled}
              onClick={showWithdrawModal}
              className={classNames(
                ' rounded-xl w-[235px] h-[66px] font-title text-xl',
                {
                  'bg-white text-secondary': !disabled,
                  'border border-white/50 bg-white/20 text-white/80 cursor-not-allowed':
                    disabled
                }
              )}
            >
              Withdraw
            </button>
            <WithdrawModalWrapper>
              <WithdrawModal hideModal={hideWithdrawModal} />
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
          <div className="bg-primary h-[150px] rounded-3xl px-12 flex items-center justify-between">
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
          </div>
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
            to be done
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

        {userPendingWithdrawals?.map((withdraw: PendingWithdrawal, index) => (
          <div className="font-content text-base flex gap-5 mt-2" key={index}>
            <span className="bg-primary h-[30px] flex-1 rounded-[6px] flex items-center justify-center gap-4">
              <Icon name="manta" className="w-[21px] h-[21px]" />
              MANTA
            </span>
            <span className="bg-primary h-[30px] leading-[30px] flex-1 rounded-[6px]">
              {withdraw.balance.toString()}
            </span>
            <span className="bg-primary h-[30px] leading-[30px] flex-1 rounded-[6px]">
              {getRemainingTimeToBeLiquid(withdraw.blockNumber)} min
            </span>
          </div>
        ))}
      </div>
    </>
  );
};

export default Account;
