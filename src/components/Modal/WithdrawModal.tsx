import { useState, useEffect, useRef } from 'react';
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
import { useSubstrate } from 'contexts/SubstrateContext';
import { useAccount } from 'contexts/AccountContext';
import Balance from 'classes/Balance';
import AssetType from 'classes/AssetType';
import calculateWinningChance from 'utils/display/calculateWinningChance';
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

const WithdrawModal = ({ hideModal }: { hideModal: () => void }) => {
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [validateErrMsg, setValidateErrMsg] = useState('');
  const [transferErrMsg, setTransferErrMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [winningChance, setWinningChance] = useState('');
  const initialWinningChance = useRef(false);

  const { userLotteryActiveBalance, userWinningChance } = useUserLotteryData();
  const { sumOfDeposits, minWithdraw } = useGlobalLotteryData();
  const { api, apiState } = useSubstrate();
  const { selectedAccount } = useAccount();
  const [value, setValue] = useState<Nullable<number | null>>(null);
  const validateInputValue = (inputValue: Nullable<number | null>) => {
    if (
      !inputValue ||
      userLotteryActiveBalance === null ||
      sumOfDeposits === null
    ) {
      validateErrMsg && setValidateErrMsg('');
      setIsButtonDisabled(true);
      setWinningChance(userWinningChance);
      return;
    }
    const inputBalanceValue = Balance.Native(
      new BN(inputValue).mul(new BN(10).pow(new BN(decimals)))
    );
    if (inputBalanceValue.gt(userLotteryActiveBalance)) {
      setValidateErrMsg('Insufficient Balance');
      !isButtonDisabled && setIsButtonDisabled(true);
    } else if (minWithdraw && inputBalanceValue.lt(minWithdraw)) {
      setValidateErrMsg(`minWithdraw is ${minWithdraw?.toString()}`);
      !isButtonDisabled && setIsButtonDisabled(true);
    } else {
      validateErrMsg && setValidateErrMsg('');
      setIsButtonDisabled(false);
    }

    const newWinningChance = calculateWinningChance(
      new Decimal(userLotteryActiveBalance?.toString()).minus(inputValue),
      new Decimal(sumOfDeposits?.toString()).minus(inputValue)
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
          setWithdrawSuccess(true);
        }
      });
      setIsButtonDisabled(false);
      setSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!api || apiState !== 'READY' || !selectedAccount || !value) {
      return;
    }
    setIsButtonDisabled(true);
    setSubmitting(true);
    transferErrMsg && setTransferErrMsg('');

    try {
      await api.tx.lottery
        .requestWithdraw(
          new Decimal(value).mul(new Decimal(10).pow(decimals)).toString()
        )
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

  const setMaxValue = () => {
    if (userLotteryActiveBalance?.gt(Balance.Native(new BN(0)))) {
      setValue(+userLotteryActiveBalance?.toString(2));
      validateInputValue(+userLotteryActiveBalance?.toString(2));
    } else {
      setValue(0);
      validateInputValue(0);
    }
  };

  useEffect(() => {
    if (userWinningChance !== '' && !initialWinningChance.current) {
      setWinningChance(userWinningChance);
      initialWinningChance.current = true;
    }
  }, [userWinningChance]);

  const WithdrawSuccess = () => {
    return (
      <>
        <h1 className="text-2xl leading-10 text-secondary font-title">
          Withdraw Submitted!
        </h1>
        <div className="font-content mt-6">
          <div className="h-[144px] flex items-center justify-between my-6 leading-5">
            <div>
              <div>
                Your withdraw needs to wait X days to be liquid. <br />
                We will send it back to your account.
              </div>
              <br />
              <div>Don&apos;t forget to check it!</div>
            </div>
            <img src={Ring} alt="deposit success" width="135" height="144" />
          </div>
          <button
            onClick={hideModal}
            className="font-title bg-button-primary w-full text-white rounded-xl h-[66px]"
          >
            OK
          </button>
        </div>
      </>
    );
  };

  return (
    <div className="w-[509px] text-left">
      {withdrawSuccess ? (
        <WithdrawSuccess />
      ) : (
        <>
          <h1 className="text-2xl leading-10 text-secondary font-title">
            Withdraw MANTA
          </h1>
          <div className="font-content mt-6">
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
              <div>Balance: {userLotteryActiveBalance?.toString(2)} MANTA</div>
              {validateErrMsg && (
                <div className="flex items-center text-warning gap-2">
                  <Icon name="information" />
                  {validateErrMsg}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between text-base leading-5 my-6">
              <span>Winning Chance</span>
              <span>{winningChance}</span>
            </div>
            <button
              onClick={handleWithdraw}
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
              {submitting ? 'Withdrawing' : 'Withdraw'}
              {submitting && (
                <ProgressSpinner
                  className="w-[32px] h-[32px] m-0"
                  strokeWidth="4"
                />
              )}
            </button>
            <div className="text-center text-warning mt-2">
              {transferErrMsg}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WithdrawModal;
