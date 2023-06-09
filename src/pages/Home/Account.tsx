import classNames from 'classnames';
import { useAccount } from 'contexts/AccountContext';
import ConnectWallet from 'components/Connect/ConnectWallet';
import Gift from 'resources/images/gift.png';
import Medal from 'resources/images/medal.png';
import Icon from 'components/Icon';
import { useModal } from 'hooks';
import DepositModal from 'components/Modal/DepositModal';
import WithdrawModal from 'components/Modal/WithdrawModal';

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
  const disabled = false;
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
            <span className="font-title text-[40px] leading-[68px]">10000</span>
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
                {(8888888).toLocaleString()}
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
              1 / 10000
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
            10000
          </span>
          <span className="bg-primary h-[48px] leading-[48px] flex-1 rounded-[6px]">
            $1000
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
            Days Remaining to be Liquid
          </span>
        </div>
        <div className="font-content text-base flex gap-5 mt-2">
          <span className="bg-primary h-[30px] flex-1 rounded-[6px] flex items-center justify-center gap-4">
            <Icon name="manta" className="w-[21px] h-[21px]" />
            MANTA
          </span>
          <span className="bg-primary h-[30px] leading-[30px] flex-1 rounded-[6px]">
            10000
          </span>
          <span className="bg-primary h-[30px] leading-[30px] flex-1 rounded-[6px]">
            12
          </span>
        </div>
        <div className="font-content text-base flex gap-5 mt-2">
          <span className="bg-primary h-[30px] flex-1 rounded-[6px] flex items-center justify-center gap-4">
            <Icon name="manta" className="w-[21px] h-[21px]" />
            MANTA
          </span>
          <span className="bg-primary h-[30px] leading-[30px] flex-1 rounded-[6px]">
            10000
          </span>
          <span className="bg-primary h-[30px] leading-[30px] flex-1 rounded-[6px]">
            12
          </span>
        </div>
        <div className="font-content text-base flex gap-5 mt-2">
          <span className="bg-primary h-[30px] flex-1 rounded-[6px] flex items-center justify-center gap-4">
            <Icon name="manta" className="w-[21px] h-[21px]" />
            MANTA
          </span>
          <span className="bg-primary h-[30px] leading-[30px] flex-1 rounded-[6px]">
            10000
          </span>
          <span className="bg-primary h-[30px] leading-[30px] flex-1 rounded-[6px]">
            12
          </span>
        </div>
      </div>
    </>
  );
};

export default Account;
