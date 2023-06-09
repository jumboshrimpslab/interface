import classNames from 'classnames';
import { useGlobalLotteryData } from 'contexts/GlobalLotteryDataContext';
import Account from './Account';
import Prize from './Prize';

const PrizeAndAccount = () => {
  const { isPrizeTabSelected, setIsPrizeTabSelected } = useGlobalLotteryData();

  const changeTabMennu = (bool: boolean) => {
    setIsPrizeTabSelected(bool);
  };
  return (
    <div className="w-[1200px] mx-auto mb-[50px]">
      <div className="flex items-center justify-center gap-5 mb-6">
        <button
          onClick={() => changeTabMennu(true)}
          className={classNames(
            'w-[248px] h-[50px] rounded-[40px] font-title',
            {
              'bg-button-primary text-white': isPrizeTabSelected,
              'bg-button-primary/20 text-secondary/50 border border-primary/50':
                !isPrizeTabSelected
            }
          )}
        >
          Prize
        </button>
        <button
          onClick={() => changeTabMennu(false)}
          className={classNames(
            'w-[248px] h-[50px] rounded-[40px] font-title',
            {
              'bg-button-primary text-white': !isPrizeTabSelected,
              'bg-button-primary/20 text-secondary/50 border border-primary/50':
                isPrizeTabSelected
            }
          )}
        >
          Account
        </button>
      </div>
      {isPrizeTabSelected ? <Prize /> : <Account />}
    </div>
  );
};

export default PrizeAndAccount;
