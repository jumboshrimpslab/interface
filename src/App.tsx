import { UserLotteryDataContextProvider } from 'contexts/UserLotteryDataContext';
import { GlobalLotteryDataContextProvider } from 'contexts/GlobalLotteryDataContext';
import { LotteryTxContextProvider } from 'contexts/LotteryTxContext';
import AppRouter from './AppRouter';
import { SubstrateContextProvider } from './contexts/SubstrateContext';
import { KeyringContextProvider } from './contexts/KeyringContext';
import { AccountContextProvider } from './contexts/AccountContext';
import { UsdValueContextProvider } from './contexts/UsdValueContext';
import { AxiosContextProvider } from './contexts/AxiosContext';

function App() {
  return (
    <div className="min-h-screen">
      <AxiosContextProvider>
        <UsdValueContextProvider>
          <SubstrateContextProvider>
            <KeyringContextProvider>
              <AccountContextProvider>
                <GlobalLotteryDataContextProvider>
                  <UserLotteryDataContextProvider>
                    <LotteryTxContextProvider>
                      <AppRouter />
                    </LotteryTxContextProvider>
                  </UserLotteryDataContextProvider>
                </GlobalLotteryDataContextProvider>
              </AccountContextProvider>
            </KeyringContextProvider>
          </SubstrateContextProvider>
        </UsdValueContextProvider>
      </AxiosContextProvider>
    </div>
  );
}

export default App;
