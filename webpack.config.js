const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;
const { dependencies } = require("./package.json");
const dotenv = require("dotenv")
const webpack = require("webpack")
dotenv.config()
      
      module.exports = {
        entry: "./src/entry",
        mode: "development",
        devServer: {
          port: process.env.REACT_APP_PORT, // Modificar
          host: process.env.REACT_APP_HOST,
          allowedHosts: 'all',
          historyApiFallback: true, // Necesario para que funcione React Router
          client: {
            overlay: false
          }
        },
        module: {
          rules: [
            {
              test: /\.(png|jpe?g|gif)$/i,
              use: [
                {
                  loader: 'file-loader',
                },
              ],
            },
            {
              test: /\.(ts|tsx)$/,
              exclude: /node_modules/,
              use: [
                {
                  loader: "babel-loader",
                  options: {
                    presets: [
                      "@babel/preset-env",
                      "@babel/preset-react",
                      "@babel/preset-typescript",
                    ],
                  },
                },
              ],
            },
            {
              test: /\.(js|jsx)$/,
              exclude: /node_modules/,
              use: {
                loader: "babel-loader",
                options: {
                  presets: ["@babel/preset-env", "@babel/preset-react"],
                },
              },
            },
            {
              test: /\.css$/i,
              use: ["style-loader", "css-loader"],
            },
          ],
        },
        plugins: [
          new webpack.DefinePlugin({
            "process.env.REACT_APP_GATEWAY_URL": JSON.stringify(process.env.REACT_APP_GATEWAY_URL),
          }),
          new HtmlWebpackPlugin({
            template: "./public/index.html",
          }),
          new ModuleFederationPlugin({
            name: "mf_expert_profile", // Modificar
            filename: "remoteEntry.js",
            exposes: {
              "./Profile": "./src/components/Profile",
              "./ArticleList": "./src/components/ArticleList",
              "./AddFoodAdvice": "./src/components/AddFoodAdvice",
              "./FoodAdviceList": "./src/components/FoodAdviceList",
              "./ExpertList": "./src/components/ExpertList",
            },
            shared: {
              ...dependencies,
              react: {
                singleton: true,
                requiredVersion: dependencies["react"],
              },
              "react-dom": {
                singleton: true,
                requiredVersion: dependencies["react-dom"],
              },
              'react-router-dom': {
                  singleton: true,
                },
            },
          }),
        ],
        resolve: {
          extensions: [".tsx", ".ts", ".js", ".jsx"],
        },
        target: "web",
      };
      
      // Solo modificar las lineas que tienen comentarios