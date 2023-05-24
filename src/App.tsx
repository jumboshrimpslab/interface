import AppRouter from './AppRouter';
import { SubstrateContextProvider } from './contexts/SubstrateContext';
import { KeyringContextProvider } from './contexts/KeyringContext';
import { AccountContextProvider } from './contexts/AccountContext';

function App() {
  return (
    <div className="min-h-screen bg-primary">
      <SubstrateContextProvider>
        <KeyringContextProvider>
          <AccountContextProvider>
            <AppRouter />
          </AccountContextProvider>
        </KeyringContextProvider>
      </SubstrateContextProvider>
    </div>
  );
}

export default App;
