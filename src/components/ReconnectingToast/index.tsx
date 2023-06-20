import { ToastContainer, toast } from 'react-toastify';
import { useEffect } from 'react';
import ReconnectingImage from 'resources/images/reconnecting.png';
import { useSubstrate } from 'contexts/SubstrateContext';
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

const ReconnectingToast = () => {
  const { apiState } = useSubstrate();
  useEffect(() => {
    if (apiState === 'DISCONNECTED' || apiState === 'ERROR') {
      toast(<Content />);
    } else if (apiState === 'READY') {
      toast.dismiss();
    }
  }, [apiState]);
  return (
    <ToastContainer
      position="top-right"
      closeButton={false}
      autoClose={false}
      newestOnTop
      hideProgressBar={true}
      toastClassName="p-0 rounded-3xl w-[280px]"
      bodyClassName="p-0"
    />
  );
};

export default ReconnectingToast;
