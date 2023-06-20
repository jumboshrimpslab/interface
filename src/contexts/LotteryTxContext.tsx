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
import { useSubstrate } from './SubstrateContext';
import { useGlobalLotteryData } from './GlobalLotteryDataContext';
import { useWallet } from './WalletContext';

type LotteryTxContextValue = {
  depositTxFee: Balance | null;
  withdrawTxFee: Balance | null;
};

const LotteryTxContext = createContext<LotteryTxContextValue | null>(null);

const LotteryTxContextProvider = ({ children }: { children: ReactNode }) => {
  const { api, apiState } = useSubstrate();
  const { selectedAccount } = useWallet();
  const { currentBlockNumber } = useGlobalLotteryData();

  // fees
  const [depositTxFee, setDepositTxFee] = useState<Balance | null>(null);
  const [withdrawTxFee, setWithdrawTxFee] = useState<Balance | null>(null);

  useEffect(() => {
    const getWithdrawTxFee = async () => {
      if (
        !api ||
        apiState !== 'READY' ||
        !selectedAccount ||
        !currentBlockNumber
      ) {
        return null;
      }
      const tx = api.tx.lottery.requestWithdraw(0);
      const paymentInfo = await tx.paymentInfo(
        selectedAccount?.address as string
      );
      const fee = Balance.Native(new BN(paymentInfo.partialFee.toString()));
      setWithdrawTxFee(fee);
    };
    getWithdrawTxFee();
  }, [api, apiState, selectedAccount, currentBlockNumber]);

  useEffect(() => {
    const getDepositTxFee = async () => {
      if (
        !api ||
        apiState !== 'READY' ||
        !selectedAccount ||
        !currentBlockNumber
      ) {
        return null;
      }
      const tx = api.tx.lottery.deposit(0);
      const paymentInfo = await tx.paymentInfo(
        selectedAccount?.address as string
      );
      const fee = Balance.Native(new BN(paymentInfo.partialFee.toString()));
      setDepositTxFee(fee);
    };
    getDepositTxFee();
  }, [api, apiState, selectedAccount, currentBlockNumber]);

  const state = useMemo(
    () => ({
      depositTxFee,
      withdrawTxFee
    }),
    [depositTxFee, withdrawTxFee]
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
