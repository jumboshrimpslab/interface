import { useState } from 'react';
import { InputNumber } from 'primereact/inputnumber';
import { Nullable } from 'primereact/ts-helpers';
import { Button } from 'primereact/button';
import Icon from 'components/Icon';
import Ring from 'resources/images/deposit-success.png';

interface InputNumberChangeEvent {
  /**
   * Browser event
   */
  originalEvent: React.SyntheticEvent;
  /**
   * New value
   */
  value: number | null;
}

const DepositModal = ({ hideModal }: { hideModal: () => void }) => {
  const balance = 10000;
  const [depositing, setDepositing] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState(false);

  const [value, setValue] = useState<Nullable<number | null>>(null);
  const handleInputChange = (e: InputNumberChangeEvent) => {
    console.log(e.value);
  };
  const handleDeposit = () => {
    console.log('deposit amount', value);
    setDepositSuccess(true);
  };

  const linkToAccountTab = () => {
    console.log('link to account');
    hideModal();
  };

  const DepositSuccess = () => {
    return (
      <div className="font-content mt-6">
        <div className="h-[144px] flex items-center justify-between my-6 leading-5">
          <div>
            <div>Your deposit is eligible for all future draws!</div>
            <br />
            <div>
              Any prizes that are unclaimed <br /> after 60 days will expire.
            </div>
          </div>
          <img src={Ring} alt="deposit success" width="135" height="144" />
        </div>
        <button
          onClick={linkToAccountTab}
          className="font-title bg-button-primary w-full text-white rounded-xl h-[66px]"
        >
          View Account
        </button>
      </div>
    );
  };

  return (
    <div className="w-[509px] text-left">
      <h1 className="text-2xl leading-10 text-secondary font-title">
        Deposit into a Prize Pool
      </h1>
      {depositSuccess ? (
        <DepositSuccess />
      ) : (
        <div className="font-content mt-6">
          <div className="font-base leading-5 mb-6">
            Prizes are awarded weekly! <br />
            Don&apos;t forget to come back to claim any prize!
          </div>
          <div className="h-[88px] bg-primary rounded-xl mb-2 flex items-center pr-6 px-[26.5px] gap-3">
            <Icon name="manta" />
            <InputNumber
              className="flex-1 h-10 pl-2 bg-primary text-xl"
              value={value}
              onValueChange={e => setValue(e.value)}
              onChange={handleInputChange}
              mode="decimal"
              placeholder="0.00"
              minFractionDigits={2}
              maxFractionDigits={2}
            />
            <button className="text-secondary">Max</button>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div>Balance: {balance} MANTA</div>
            <div className="flex items-center text-warning gap-2">
              <Icon name="information" />
              Insufficient Balance
            </div>
          </div>
          <div className="flex items-center justify-between text-base leading-5 mt-6 mb-4">
            <span>Current Deposit Balance</span>
            <span>10000 MANTA</span>
          </div>
          <div className="flex items-center justify-between text-base leading-5 mb-6">
            <span>Winning Chance</span>
            <span>1/100</span>
          </div>
          <Button
            onClick={handleDeposit}
            label="Deposit"
            className="font-title bg-button-primary w-full text-white rounded-xl h-[66px]"
          />
        </div>
      )}
    </div>
  );
};

export default DepositModal;
