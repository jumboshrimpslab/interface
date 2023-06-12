import { useEffect, useState } from 'react';
import { InputNumber } from 'primereact/inputnumber';
import { Nullable } from 'primereact/ts-helpers';
import BN from 'bn.js';
import Decimal from 'decimal.js';
import classNames from 'classnames';
import { ProgressSpinner } from 'primereact/progressspinner';
import Icon from 'components/Icon';
import Ring from 'resources/images/deposit-success.png';
import { useUserLotteryData } from 'contexts/UserLotteryDataContext';
import { useGlobalLotteryData } from 'contexts/GlobalLotteryDataContext';
import AssetType from 'classes/AssetType';
import Balance from 'classes/Balance';
import { useSubstrate } from 'contexts/SubstrateContext';
import { useAccount } from 'contexts/AccountContext';
import calculateWinningChance from 'utils/display/calculateWinningChance';
import { useLotteryTx } from 'contexts/LotteryTxContext';
import type { Signer } from '@polkadot/api/types';

const decimals = AssetType.Native().numberOfDecimals;
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
  const [validateErrMsg, setValidateErrMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState(false);
  const { userNonStakedBalance, userLotteryActiveBalance } =
    useUserLotteryData();
  const {
    sumOfDeposits,
    minDeposit,
    isPrizeTabSelected,
    setIsPrizeTabSelected
  } = useGlobalLotteryData();
  const { api, apiState } = useSubstrate();
  const { selectedAccount } = useAccount();
  const { withdrawTxFee } = useLotteryTx();

  const [winningChance, setWinningChance] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [value, setValue] = useState<Nullable<number | null>>(null);
  const [transferErrMsg, setTransferErrMsg] = useState('');

  const validateInputValue = (inputValue: number | null) => {
    if (
      !inputValue ||
      !sumOfDeposits ||
      !minDeposit ||
      !api ||
      !withdrawTxFee
    ) {
      validateErrMsg && setValidateErrMsg('');
      setIsButtonDisabled(true);
      return;
    }
    const inputBalanceValue = Balance.fromBaseUnits(
      AssetType.Native(),
      new Decimal(inputValue)
    );
    const existentialDeposit = new Balance(
      AssetType.Native(),
      AssetType.Native().existentialDeposit
    );
    const reservedBalance = existentialDeposit.add(withdrawTxFee);
    if (
      userNonStakedBalance !== null &&
      inputBalanceValue.gt(userNonStakedBalance.sub(reservedBalance))
    ) {
      setValidateErrMsg('Insufficient Balance');
      !isButtonDisabled && setIsButtonDisabled(true);
    } else if (minDeposit && inputBalanceValue.lt(minDeposit)) {
      setValidateErrMsg(`minDeposit is ${minDeposit?.toString()}`);
      !isButtonDisabled && setIsButtonDisabled(true);
    } else {
      validateErrMsg && setValidateErrMsg('');
      setIsButtonDisabled(false);
    }

    const newWinningChance = calculateWinningChance(
      new Decimal(inputValue).plus(userLotteryActiveBalance?.toString() || 0),
      new Decimal(sumOfDeposits?.toString())
    );

    setWinningChance(newWinningChance);
  };
  const handleInputChange = (e: InputNumberChangeEvent) => {
    const inputValue = e.value;
    validateInputValue(inputValue);
  };

  const handleTxRes = (tx: any) => {
    const status = tx.status;
    const events = tx.events;
    console.log('Transaction status:', status.type);
    if (status.isFinalized) {
      console.log('Finalized block hash', status.asFinalized.toHex());
      events.forEach(({ event }: any) => {
        const { data } = event;
        if (api?.events.system.ExtrinsicFailed.is(event)) {
          const error = data[0];
          if (error.isModule) {
            const decoded = api.registry.findMetaError(
              error.asModule.toU8a() as any
            );
            const { docs, method, section } = decoded;
            const errorMsg = `${section}.${method}: ${docs.join(' ')}`;
            setTransferErrMsg(errorMsg);
          } else {
            setTransferErrMsg(error.toString());
          }
        } else if (api?.events.system.ExtrinsicSuccess.is(event)) {
          setDepositSuccess(true);
        }
      });
      setIsButtonDisabled(false);
      setSubmitting(false);
    }
  };

  const handleDeposit = async () => {
    if (!api || apiState !== 'READY' || !selectedAccount || !value) {
      return;
    }
    setIsButtonDisabled(true);
    setSubmitting(true);
    transferErrMsg && setTransferErrMsg('');

    try {
      await api.tx.lottery
        .deposit(new BN(value).mul(new BN(10).pow(new BN(decimals))).toString())
        .signAndSend(
          selectedAccount.address,
          { signer: selectedAccount.meta.signer as Signer },
          handleTxRes
        );
    } catch (e: any) {
      setTransferErrMsg(e.message);
      setSubmitting(false);
      setIsButtonDisabled(false);
    }
  };

  const linkToAccountTab = () => {
    hideModal();
    isPrizeTabSelected && setIsPrizeTabSelected(false);
  };

  const setMaxValue = () => {
    if (userNonStakedBalance?.gt(Balance.Native(new BN(0)))) {
      setValue(+userNonStakedBalance?.toString(2));
      validateInputValue(+userNonStakedBalance?.toString(2));
    } else {
      setValue(0);
      validateInputValue(0);
    }
  };

  useEffect(() => {
    if (sumOfDeposits === null || userLotteryActiveBalance === null) {
      return;
    }
    if (userLotteryActiveBalance.isZero()) {
      setWinningChance('0');
    } else {
      const userWinningChance = calculateWinningChance(
        new Decimal(userLotteryActiveBalance?.toString()),
        new Decimal(sumOfDeposits?.toString())
      );
      setWinningChance(userWinningChance);
    }
  }, [sumOfDeposits, userLotteryActiveBalance]);

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
            <button className="text-secondary" onClick={setMaxValue}>
              Max
            </button>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div>Balance: {userNonStakedBalance?.toString(2)} MANTA</div>
            {validateErrMsg && (
              <div className="flex items-center text-warning gap-2">
                <Icon name="information" />
                {validateErrMsg}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between text-base leading-5 mt-6 mb-4">
            <span>Current Deposit Balance</span>
            <span>{userLotteryActiveBalance?.toString(2)} MANTA</span>
          </div>
          <div className="flex items-center justify-between text-base leading-5 mb-6">
            <span>Winning Chance</span>
            <span>{winningChance}</span>
          </div>
          <button
            onClick={handleDeposit}
            disabled={isButtonDisabled}
            className={classNames(
              'font-title w-full rounded-xl h-[66px] text-white flex items-center justify-center gap-4',
              {
                'bg-button-primary': !isButtonDisabled,
                'border border-primary/50 bg-button-primary/70 cursor-not-allowed':
                  isButtonDisabled
              }
            )}
          >
            {submitting ? 'Depositing' : 'Deposit'}
            {submitting && (
              <ProgressSpinner
                className="w-[32px] h-[32px] m-0"
                strokeWidth="4"
              />
            )}
          </button>
          <div className="text-center text-warning mt-2">{transferErrMsg}</div>
        </div>
      )}
    </div>
  );
};

export default DepositModal;
