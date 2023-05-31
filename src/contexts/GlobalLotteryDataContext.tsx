import {
  useState,
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useEffect
} from 'react';
import BN from 'bn.js';
import axios from 'axios';
import Balance from 'classes/Balance';
import { useSubstrate } from './SubstrateContext';
import { useAxios } from './AxiosContext';

type GlobalLotteryDataContextValue = {
  sumOfDeposits: Balance | null;
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
  const [totalDeposits, setTotalDeposits] = useState<number | null>(null);
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
  const [drawingFreeoutBlocks, setDrawingFreeoutBlocks] = useState<
    number | null
  >(null);
  const [currentBlockNumber, setCurrentBlockNumber] = useState<number | null>(
    null
  );

  const drawingFreezoutIsActive = useMemo(() => {
    if (
      !drawingFreeoutBlocks ||
      !nextDrawingBlockNumber ||
      !currentBlockNumber
    ) {
      return null;
    }
    return currentBlockNumber >= nextDrawingBlockNumber - drawingFreeoutBlocks;
  }, [drawingFreeoutBlocks, nextDrawingBlockNumber, currentBlockNumber]);

  useEffect(() => {
    const getCurrentPrizePool = async () => {
      if (!axiosIsInit || !nextDrawingBlockNumber) {
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
        setCurrentPrizePool(Balance.Native(new BN(response.data.result)));
      } catch (error) {
        console.error(error);
        setCurrentPrizePool(null);
      }
    };
    getCurrentPrizePool();
  }, [axiosIsInit, currentBlockNumber, nextDrawingBlockNumber]);

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
    const getDrawingFreezoutBlocks = async () => {
      if (!api || apiState !== 'READY') {
        return;
      }
      await api.isReady;
      const blocks = (api.consts.lottery.drawingFreezeout as any).toNumber();
      setDrawingFreeoutBlocks(blocks);
    };
    getDrawingFreezoutBlocks();
  }, [api, apiState]);

  // todo: possibly replace with `lottery.nextDrawingAt`
  useEffect(() => {
    const handleChangeAgenda = (agenda: any) => {
      // todo: filter other agenda items
      const nextDrawingBlockNumber = agenda[0][0].args[0].toNumber();
      setNextDrawingBlockNumber(nextDrawingBlockNumber);
    };

    const subscribeNextDrawingBlockNumber = async () => {
      if (!api || apiState !== 'READY') {
        return;
      }
      await api.isReady;
      unsub = await api.query.scheduler.agenda.entries(handleChangeAgenda);
    };
    let unsub: any;
    subscribeNextDrawingBlockNumber();
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
      unsub = await api.query.lottery.sumOfDeposits(handleChangeSumOfDesposits);
    };

    let unsub: any;
    subscribeSumOfDeposits();
    return unsub && unsub();
  }, [api, apiState]);

  useEffect(() => {
    const subscribeTotalDeposits = async () => {
      if (!api || apiState !== 'READY') {
        return;
      }
      await api.isReady;
      unsub = await api.query.lottery.activeBalancePerUser.entries(
        (deposits: any) => setTotalDeposits(deposits.length)
      );
    };

    let unsub: any;
    subscribeTotalDeposits();
    return unsub && unsub();
  }, [api, apiState]);

  const state = useMemo(
    () => ({
      sumOfDeposits,
      totalDeposits,
      nextDrawingBlockNumber,
      currentBlockNumber,
      drawingFreezoutIsActive,
      minDeposit,
      minWithdraw,
      currentPrizePool
    }),
    [
      sumOfDeposits,
      totalDeposits,
      nextDrawingBlockNumber,
      currentBlockNumber,
      drawingFreezoutIsActive,
      minDeposit,
      minWithdraw,
      currentPrizePool
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
