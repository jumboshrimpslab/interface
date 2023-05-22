import AppRouter from './AppRouter';
import { SubstrateContextProvider } from './contexts/SubstrateContext';
import { KeyringContextProvider } from './contexts/KeyringContext';

function App() {
  return (
    <SubstrateContextProvider>
      <KeyringContextProvider>
        <AppRouter />
      </KeyringContextProvider>
    </SubstrateContextProvider>
  );
}

export default App;
