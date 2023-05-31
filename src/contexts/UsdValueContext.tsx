import {
  useState,
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useEffect
} from 'react';
import axios from 'axios';
import Decimal from 'decimal.js';
import Usd from 'classes/Usd';
import config from 'config';
import AssetType from 'classes/AssetType';
import { useAxios } from './AxiosContext';

type UsdValueContextValue = {
  nativeTokenUsdValue: Usd | null;
};
const UsdValueContext = createContext<UsdValueContextValue | null>(null);

const UsdValueContextProvider = ({ children }: { children: ReactNode }) => {
  const axiosIsInit = useAxios();

  const [nativeTokenUsdValue, setNativeTokenUsdValue] = useState<Usd | null>(
    null
  );

  useEffect(() => {
    const getNativeTokenUsdValue = async () => {
      if (!axiosIsInit) {
        return;
      }
      const nativeAssetCoingeckoId = AssetType.Native().coingeckoId;
      try {
        const res = await axios.get(
          `${config.COINGECKO_PROXY_URL}/prices/${nativeAssetCoingeckoId}`
        );
        const usdValue = res.data[nativeAssetCoingeckoId]
          ? new Usd(new Decimal(res.data[nativeAssetCoingeckoId]['usd']))
          : null;
        setNativeTokenUsdValue(usdValue);
      } catch (e) {
        console.error(e);
        setNativeTokenUsdValue(null);
      }
    };
    getNativeTokenUsdValue();
  }, [axiosIsInit]);

  const state = useMemo(() => ({ nativeTokenUsdValue }), [nativeTokenUsdValue]);

  return (
    <UsdValueContext.Provider value={state}>
      {children}
    </UsdValueContext.Provider>
  );
};

const useUsdValue = () => useContext(UsdValueContext) as UsdValueContextValue;

export { UsdValueContextProvider, useUsdValue };
