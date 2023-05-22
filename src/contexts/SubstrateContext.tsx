import { ApiPromise, WsProvider } from '@polkadot/api';
import {
  useReducer,
  createContext,
  useContext,
  ReactNode,
  useEffect
} from 'react';
import config from '../config';
import types from '../config/types.json';
import type { DefinitionRpc, DefinitionRpcSub } from '@polkadot/types/types';

type RPCType = Record<string, Record<string, DefinitionRpc | DefinitionRpcSub>>;

export type API_STATE =
  | 'CONNECT_INIT'
  | 'CONNECTING'
  | 'READY'
  | 'ERROR'
  | 'DISCONNECTED'
  | null;

export type SubstrateStateType = {
  socket: string | string[];
  rpc: RPCType;
  types: object;
  api: ApiPromise | null;
  apiError: Error | null;
  apiState: API_STATE;
};

const INIT_STATE: SubstrateStateType = {
  socket: '',
  rpc: {},
  types,
  api: null,
  apiError: null,
  apiState: null
};

type SubstrateAction =
  | { type: 'CONNECT_INIT' }
  | { type: 'CONNECT'; payload: ApiPromise }
  | { type: 'CONNECT_SUCCESS' }
  | { type: 'DISCONNECTED' }
  | { type: 'CONNECT_ERROR'; payload: Error };

// Reducer function for `useReducer`
const reducer = (
  state: SubstrateStateType,
  action: SubstrateAction
): SubstrateStateType => {
  switch (action.type) {
    case 'CONNECT_INIT':
      return { ...state, apiState: 'CONNECT_INIT' };
    case 'CONNECT':
      return { ...state, api: action.payload, apiState: 'CONNECTING' };
    case 'CONNECT_SUCCESS':
      return { ...state, apiState: 'READY' };
    case 'DISCONNECTED':
      return { ...state, apiState: 'DISCONNECTED' };
    case 'CONNECT_ERROR':
      return { ...state, apiState: 'ERROR', apiError: action.payload };
    default:
      return state;
  }
};

// Connecting to the Substrate node
const connect = (
  state: SubstrateStateType,
  dispatch: (action: SubstrateAction) => void
) => {
  const { apiState, socket, rpc } = state;
  // We only want this function to be performed once
  if (apiState) return;

  dispatch({ type: 'CONNECT_INIT' });

  const provider = new WsProvider(socket);
  const _api = new ApiPromise({ provider, rpc });

  // Set listeners for disconnection and reconnection event.
  _api.on('connected', () => {
    dispatch({ type: 'CONNECT', payload: _api });
    console.log(`Connected socket: ${socket}`);
    // `ready` event is not emitted upon reconnection and is checked explicitly here.
    _api.isReady.then(() => dispatch({ type: 'CONNECT_SUCCESS' }));
  });
  _api.on('ready', () => {
    dispatch({ type: 'CONNECT_SUCCESS' });
    console.log('ready');
  });
  _api.on('disconnected', () => {
    dispatch({ type: 'DISCONNECTED' });
    console.log('disconnected');
  });
  _api.on('error', err => {
    dispatch({ type: 'CONNECT_ERROR', payload: err });
    console.log('err', err);
  });
};

const SubstrateContext = createContext<SubstrateStateType | null>(null);

const SubstrateContextProvider = ({ children }: { children: ReactNode }) => {
  const initialState = {
    ...INIT_STATE,
    socket: config.PROVIDER_SOCKET,
    rpc: config.RPC
  };
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    connect(state, dispatch);
  }, [state]);

  return (
    <SubstrateContext.Provider value={state}>
      {children}
    </SubstrateContext.Provider>
  );
};

const useSubstrate = () => useContext(SubstrateContext) as SubstrateStateType;

export { SubstrateContextProvider, useSubstrate };
