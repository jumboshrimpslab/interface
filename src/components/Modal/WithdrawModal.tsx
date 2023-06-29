import { useState, useEffect, useRef } from 'react';
import { InputNumber } from 'primereact/inputnumber';
import { Nullable } from 'primereact/ts-helpers';
import BN from 'bn.js';
import Decimal from 'decimal.js';
import { ProgressSpinner } from 'primereact/progressspinner';
import Icon from 'components/Icon';
import Ring from 'resources/images/deposit-success.png';
import { useUserLotteryData } from 'contexts/UserLotteryDataContext';
import { useGlobalLotteryData } from 'contexts/GlobalLotteryDataContext';
import { useSubstrate } from 'contexts/SubstrateContext';
import Balance from 'classes/Balance';
import AssetType from 'classes/AssetType';
import calculateWinningChance from 'utils/display/calculateWinningChance';
import { useWallet } from 'contexts/WalletContext';
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

const WithdrawSuccess = ({
  hideModal,
  getRemainingTimeToBeLiquid
}: {
  hideModal: () => void;
  getRemainingTimeToBeLiquid: (withdrawBlockNumber: number) => string;
}) => {
  const { currentBlockNumber } = useGlobalLotteryData();
  return (
    <>
      <h1 className="text-2xl leading-10 text-secondary font-title">
        Withdraw Submitted!
      </h1>
      <div className="font-content mt-4">
        <div className="h-[160px] flex items-center justify-between mb-6 leading-5">
          <div>
            <div>
              Your withdraw needs to wait{' '}
              {currentBlockNumber &&
                getRemainingTimeToBeLiquid(currentBlockNumber)}{' '}
              to be liquid. <br />
              We will send it back to your account.
            </div>
            <br />
            <div>Don&apos;t forget to check it!</div>
          </div>
          <img src={Ring} alt="deposit success" width="160" height="160" />
        </div>
        <button
          onClick={hideModal}
          className="font-title btn-primary w-full rounded-xl h-[66px]"
        >
          OK
        </button>
      </div>
    </>
  );
};

const WithdrawModal = ({
  hideModal,
  getRemainingTimeToBeLiquid
}: {
  hideModal: () => void;
  getRemainingTimeToBeLiquid: (withdrawBlockNumber: number) => string;
}) => {
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [validateErrMsg, setValidateErrMsg] = useState('');
  const [transferErrMsg, setTransferErrMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [winningChance, setWinningChance] = useState('');
  const initialWinningChance = useRef(false);

  const { userLotteryActiveBalance, userWinningChance } = useUserLotteryData();
  const { sumOfDeposits, minWithdraw, lotteryNotInDrawingFreezeout } =
    useGlobalLotteryData();
  const freezeoutValue = useRef(lotteryNotInDrawingFreezeout);
  const { withdrawTxFee } = useLotteryTx();
  const { api, apiState } = useSubstrate();
  const { selectedAccount } = useWallet();
  const [value, setValue] = useState<Nullable<number | null>>(null);
  const validateInputValue = (inputValue: Nullable<number | null>) => {
    if (
      !inputValue ||
      userLotteryActiveBalance === null ||
      sumOfDeposits === null
    ) {
      validateErrMsg && setValidateErrMsg('');
      lotteryNotInDrawingFreezeout && transferErrMsg && setTransferErrMsg('');
      setIsButtonDisabled(true);
      setWinningChance(userWinningChance);
      return;
    }
    lotteryNotInDrawingFreezeout && transferErrMsg && setTransferErrMsg('');

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
      lotteryNotInDrawingFreezeout && setIsButtonDisabled(false);
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
        setWithdrawSuccess(true);
      }
      freezeoutValue.current && setIsButtonDisabled(false);
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
          { signer: selectedAccount.signer as Signer, nonce: -1 },
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
    freezeoutValue.current = lotteryNotInDrawingFreezeout;
    setIsButtonDisabled(!lotteryNotInDrawingFreezeout);
    if (lotteryNotInDrawingFreezeout) {
      transferErrMsg && setTransferErrMsg('');
    }
  }, [lotteryNotInDrawingFreezeout]);

  useEffect(() => {
    if (userWinningChance !== '' && !initialWinningChance.current) {
      setWinningChance(userWinningChance);
      initialWinningChance.current = true;
    }
  }, [userWinningChance]);

  return (
    <div className="w-[509px] text-left">
      {withdrawSuccess ? (
        <WithdrawSuccess
          hideModal={hideModal}
          getRemainingTimeToBeLiquid={getRemainingTimeToBeLiquid}
        />
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
              <div>
                Deposited Balance: {userLotteryActiveBalance?.toString(2)} MANTA
              </div>
              {validateErrMsg && (
                <div className="flex items-center text-warning gap-2">
                  <Icon name="information" />
                  {validateErrMsg}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between text-base leading-5 mt-6 mb-4">
              <span>Winning Chance</span>
              <span>{winningChance}</span>
            </div>
            <div className="flex items-center justify-between text-base leading-5 mb-6">
              <span>Withdraw Gas Fee</span>
              <span>{withdrawTxFee?.toString(2)} MANTA</span>
            </div>
            <button
              onClick={handleWithdraw}
              disabled={isButtonDisabled}
              className="btn-primary font-title w-full rounded-xl h-[66px] flex items-center justify-center gap-4"
            >
              {submitting ? 'Withdrawing' : 'Withdraw'}
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
        </>
      )}
    </div>
  );
};

export default WithdrawModal;
