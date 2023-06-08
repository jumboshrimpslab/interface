import { useState } from 'react';
import classNames from 'classnames';
import store from 'store';
import Account from './Account';
import Prize from './Prize';

const PrizeAndAccount = () => {
  const [isPrizeSelected, setIsPrizeSelected] = useState(
    store.get('isPrizeTabSelected', true)
  );
  const changeTabMennu = (bool: boolean) => {
    store.set('isPrizeTabSelected', bool);
    setIsPrizeSelected(bool);
  };
  return (
    <div className="w-[1200px] mx-auto mb-[50px]">
      <div className="flex items-center justify-center gap-5 mb-6">
        <button
          onClick={() => changeTabMennu(true)}
          className={classNames(
            'w-[248px] h-[50px] rounded-[40px] font-title',
            {
              'bg-button-primary text-white': isPrizeSelected,
              'bg-button-primary/20 text-secondary/50 border border-[#FF6E03]/50':
                !isPrizeSelected
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
              'bg-button-primary text-white': !isPrizeSelected,
              'bg-button-primary/20 text-secondary/50 border border-[#FF6E03]/50':
                isPrizeSelected
            }
          )}
        >
          Account
        </button>
      </div>
      {isPrizeSelected ? <Prize /> : <Account />}
    </div>
  );
};

export default PrizeAndAccount;
