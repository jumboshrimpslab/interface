import { Button } from 'primereact/button';

const ClaimPrizesModal = ({ hideModal }: { hideModal: () => void }) => {
  const handleClaim = () => {
    console.log('claim');
  };

  return (
    <div className="w-[509px] text-center">
      <h1 className="text-2xl text-left leading-10 text-secondary font-title">
        Withdraw MANTA
      </h1>

      <div className="font-title text-base flex justify-between gap-5 mt-6">
        <span className="bg-primary h-[35px] leading-[35px] w-[200px] rounded-[6px]">
          Draw
        </span>
        <span className="bg-primary h-[35px] leading-[35px] flex-1 rounded-[6px]">
          Prize
        </span>
      </div>

      <div className="font-content text-base flex justify-between gap-5 mt-2">
        <span className="bg-primary h-[30px] rounded-[6px] w-[200px]">
          Draw #3
        </span>
        <span className="bg-primary h-[30px] leading-[30px] flex-1 rounded-[6px]">
          10000 MANTA
        </span>
      </div>

      <div className="font-content mt-6">
        <Button
          onClick={handleClaim}
          label="Claim"
          className="font-title bg-button-primary w-full text-white rounded-xl h-[66px]"
        />
      </div>
    </div>
  );
};

export default ClaimPrizesModal;
