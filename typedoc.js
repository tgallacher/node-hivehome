module.exports = {
  entryPoints: ['./src'],
  exclude: ['**/constants.ts', './src/types.d.ts'],
  excludePrivate: true,
  excludeProtected: true,
  out: './docs',
  // theme: "minimal",
  disableSources: true,
};
