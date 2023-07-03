import { ToastContainer, toast } from 'react-toastify';
import { useEffect, useRef } from 'react';
import ReconnectingImage from 'resources/images/reconnecting.png';
import { useSubstrate } from 'contexts/SubstrateContext';
import Icon from 'components/Icon';
import 'react-toastify/dist/ReactToastify.css';

const Content = () => (
  <div className="h-[164px] p-4 flex flex-col items-center">
    <img
      src={ReconnectingImage}
      width="184"
      height="97"
      alt="reconnecting image"
    />
    <div className="font-content text-[#fe7017] text-base leading-5 mt-4">
      Reconnecting to Manta Network ...
    </div>
  </div>
);

const CloseButton = ({ closeToast }: any) => (
  <div onClick={closeToast}>
    <Icon name="close" className="w-4 h-4" />
  </div>
);

const ReconnectingToast = () => {
  const { apiState } = useSubstrate();
  const toastId = useRef<string | number | null>(null);
  useEffect(() => {
    if (apiState === 'DISCONNECTED' || apiState === 'ERROR') {
      toastId.current = toast(<Content />, {
        closeButton: false,
        className: 'p-0 rounded-3xl w-[280px]',
        autoClose: false
      });
    } else if (apiState === 'READY' && toastId.current !== null) {
      toast.dismiss(toastId.current);
    }
  }, [apiState]);
  return (
    <ToastContainer
      position="top-right"
      autoClose={15000}
      newestOnTop
      hideProgressBar={true}
      toastClassName="w-[350px] p-6 rounded-3xl"
      bodyClassName="p-0"
      closeButton={CloseButton}
    />
  );
};

export default ReconnectingToast;
