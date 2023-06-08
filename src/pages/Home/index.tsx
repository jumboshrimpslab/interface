import Banner from './Banner';
import DataBoard from './DataBoard';
import PrizeAndAccount from './PrizeAndAccount';

function Home() {
  return (
    <div className="text-center">
      <Banner />
      <DataBoard />
      <PrizeAndAccount />
    </div>
  );
}

export default Home;
