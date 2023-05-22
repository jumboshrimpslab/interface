import AppRouter from './AppRouter';
import { SubstrateContextProvider } from './contexts/SubstrateContext';

function App() {
  return (
    <SubstrateContextProvider>
      <AppRouter />
    </SubstrateContextProvider>
  );
}

export default App;
