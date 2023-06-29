import { useCallback, useEffect, useState } from 'react';
import BN from 'bn.js';
import { ProgressSpinner } from 'primereact/progressspinner';
import store from 'store';
import { useUserLotteryData } from 'contexts/UserLotteryDataContext';
import Balance from 'classes/Balance';
import PrizeBG from 'resources/images/prize-bg.png';
import { useSubstrate } from 'contexts/SubstrateContext';
import { useGlobalLotteryData } from 'contexts/GlobalLotteryDataContext';
import { useWallet } from 'contexts/WalletContext';
import Hourglass from 'resources/images/hourglass.png';
import type { Signer } from '@polkadot/api/types';

const Prize = () => {
  const { userUnclaimedWinnings } = useUserLotteryData();
  const { currentBlockNumber, nextDrawingBlockNumber } = useGlobalLotteryData();
  const [hasWinning, setHasWinning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const { api, apiState } = useSubstrate();
  const { selectedAccount } = useWallet();
  const [showCheckPrizeButton, setShowCheckPrizeButton] = useState(false);

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
            console.error(errorMsg);
          } else {
            console.error(error.toString());
          }
        }
      });
      setIsButtonDisabled(false);
      setSubmitting(false);
    }
  };

  const handleClaim = async () => {
    setIsButtonDisabled(true);
    setSubmitting(true);
    if (!api || apiState !== 'READY' || !selectedAccount) {
      return;
    }
    try {
      await api.tx.lottery
        .claimMyWinnings()
        .signAndSend(
          selectedAccount?.address,
          { signer: selectedAccount?.signer as Signer, nonce: -1 },
          handleTxRes
        );
    } catch (e: any) {
      console.error(e.message);
      setIsButtonDisabled(false);
      setSubmitting(false);
    }
  };

  const handleCheck = () => {
    setShowCheckPrizeButton(false);
    store.set('nextDrawingBlockNumberAfterChecked', nextDrawingBlockNumber);
  };

  useEffect(() => {
    setShowCheckPrizeButton(true);
    store.set('nextDrawingBlockNumberAfterChecked', undefined);
  }, [selectedAccount]);

  useEffect(() => {
    if (userUnclaimedWinnings === null) {
      setHasWinning(false);
      return;
    }
    if (userUnclaimedWinnings.gt(Balance.Native(new BN(0)))) {
      setHasWinning(true);
    } else {
      setHasWinning(false);
    }
  }, [userUnclaimedWinnings]);

  useEffect(() => {
    if (!currentBlockNumber) {
      return;
    }
    const nextDrawingBlockNumberAfterChecked = store.get(
      'nextDrawingBlockNumberAfterChecked'
    );
    if (
      !nextDrawingBlockNumberAfterChecked ||
      currentBlockNumber >= nextDrawingBlockNumberAfterChecked
    ) {
      setShowCheckPrizeButton(true);
    } else {
      setShowCheckPrizeButton(false);
    }
  }, [currentBlockNumber, userUnclaimedWinnings]);

  const ButtonBlock = useCallback(() => {
    if (!selectedAccount) {
      return (
        <button className="w-[280px] h-[66px] rounded-xl text-xl font-title border border-white/50 bg-white/20 text-white/80 cursor-not-allowed">
          No Draws to Check
        </button>
      );
    } else {
      // 3 button types: 'Check Prize' or 'Claim Prize' or 'No Prize to Claim'
      if (showCheckPrizeButton) {
        return (
          <button
            onClick={handleCheck}
            className="btn-primary font-title w-[280px] rounded-xl h-[66px] text-xl flex items-center justify-center gap-4"
          >
            Check for Prizes
          </button>
        );
      } else if (hasWinning) {
        return (
          <button
            onClick={handleClaim}
            disabled={isButtonDisabled}
            className="btn-primary font-title w-[280px] rounded-xl h-[66px] text-xl text-white flex items-center justify-center gap-4"
          >
            {submitting ? 'Claiming' : 'Claim Prize'}
            {submitting && (
              <ProgressSpinner
                className="w-[32px] h-[32px] m-0"
                strokeWidth="4"
              />
            )}
          </button>
        );
      } else {
        return (
          <button className="w-[280px] h-[66px] rounded-xl text-xl font-title border border-white/50 bg-white/20 text-white/80 cursor-not-allowed">
            No Prize to Claim
          </button>
        );
      }
    }
  }, [
    selectedAccount,
    showCheckPrizeButton,
    hasWinning,
    isButtonDisabled,
    submitting
  ]);

  return (
    <div>
      <div className="h-[202px] bg-gradient-to-r from-[#FF6B00] to-[#FFCE51] rounded-3xl flex items-center justify-between px-12 text-tertiary relative">
        <img
          src={Hourglass}
          width={'264'}
          height={'264'}
          alt="hourglass"
          className="absolute -left-[40px]"
        />

        <div className="pl-[155px]">
          <div className="font-content text-2xl leading-[30px] font-extrabold mb-2">
            Coming Soon
          </div>
          <div className="font-title text-[40px] leading-[68px]">Draw #1</div>
        </div>

        {!showCheckPrizeButton && hasWinning && (
          <div className="relative -rotate-[16deg]">
            <span className="absolute font-title text-[32px] text-white left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              {userUnclaimedWinnings?.toString(2)}
            </span>
            <img
              src={PrizeBG}
              alt="prize background"
              width="226"
              height="226"
            />
          </div>
        )}
        <ButtonBlock />
      </div>
      {/* <div>
        <div className="font-title text-xl leading-[34px] mt-6 mb-4">
          Prize History
        </div>
        <div className="font-title text-base flex gap-5">
          <span className="bg-primary h-[35px] leading-[35px] flex-1 rounded-[6px]">
            Draw
          </span>
          <span className="bg-primary h-[35px] leading-[35px] flex-1 rounded-[6px]">
            Date
          </span>
          <span className="bg-primary h-[35px] leading-[35px] flex-1 rounded-[6px]">
            Winner
          </span>
          <span className="bg-primary h-[35px] leading-[35px] flex-1 rounded-[6px]">
            Prize
          </span>
        </div>
        <div className="bg-primary h-[30px] leading-[30px] font-content mt-2 text-base">
          No prize history yet
        </div>
        <div className="font-content text-base flex gap-5 mt-2">
          <span className="bg-primary h-[30px] flex-1 rounded-[6px] flex items-center justify-center gap-4">
            Draw #3
          </span>
          <span className="bg-primary h-[30px] leading-[30px] flex-1 rounded-[6px]">
            Dec 12, 2022 at 12:00 AM
          </span>
          <span className="bg-primary h-[30px] leading-[30px] flex-1 rounded-[6px]">
            Vdu4a...3dMV
          </span>
          <span className="bg-primary h-[30px] leading-[30px] flex-1 rounded-[6px]">
            10000 MANTA
          </span>
        </div>
      </div> */}
    </div>
  );
};

export default Prize;
