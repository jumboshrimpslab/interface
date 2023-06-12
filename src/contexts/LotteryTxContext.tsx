import {
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useState,
  useEffect
} from 'react';
import { BN } from 'bn.js';
import Balance from 'classes/Balance';
import AssetType from 'classes/AssetType';
import { useSubstrate } from './SubstrateContext';
import { useGlobalLotteryData } from './GlobalLotteryDataContext';
import { useUserLotteryData } from './UserLotteryDataContext';
import { useAccount } from './AccountContext';

type LotteryTxContextValue = {
  depositTargetAmount: Balance | null;
  setDepositTargetAmount: (amount: Balance | null) => void;
  withdrawalTargetAmount: Balance | null;
  setWithdrawalTargetAmount: (amount: Balance | null) => void;
  depositTxFee: Balance | null;
  withdrawTxFee: Balance | null;
};

const LotteryTxContext = createContext<LotteryTxContextValue | null>(null);

const LotteryTxContextProvider = ({ children }: { children: ReactNode }) => {
  const { api, apiState } = useSubstrate();
  const { selectedAccount } = useAccount();
  const { minDeposit, currentBlockNumber } = useGlobalLotteryData();
  const { userNonStakedBalance } = useUserLotteryData();

  // target amounts
  const [depositTargetAmount, setDepositTargetAmount] =
    useState<Balance | null>(null);
  const [withdrawalTargetAmount, setWithdrawalTargetAmount] =
    useState<Balance | null>(null);

  // fees
  const [depositTxFee, setDepositTxFee] = useState<Balance | null>(null);
  const [withdrawTxFee, setWithdrawTxFee] = useState<Balance | null>(null);

  useEffect(() => {
    const getWithdrawTxFee = async () => {
      if (!api || !apiState || !selectedAccount || !currentBlockNumber) {
        return null;
      }
      await api.isReady;
      const tx = api.tx.lottery.requestWithdraw(0);
      const paymentInfo = await tx.paymentInfo(
        selectedAccount?.address as string
      );
      const fee = Balance.Native(new BN(paymentInfo.partialFee.toString()));
      setWithdrawTxFee(fee);
    };
    getWithdrawTxFee();
  }, [api, apiState, selectedAccount, currentBlockNumber, setWithdrawTxFee]);

  useEffect(() => {
    const getDepositTxFee = async () => {
      if (!api || !apiState || !selectedAccount) {
        return null;
      }
      await api.isReady;
      const tx = api.tx.lottery.deposit(0);
      const paymentInfo = await tx.paymentInfo(
        selectedAccount?.address as string
      );
      const fee = Balance.Native(new BN(paymentInfo.partialFee.toString()));
      setDepositTxFee(fee);
    };
    getDepositTxFee();
  }, [api, apiState, selectedAccount, setDepositTxFee]);

  const getUserMaxDepositAmount = useMemo(() => {
    if (!userNonStakedBalance || !minDeposit || !api || !apiState) {
      return null;
    }
    const existentialDeposit = Balance.Native(
      AssetType.Native().existentialDeposit
    );
    return userNonStakedBalance.sub(existentialDeposit);
  }, [userNonStakedBalance, minDeposit, api, apiState]);

  const state = useMemo(
    () => ({
      depositTargetAmount,
      setDepositTargetAmount,
      withdrawalTargetAmount,
      setWithdrawalTargetAmount,
      getUserMaxDepositAmount,
      depositTxFee,
      withdrawTxFee
    }),
    [
      depositTargetAmount,
      setDepositTargetAmount,
      withdrawalTargetAmount,
      setWithdrawalTargetAmount,
      getUserMaxDepositAmount,
      depositTxFee,
      withdrawTxFee
    ]
  );

  return (
    <LotteryTxContext.Provider value={state}>
      {children}
    </LotteryTxContext.Provider>
  );
};

const useLotteryTx = () =>
  useContext(LotteryTxContext) as LotteryTxContextValue;

export { LotteryTxContextProvider, useLotteryTx };
