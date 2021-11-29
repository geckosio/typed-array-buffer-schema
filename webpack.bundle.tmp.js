const config = require('./webpack.bundle.js')

module.exports = { ...config, output: { ...config.output, filename: 'typed-array-buffer-schema.tmp.js' } }
