import {
  useState,
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useEffect,
  useCallback
} from 'react';
import BN from 'bn.js';
import axios from 'axios';
import store from 'store';
import Balance from 'classes/Balance';
import { useSubstrate } from './SubstrateContext';
import { useAxios } from './AxiosContext';

type GlobalLotteryDataContextValue = {
  sumOfDeposits: Balance | null;
  minDeposit: Balance | null;
  minWithdraw: Balance | null;
  currentPrizePool: Balance | null;
  nextDrawingBlockNumber: number | null;
  currentBlockNumber: number | null;
  isPrizeTabSelected: boolean;
  lotteryNotInDrawingFreezeout: boolean;
  unstakeLockTime: number | null;
  setIsPrizeTabSelected: (_: boolean) => void;
};
const GlobalLotteryDataContext =
  createContext<GlobalLotteryDataContextValue | null>(null);

const GlobalLotteryDataContextProvider = ({
  children
}: {
  children: ReactNode;
}) => {
  const { api, apiState } = useSubstrate();
  const { axiosIsInit } = useAxios();

  // deposits
  const [sumOfDeposits, setSumOfDeposits] = useState<Balance | null>(null);
  const [minDeposit, setMinDeposit] = useState<Balance | null>(null);
  const [minWithdraw, setMinWithdraw] = useState<Balance | null>(null);

  // prize
  const [currentPrizePool, setCurrentPrizePool] = useState<Balance | null>(
    null
  );

  // schedule
  const [nextDrawingBlockNumber, setNextDrawingBlockNumber] = useState<
    number | null
  >(null);
  const [currentBlockNumber, setCurrentBlockNumber] = useState<number | null>(
    null
  );
  const [lotteryNotInDrawingFreezeout, setLotteryNotInDrawingFreezeout] =
    useState(true);
  const [unstakeLockTime, setUnstakeLockTime] = useState<number | null>(null);

  // tabMenu
  const [isPrizeTabSelected, _setIsPrizeTabSelected] = useState<boolean>(
    store.get('isPrizeTabSelected', true)
  );

  const setIsPrizeTabSelected = useCallback((selected: boolean) => {
    _setIsPrizeTabSelected(selected);
    store.set('isPrizeTabSelected', selected);
  }, []);

  useEffect(() => {
    const getCurrentPrizePool = async () => {
      if (!axiosIsInit) {
        return;
      }
      try {
        const response = await axios.post(
          'https://crispy.baikal.testnet.calamari.systems',
          {
            jsonrpc: '2.0',
            id: 1,
            method: 'lottery_current_prize_pool',
            params: []
          },
          {
            headers: {
              'Content-Type': 'application/json;charset=utf-8'
            }
          }
        );
        setCurrentPrizePool(Balance.Native(new BN(response.data.result)));
      } catch (error) {
        console.error(error);
        setCurrentPrizePool(null);
      }
    };
    getCurrentPrizePool();
  }, [axiosIsInit, currentBlockNumber]);

  useEffect(() => {
    const getLotteryDrawingStatus = async () => {
      if (!axiosIsInit) {
        return;
      }
      try {
        const response = await axios.post(
          'https://crispy.baikal.testnet.calamari.systems',
          {
            jsonrpc: '2.0',
            id: 1,
            method: 'lottery_not_in_drawing_freezeout',
            params: []
          },
          {
            headers: {
              'Content-Type': 'application/json;charset=utf-8'
            }
          }
        );
        setLotteryNotInDrawingFreezeout(response.data.result);
      } catch (error) {
        console.error(error);
        setLotteryNotInDrawingFreezeout(true);
      }
    };
    getLotteryDrawingStatus();
  }, [axiosIsInit, currentBlockNumber]);

  useEffect(() => {
    const nextDrawingBlockNumber = async () => {
      if (!axiosIsInit) {
        return;
      }
      try {
        const response = await axios.post(
          'https://crispy.baikal.testnet.calamari.systems',
          {
            jsonrpc: '2.0',
            id: 1,
            method: 'lottery_next_drawing_at',
            params: []
          },
          {
            headers: {
              'Content-Type': 'application/json;charset=utf-8'
            }
          }
        );
        setNextDrawingBlockNumber(response.data.result);
      } catch (error) {
        console.error(error);
      }
    };
    nextDrawingBlockNumber();
  }, [axiosIsInit, currentBlockNumber]);

  useEffect(() => {
    const handleUpdateMinDeposit = (minDeposit: any) => {
      setMinDeposit(Balance.Native(new BN(minDeposit.toString())));
    };

    const subscribeMinDeposit = async () => {
      if (!api || apiState !== 'READY') {
        return;
      }
      await api.isReady;
      unsub = api.query.lottery.minDeposit(handleUpdateMinDeposit);
    };
    let unsub: any;
    subscribeMinDeposit();
    return unsub && unsub();
  }, [api, apiState]);

  useEffect(() => {
    const handleUpdateMinWithdraw = (minWithdraw: any) => {
      setMinWithdraw(Balance.Native(new BN(minWithdraw.toString())));
    };

    const subscribeMinWithdraw = async () => {
      if (!api || apiState !== 'READY') {
        return;
      }
      await api.isReady;
      unsub = api.query.lottery.minWithdraw(handleUpdateMinWithdraw);
    };
    let unsub: any;
    subscribeMinWithdraw();
    return unsub && unsub();
  }, [api, apiState]);

  useEffect(() => {
    const subscribeCurrentBlockNumber = async () => {
      if (!api || apiState !== 'READY') {
        return;
      }
      await api.isReady;
      api.rpc.chain.subscribeNewHeads((header: any) => {
        setCurrentBlockNumber(header.number.toNumber());
      });
    };
    let unsub: any;
    subscribeCurrentBlockNumber();
    return unsub && unsub();
  }, [api, apiState]);

  useEffect(() => {
    const handleChangeSumOfDesposits = async (balanceRaw: any) => {
      const balance = Balance.Native(new BN(balanceRaw.toString()));
      setSumOfDeposits(balance);
    };

    const subscribeSumOfDeposits = async () => {
      if (!api || apiState !== 'READY') {
        return;
      }
      await api.isReady;
      unsub = await api.query.lottery.totalPot(handleChangeSumOfDesposits);
    };

    let unsub: any;
    subscribeSumOfDeposits();
    return unsub && unsub();
  }, [api, apiState]);

  useEffect(() => {
    const getUnstakeLockTime = async () => {
      if (!api || apiState !== 'READY') {
        return;
      }
      await api.isReady;
      const UNSTAKE_LOCK_TIME = (
        api.consts.lottery.unstakeLockTime as any
      ).toNumber();
      setUnstakeLockTime(UNSTAKE_LOCK_TIME);
    };
    getUnstakeLockTime();
  }, [api, apiState]);

  const state = useMemo(
    () => ({
      sumOfDeposits,
      nextDrawingBlockNumber,
      currentBlockNumber,
      minDeposit,
      minWithdraw,
      currentPrizePool,
      isPrizeTabSelected,
      lotteryNotInDrawingFreezeout,
      unstakeLockTime,
      setIsPrizeTabSelected
    }),
    [
      sumOfDeposits,
      nextDrawingBlockNumber,
      currentBlockNumber,
      minDeposit,
      minWithdraw,
      currentPrizePool,
      isPrizeTabSelected,
      lotteryNotInDrawingFreezeout,
      unstakeLockTime,
      setIsPrizeTabSelected
    ]
  );

  return (
    <GlobalLotteryDataContext.Provider value={state}>
      {children}
    </GlobalLotteryDataContext.Provider>
  );
};

const useGlobalLotteryData = () =>
  useContext(GlobalLotteryDataContext) as GlobalLotteryDataContextValue;

export { GlobalLotteryDataContextProvider, useGlobalLotteryData };
