import { useAccount } from 'contexts/AccountContext';
import { useGlobalLotteryData } from 'contexts/GlobalLotteryDataContext';
import { useUserLotteryData } from 'contexts/UserLotteryDataContext';

function Home() {
  const { selectedAccount } = useAccount();
  const globalLotteryData = useGlobalLotteryData();
  const userLotteryData = useUserLotteryData();

  console.log('globalLotteryData', globalLotteryData);
  console.log('userLotteryData', userLotteryData);

  return (
    <div className="text-white text-center">
      <h1 className="text-3xl h-32 leading-[128px]">Welcome to JumboShrimps</h1>
      <div>address: {selectedAccount?.address}</div>
      <div>balance: {userLotteryData?.userNonStakedBalance?.toString()}</div>
    </div>
  );
}

export default Home;
