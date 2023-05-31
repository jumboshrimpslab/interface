import {
  useState,
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useEffect
} from 'react';
import BN from 'bn.js';
import { encodeAddress } from '@polkadot/util-crypto';
import Balance from 'classes/Balance';
import config from 'config';
import { useSubstrate } from './SubstrateContext';
import { useAccount } from './AccountContext';

type UserLotteryDataContextValue = {
  userNonStakedBalance: Balance | null;
};

type PendingWithdrawal = {
  balance: Balance;
  blockNumber: number;
};

const UserLotteryDataContext =
  createContext<UserLotteryDataContextValue | null>(null);

const UserLotteryDataContextProvider = ({
  children
}: {
  children: ReactNode;
}) => {
  const { api, apiState } = useSubstrate();
  const { selectedAccount } = useAccount();

  const [userNonStakedBalance, setUserNonStakedBalance] =
    useState<Balance | null>(null);
  const [userLotteryActiveBalance, setUserLotteryActiveBalance] =
    useState<Balance | null>(null);
  const [userUnclaimedWinnings, setUserUnclaimedWinnings] =
    useState<Balance | null>();
  const [userPendingWithdrawals, setUserPendingWithdrawals] = useState<
    PendingWithdrawal[] | null
  >();

  useEffect(() => {
    const handleUpdatePendingWithdrawals = (pendingWithdrawalsRaw: any) => {
      if (pendingWithdrawalsRaw.isEmpty) {
        return;
      }
      const userPendingWithdrawalsRaw = pendingWithdrawalsRaw.filter(
        (withdrawal: any) => {
          const withdrawalAddress = encodeAddress(
            withdrawal.user,
            config.SS58_FORMAT.CALAMARI
          );
          return withdrawalAddress === selectedAccount?.address;
        }
      );
      const newUserpendingWithdrawals = userPendingWithdrawalsRaw.map(
        (withdrawal: any) => {
          return {
            balance: Balance.Native(new BN(withdrawal.balance.toString())),
            blockNumber: withdrawal.block.toNumber()
          };
        }
      );
      setUserPendingWithdrawals(newUserpendingWithdrawals);
    };

    const subscribePendingWithdrawals = async () => {
      if (!api || apiState !== 'READY' || !selectedAccount) {
        return;
      }
      await api.isReady;
      unsub = await api.query.lottery.withdrawalRequestQueue(
        handleUpdatePendingWithdrawals
      );
    };
    let unsub: any;
    subscribePendingWithdrawals();
    return unsub && unsub();
  }, [api, apiState, selectedAccount]);

  useEffect(() => {
    const handleChangeUserLotteryActiveBalance = (activeBalance: any) => {
      setUserLotteryActiveBalance(
        Balance.Native(new BN(activeBalance.toString()))
      );
    };

    const subscribeUserLotteryActiveBalance = async () => {
      if (!api || apiState !== 'READY' || !selectedAccount) {
        return;
      }
      await api.isReady;
      unsub = await api.query.lottery.activeBalancePerUser(
        selectedAccount.address,
        handleChangeUserLotteryActiveBalance
      );
    };
    let unsub: any;
    subscribeUserLotteryActiveBalance();
    return unsub && unsub();
  }, [api, apiState, selectedAccount]);

  useEffect(() => {
    const handleChangeUserUnclaimedWinnings = (unclaimedWinnings: any) => {
      if (unclaimedWinnings.isSome) {
        setUserUnclaimedWinnings(
          Balance.Native(new BN(unclaimedWinnings.unwrap().toString()))
        );
      }
    };
    const subscribeUserUnclaimedWinings = async () => {
      if (!api || apiState !== 'READY' || !selectedAccount) {
        return;
      }
      await api.isReady;
      unsub = await api.query.lottery.unclaimedWinningsByAccount(
        selectedAccount.address,
        handleChangeUserUnclaimedWinnings
      );
    };
    let unsub: any;
    subscribeUserUnclaimedWinings();
    return unsub && unsub();
  }, [api, apiState, selectedAccount]);

  useEffect(() => {
    const handleChangeNonStakedBalance = async (balance: any) => {
      const totalBalance = Balance.Native(new BN(balance.data.free.toString()));
      const stakedBalance = Balance.Native(
        new BN(balance.data.miscFrozen.toString())
      );
      setUserNonStakedBalance(totalBalance.sub(stakedBalance));
    };

    const subscribeNonStakedBalanceChanges = async () => {
      if (!api || !selectedAccount || apiState !== 'READY') {
        return;
      }
      await api.isReady;
      unsub = await api.query.system.account(
        selectedAccount.address,
        handleChangeNonStakedBalance
      );
    };
    let unsub: any;
    subscribeNonStakedBalanceChanges();
    return unsub && unsub();
  }, [api, apiState, selectedAccount]);

  useEffect(() => {
    const handleChangeUnclaimedWinnings = (unclaimedWinnings: any) => {
      if (unclaimedWinnings.isSome) {
        return;
      }
    };

    const subscribeUserUnclaimedWinings = async () => {
      if (!api || !selectedAccount || apiState !== 'READY') {
        return;
      }
      await api.isReady;
      unsub = await api.query.lottery.unclaimedWinningsByAccount(
        selectedAccount.address,
        handleChangeUnclaimedWinnings
      );
    };
    let unsub: any;
    subscribeUserUnclaimedWinings();
    return unsub && unsub();
  }, [api, apiState, selectedAccount]);

  const state = useMemo(
    () => ({
      userNonStakedBalance,
      userUnclaimedWinnings,
      userPendingWithdrawals,
      userLotteryActiveBalance
    }),
    [
      userNonStakedBalance,
      userUnclaimedWinnings,
      userPendingWithdrawals,
      userLotteryActiveBalance
    ]
  );

  return (
    <UserLotteryDataContext.Provider value={state}>
      {children}
    </UserLotteryDataContext.Provider>
  );
};

const useUserLotteryData = () =>
  useContext(UserLotteryDataContext) as UserLotteryDataContextValue;

export { UserLotteryDataContextProvider, useUserLotteryData };
