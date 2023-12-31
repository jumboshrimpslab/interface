import { useState } from 'react';
import OutsideClickHandler from 'react-outside-click-handler';
import { useWallet } from 'contexts/WalletContext';
import ConnectWallet from './ConnectWallet';
import WalletSelectIconBar from './WalletSelectIconBar';
import AccountSelectDropdown from './AccountSelectDropdown';

const DisplayAccountButton = () => {
  const { selectedWallet, selectedAccount } = useWallet();
  const [showAccountList, setShowAccountList] = useState(false);

  const succinctAccountName = (
    (selectedAccount as any)?.name.length > 9
      ? `${(selectedAccount as any)?.name.slice(0, 9)}...`
      : (selectedAccount as any)?.name
  ) as string;

  return (
    <div className="relative">
      <OutsideClickHandler onOutsideClick={() => setShowAccountList(false)}>
        <button
          className="flex items-center justify-center gap-4 font-title w-[227px] h-[50px] rounded-xl text-xl text-white bg-transparent border border-white"
          onClick={() => setShowAccountList(!showAccountList)}
        >
          <img
            className="unselectable-text w-6 h-6 rounded-full"
            src={selectedWallet?.logo.src}
            alt={selectedWallet?.logo.alt}
          />
          {succinctAccountName}
        </button>

        {showAccountList && (
          <div className="w-80 flex flex-col mt-3 absolute right-0 top-full rounded-lg">
            <div className="flex flex-row items-center justify-between bg-primary rounded-t-lg">
              <div className="flex flex-row items-center">
                <WalletSelectIconBar />
              </div>
              <div className="mr-4">
                <ConnectWallet isButton={false} />
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto bg-white px-5 py-5 rounded-b-lg">
              <AccountSelectDropdown />
            </div>
          </div>
        )}
      </OutsideClickHandler>
    </div>
  );
};

export default DisplayAccountButton;
