const path = require('path')

module.exports = {
  mode: 'production',
  entry: './src/bundle.ts',
  output: {
    filename: 'typed-array-buffer-schema.js',
    path: path.resolve(__dirname, 'bundle'),
    library: 'Schema',
    libraryExport: 'default'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: [{ test: /\.tsx?$/, loader: 'ts-loader' }]
  }
}