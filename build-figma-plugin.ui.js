module.exports = function (buildOptions) {
  return {
    ...buildOptions,
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  }
}
