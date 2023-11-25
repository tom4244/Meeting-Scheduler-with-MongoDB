var webpack = require("webpack");
var path = require("path");
var DIST_DIR = path.resolve(__dirname, "server");
var SRC_DIR = path.resolve(__dirname, "src");

const devMode = process.env.NODE_ENV !== "production";
module.exports = {
	stats: {
		errorDetails: true,
	},
	mode: devMode ? 'development' : 'production',
	 devtool: 'cheap-module-source-map', 
    entry: [
	  path.join(__dirname, 'src/app/index.js') 
    ],
	output: {
		path: path.join(__dirname, 'server'),
		filename: "bundle.js",
		publicPath: "/"
	},
	
	plugins: [],
	module: {
		rules: [
			{
				test: /\.jsx?$/,
				use: [ 'babel-loader' ], 
				exclude: /(node_modules)/,
				include: [
			    path.join(__dirname, 'src/app'),		
					SRC_DIR + 'server/shared'
				]
			},
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
				type: 'asset/resource',
      },
      {
        test: /\.(jpe?g|png|gif)(\?v=\d+\.\d+\.\d+)?$/,
				type: 'asset/resource',
      },
      {
		    test: /\.(sa|sc|c)ss$/,
        use: [
					devMode ? "style-loader" : MiniCssExtractPlugin.loader,
          "css-loader",
          "sass-loader"
        ],	
			},
		]
 	}
};

