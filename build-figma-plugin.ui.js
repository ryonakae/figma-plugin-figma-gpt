/* eslint-disable @typescript-eslint/no-var-requires */
const _ = require('lodash')

module.exports = function (buildOptions) {
  /** @type {import('esbuild').BuildOptions} */
  const newOptions = {
    loader: {
      '.dts': 'text',
    },
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  }

  return _.merge(buildOptions, newOptions)
}
