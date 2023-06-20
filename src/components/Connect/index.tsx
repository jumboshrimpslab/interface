import { useWallet } from 'contexts/WalletContext';
import ConnectWallet from './ConnectWallet';
import DisplayAccountButton from './DisplayAccountButton';

const Connect = () => {
  const { selectedAccount } = useWallet();

  return selectedAccount ? (
    <DisplayAccountButton />
  ) : (
    <ConnectWallet buttonWithIcon={true} />
  );
};

export default Connect;
