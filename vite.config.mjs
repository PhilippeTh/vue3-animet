// Plugins
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Fonts from 'unplugin-fonts/vite'
import Layouts from 'vite-plugin-vue-layouts'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import Vue from '@vitejs/plugin-vue'
import VueRouter from 'unplugin-vue-router/vite'
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

// Utilities
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.BASE_URL || '/',
  transpileDependencies: true,
  plugins: [
    nodePolyfills(),
    VueRouter(),
    Layouts(),
    Vue({
      template: { transformAssetUrls }
    }),
    // https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin#readme
    Vuetify({
      autoImport: true,
      icons: {
        iconfont: "mdi",
      },
      theme: {
        dark: false,
        themes: {
          dark: {
            primary: "#1689E7",
            accent: "#4CBB99",
            secondary: "#7BC6FF",
            success: "#4CAF50",
            info: "#2196F3",
            warning: "#FB8C00",
            error: "#FF5252",
          },
          light: {
            primary: "#1689E7",
            accent: "#4CBB99",
            secondary: "#7BC6FF",
            success: "#4CAF50",
            info: "#2196F3",
            warning: "#FB8C00",
            error: "#FF5252",
          },
        },
      },
    }),
    Components(),
    Fonts({
      google: {
        families: [{
          name: 'Roboto',
          styles: 'wght@100;300;400;500;700;900',
        }],
      },
    }),
    AutoImport({
      imports: [
        'vue',
        'vue-router',
      ],
      eslintrc: {
        enabled: true,
      },
      vueTemplate: true,
    }),
  ],
  define: { 'process.env': {} },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
    ],
  },
  // chainWebpack: (config) => {
  //   // ensure index.html is not minified
  //   config.plugin("html").tap((args) => {
  //     args[0].minify = false;
  //     return args;
  //   });
  // },
  // configureWebpack: {
  //   devtool: "source-map",
  //   plugins: [new NodePolyfillPlugin()],
  //   resolve: {
  //     fallback: {
  //       fs: false,
  //       os: false,
  //       path: false,
  //     },
  //   },
  // },
  server: {
    port: 3000,
  },
})
