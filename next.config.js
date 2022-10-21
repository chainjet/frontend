/* eslint-disable */
const withLess = require('next-plugin-antd-less')
const lessToJS = require('less-vars-to-js')
const fs = require('fs')
const path = require('path')
const WithHtmlModule = require('@blunck/next-html')
require('dotenv').config()

// Where your antd-custom.less file lives
const themeVariables = lessToJS(fs.readFileSync(path.resolve(__dirname, './styles/antd-custom.less'), 'utf8'))

const withHtml = WithHtmlModule({})

module.exports = withHtml(
  withLess({
    modifyVars: themeVariables,
    images: {
      deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
      imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
      domains: ['flowoid.s3.amazonaws.com'],
      path: '/_next/image',
      loader: 'default',
    },
    rewrites: async () =>
      process.env.NEXT_PUBLIC_IS_CLOUD
        ? [
            {
              source: '/',
              destination: '/dist/index.html',
            },
            {
              source: '/waiting-list',
              destination: '/dist/waiting-list.html',
            },
          ]
        : [
            {
              source: '/',
              destination: '/go-login.html',
            },
          ],
  }),
)
