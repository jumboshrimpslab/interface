import Countdown, { zeroPad } from 'react-countdown';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import Calculator from 'resources/images/calculator.png';
import Clock from 'resources/images/clock.png';
import { useGlobalLotteryData } from 'contexts/GlobalLotteryDataContext';

const CountdownPlaceholder = () => {
  return (
    <div className="flex">
      <span className="w-[78px] flex flex-col items-center">
        -
        <span className="font-content text-sm leading-[18px] font-bold">
          DAY
        </span>
      </span>
      <span className="w-[78px] flex flex-col items-center">
        -
        <span className="font-content text-sm leading-[18px] font-bold">
          HOUR
        </span>
      </span>
      <span className="w-[78px] flex flex-col items-center">
        -
        <span className="font-content text-sm leading-[18px] font-bold">
          MINUTE
        </span>
      </span>
      <span className="w-[78px] flex flex-col items-center">
        -
        <span className="font-content text-sm leading-[18px] font-bold">
          SECOND
        </span>
      </span>
    </div>
  );
};

const DataBoard = () => {
  const [totalPotIsSelected, setTotalPotIsSelected] = useState(true);
  const [nextDrawingTime, setNextDrawingTime] = useState<Date | undefined>(
    undefined
  );
  const {
    sumOfDeposits,
    currentPrizePool,
    nextDrawingBlockNumber,
    currentBlockNumber
  } = useGlobalLotteryData();

  useEffect(() => {
    if (!currentBlockNumber || !nextDrawingBlockNumber) {
      return;
    }
    const blocksUntilNextDrawing = nextDrawingBlockNumber - currentBlockNumber;
    const nextDrawingTime = blocksUntilNextDrawing * 12;
    const currentTime = new Date().getTime();
    setNextDrawingTime(new Date(currentTime + nextDrawingTime * 1000));
  }, [currentBlockNumber, nextDrawingBlockNumber]);

  const totalAmount = totalPotIsSelected
    ? sumOfDeposits?.toString(0)
    : currentPrizePool?.toString(2);
  const totalAmountString = totalAmount
    ? Number(totalAmount).toLocaleString()
    : '--';

  const renderer = (time: any) => {
    const { days, hours, minutes, seconds } = time;
    return (
      <div className="flex">
        <span className="w-[78px] flex flex-col items-center">
          {zeroPad(days, 2)}
          <span className="font-content text-sm leading-[18px] font-bold">
            DAY
          </span>
        </span>
        <span className="w-5 mx-2">:</span>
        <span className="w-[78px] flex flex-col items-center">
          {zeroPad(hours, 2)}
          <span className="font-content text-sm leading-[18px] font-bold">
            HOUR
          </span>
        </span>
        <span className="w-5 mx-2">:</span>
        <span className="w-[78px] flex flex-col items-center">
          {zeroPad(minutes, 2)}
          <span className="font-content text-sm leading-[18px] font-bold">
            MINUTE
          </span>
        </span>
        <span className="w-5 mx-2">:</span>
        <span className="w-[78px] flex flex-col items-center">
          {zeroPad(seconds, 2)}
          <span className="font-content text-sm leading-[18px] font-bold">
            SECOND
          </span>
        </span>
      </div>
    );
  };

  return (
    <div className="w-[1200px] flex items-center justify-between mx-auto my-6">
      <div className="w-[590px] h-[182px] rounded-3xl bg-primary px-[37px] py-6 relative">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setTotalPotIsSelected(true)}
            className={classNames(
              'w-[248px] h-[50px] rounded-[40px] font-title',
              {
                'bg-button-primary text-white': totalPotIsSelected,
                'bg-button-primary/20 text-secondary/50 border border-primary/50':
                  !totalPotIsSelected
              }
            )}
          >
            Total Deposit
          </button>
          <button
            onClick={() => setTotalPotIsSelected(false)}
            className={classNames(
              'w-[248px] h-[50px] rounded-[40px] font-title',
              {
                'bg-button-primary text-white': !totalPotIsSelected,
                'bg-button-primary/20 text-secondary/50 border border-primary/50':
                  totalPotIsSelected
              }
            )}
          >
            Last Grand Prize
          </button>
        </div>
        <div className="flex justify-center">
          <div className="flex items-center gap-2 mt-[15px]">
            <span className="font-title text-[40px] leading-[68px]">
              {totalAmountString}
            </span>
            {totalAmount && (
              <span className="font-content text-base font-black">MANTA</span>
            )}
          </div>
        </div>
        <img
          className="absolute top-12 -left-[71px]"
          src={Calculator}
          width="171"
          height="161"
          alt="calculator"
        />
      </div>
      <div className="w-[590px] h-[182px] rounded-3xl bg-primary relative">
        <div className="font-content text-sm mt-6">Time Left for</div>
        <div className="font-title text-secondary text-[24px] leading-6 mt-1">
          Draw #1
        </div>
        <div className="font-title text-[40px] leading-[68px] flex justify-center mt-2">
          {nextDrawingTime ? (
            <Countdown
              key={nextDrawingTime.getTime()}
              date={nextDrawingTime.getTime()}
              renderer={renderer}
            />
          ) : (
            <CountdownPlaceholder />
          )}
        </div>
        <img
          className="absolute top-[31px] -right-[58px]"
          src={Clock}
          width="116"
          height="128"
          alt="clock"
        />
      </div>
    </div>
  );
};

export default DataBoard;
