import { useEffect, useRef, useState } from 'react';
import { InputNumber } from 'primereact/inputnumber';
import { Nullable } from 'primereact/ts-helpers';
import BN from 'bn.js';
import Decimal from 'decimal.js';
import { ProgressSpinner } from 'primereact/progressspinner';
import Icon from 'components/Icon';
import Ring from 'resources/images/deposit-success.png';
import { useUserLotteryData } from 'contexts/UserLotteryDataContext';
import { useGlobalLotteryData } from 'contexts/GlobalLotteryDataContext';
import AssetType from 'classes/AssetType';
import Balance from 'classes/Balance';
import { useSubstrate } from 'contexts/SubstrateContext';
import calculateWinningChance from 'utils/display/calculateWinningChance';
import { useLotteryTx } from 'contexts/LotteryTxContext';
import { useWallet } from 'contexts/WalletContext';
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

const DepositSuccess = ({
  linkToAccountTab
}: {
  linkToAccountTab: () => void;
}) => {
  return (
    <div className="font-content mt-4">
      <div className="h-[160px] flex items-center justify-between mb-6 leading-5">
        <div>Your deposit is eligible for all future draws!</div>
        <img src={Ring} alt="deposit success" width="160" height="160" />
      </div>
      <button
        onClick={linkToAccountTab}
        className="font-title btn-primary w-full rounded-xl h-[66px]"
      >
        View Account
      </button>
    </div>
  );
};

const DepositModal = ({ hideModal }: { hideModal: () => void }) => {
  const [validateErrMsg, setValidateErrMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState(false);
  const { userNonStakedBalance, userLotteryActiveBalance, userWinningChance } =
    useUserLotteryData();
  const {
    sumOfDeposits,
    minDeposit,
    isPrizeTabSelected,
    setIsPrizeTabSelected
  } = useGlobalLotteryData();
  const { api, apiState } = useSubstrate();
  const { selectedAccount } = useWallet();
  const { depositTxFee } = useLotteryTx();

  const [winningChance, setWinningChance] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [value, setValue] = useState<Nullable<number | null>>(null);
  const [transferErrMsg, setTransferErrMsg] = useState('');
  const initialWinningChance = useRef(false);

  const validateInputValue = (inputValue: Nullable<number | null>) => {
    if (
      !inputValue ||
      sumOfDeposits === null ||
      userLotteryActiveBalance === null ||
      !depositTxFee
    ) {
      validateErrMsg && setValidateErrMsg('');
      transferErrMsg && setTransferErrMsg('');
      setIsButtonDisabled(true);
      setWinningChance(userWinningChance);
      return;
    }
    transferErrMsg && setTransferErrMsg('');

    const inputBalanceValue = Balance.fromBaseUnits(
      AssetType.Native(),
      new Decimal(inputValue)
    );
    const existentialDeposit = new Balance(
      AssetType.Native(),
      AssetType.Native().existentialDeposit
    );
    const reservedBalance = existentialDeposit.add(depositTxFee);
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
      new Decimal(inputValue).plus(userLotteryActiveBalance?.toString()),
      new Decimal(inputValue).plus(sumOfDeposits?.toString())
    );

    setWinningChance(newWinningChance);
  };

  const handleInputChange = (e: InputNumberChangeEvent) => {
    const inputValue = e.value;
    validateInputValue(inputValue);
  };

  const handleTxRes = (tx: any) => {
    const status = tx.status;
    const dispatchError = tx.dispatchError;
    console.log('Transaction status:', status.type);
    if (status.isFinalized) {
      console.log('Finalized block hash', status.asFinalized.toHex());
      if (dispatchError) {
        if (dispatchError.isModule) {
          const decoded = api?.registry.findMetaError(
            dispatchError.asModule
          ) as any;
          let errorMsg = `${decoded.section}.${decoded.name}`;
          if (decoded.name === 'TooCloseToDrawing') {
            errorMsg = 'Withdraw has closed for winner selection underway.';
          }
          setTransferErrMsg(errorMsg);
        } else {
          setTransferErrMsg(dispatchError.toString());
        }
      } else {
        setDepositSuccess(true);
      }
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
        .deposit(
          new Decimal(value).mul(new Decimal(10).pow(decimals)).toString()
        )
        .signAndSend(
          selectedAccount.address,
          { signer: selectedAccount.signer as Signer },
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
    if (
      depositTxFee !== null &&
      userNonStakedBalance?.gt(Balance.Native(new BN(0)))
    ) {
      const existentialDeposit = new Balance(
        AssetType.Native(),
        AssetType.Native().existentialDeposit
      );
      const reservedBalance = existentialDeposit.add(depositTxFee);
      const max = userNonStakedBalance.sub(reservedBalance);
      setValue(+max?.toString(2));
      validateInputValue(+max?.toString(2));
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

  return (
    <div className="w-[509px] text-left">
      <h1 className="text-2xl leading-10 text-secondary font-title">
        Deposit into a Prize Pool
      </h1>
      {depositSuccess ? (
        <DepositSuccess linkToAccountTab={linkToAccountTab} />
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
          <div className="flex items-center justify-between text-base leading-5 mb-4">
            <span>Winning Chance</span>
            <span>{winningChance}</span>
          </div>
          <div className="flex items-center justify-between text-base leading-5 mb-6">
            <span>Deposit Gas Fee</span>
            <span>{depositTxFee?.toString(2)} MANTA</span>
          </div>
          <button
            onClick={handleDeposit}
            disabled={isButtonDisabled}
            className="btn-primary font-title w-full rounded-xl h-[66px] flex items-center justify-center gap-4"
          >
            {submitting ? 'Depositing' : 'Deposit'}
            {submitting && (
              <ProgressSpinner
                className="w-[32px] h-[32px] m-0"
                strokeWidth="4"
              />
            )}
          </button>
          {transferErrMsg && (
            <div className="text-left flex items-center text-warning gap-2 mt-[10px]">
              <Icon name="information" />
              {transferErrMsg}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DepositModal;
