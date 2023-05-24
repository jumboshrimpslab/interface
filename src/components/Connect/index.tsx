import { useAccount } from 'contexts/AccountContext';
import ConnectWallet from './ConnectWallet';
import DisplayAccountButton from './DisplayAccountButton';

const Connect = () => {
  const { selectedAccount } = useAccount();

  return selectedAccount ? <DisplayAccountButton /> : <ConnectWallet />;
};

export default Connect;
