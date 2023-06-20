import { UserLotteryDataContextProvider } from 'contexts/UserLotteryDataContext';
import { GlobalLotteryDataContextProvider } from 'contexts/GlobalLotteryDataContext';
import { LotteryTxContextProvider } from 'contexts/LotteryTxContext';
import AppRouter from './AppRouter';
import { SubstrateContextProvider } from './contexts/SubstrateContext';
import { WalletContextProvider } from './contexts/WalletContext';
import { UsdValueContextProvider } from './contexts/UsdValueContext';
import { AxiosContextProvider } from './contexts/AxiosContext';

function App() {
  return (
    <div className="min-h-screen">
      <AxiosContextProvider>
        <UsdValueContextProvider>
          <SubstrateContextProvider>
            <WalletContextProvider>
              <GlobalLotteryDataContextProvider>
                <UserLotteryDataContextProvider>
                  <LotteryTxContextProvider>
                    <AppRouter />
                  </LotteryTxContextProvider>
                </UserLotteryDataContextProvider>
              </GlobalLotteryDataContextProvider>
            </WalletContextProvider>
          </SubstrateContextProvider>
        </UsdValueContextProvider>
      </AxiosContextProvider>
    </div>
  );
}

export default App;
