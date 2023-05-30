import { useCallback, useEffect, useState } from 'react';
import { useSubstrate } from 'contexts/SubstrateContext';
import { useAccount } from 'contexts/AccountContext';
import type { KeyringPair } from '@polkadot/keyring/types';

function Home() {
  const { api, apiState } = useSubstrate();
  const { selectedAccount } = useAccount();
  const [balance, setBalance] = useState<string>('');

  const fetchPublicBalance = useCallback(
    async (account: KeyringPair | null) => {
      if (!api || apiState !== 'READY' || !account?.address) {
        return;
      }
      const raw: any = await api.query.system.account(account?.address);
      const rawBalance = raw?.data?.free.toString();

      setBalance(rawBalance.toString());
    },
    [api, apiState]
  );

  useEffect(() => {
    fetchPublicBalance(selectedAccount);
  }, [fetchPublicBalance, selectedAccount]);

  return (
    <div className="text-white text-center">
      <h1 className="text-3xl h-32 leading-[128px]">Welcome to JumboShrimps</h1>
      <div>address: {selectedAccount?.address}</div>
      <div>balance: {balance}</div>
    </div>
  );
}

export default Home;
