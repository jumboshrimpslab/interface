import { useModal } from 'hooks';
import ClaimPrizesModal from 'components/Modal/ClaimPrizesModal';

const Prize = () => {
  const { ModalWrapper, showModal, hideModal } = useModal();
  return (
    <div>
      <div className="h-[202px] bg-gradient-to-r from-[#FF6B00] to-[#FFCE51] rounded-3xl flex items-center justify-between px-12 text-[#fff8ee]">
        <div>
          <div className="font-content text-2xl leading-[30px] font-extrabold mb-2">
            Coming Soon
          </div>
          <div className="font-title text-[40px] leading-[68px]">Draw #4</div>
        </div>
        <div>
          {/* <button className="w-[280px] h-[66px] rounded-xl text-xl font-title border border-white/50 bg-white/20 text-white/80 cursor-not-allowed">
            No Draws to Check
          </button> */}
          <button
            onClick={showModal}
            className="w-[280px] h-[66px] rounded-xl text-xl font-title bg-button-primary text-white"
          >
            Claim Prize
          </button>
          <ModalWrapper>
            <ClaimPrizesModal hideModal={hideModal} />
          </ModalWrapper>
        </div>
      </div>
      <div>
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
        <div className="font-content text-base flex gap-5 mt-2">
          <span className="bg-primary h-[30px] flex-1 rounded-[6px] flex items-center justify-center gap-4">
            Draw #2
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
        <div className="font-content text-base flex gap-5 mt-2">
          <span className="bg-primary h-[30px] flex-1 rounded-[6px] flex items-center justify-center gap-4">
            Draw #1
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
      </div>
    </div>
  );
};

export default Prize;
