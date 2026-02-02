const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    ocrScript: './src/scripts/ocrScript.js'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'src/scripts/dist'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js'],
    fallback: {
      "fs": false,
      "path": false,
      "worker_threads": false
    }
  }
};
