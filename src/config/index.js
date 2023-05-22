import configCommon from './common.json';
// Using `require` as `import` does not support dynamic loading (yet).
// eslint-disable-next-line @typescript-eslint/no-var-requires
const configEnv = require(`./${process.env.NODE_ENV}.json`);

// Accepting React env vars and aggregating them into `config` object.
const envVarNames = [];
const envVars = envVarNames.reduce((mem, n) => {
  // Remove the `REACT_APP_` prefix
  if (process.env[n] !== undefined) mem[n.slice(10)] = process.env[n];
  return mem;
}, {});

const config = { ...configCommon, ...configEnv, ...envVars };
export default config;
