/* eslint-disable */
const withLess = require('next-plugin-antd-less')
const lessToJS = require('less-vars-to-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

// Where your antd-custom.less file lives
const themeVariables = lessToJS(fs.readFileSync(path.resolve(__dirname, './assets/antd-custom.less'), 'utf8'))

module.exports = withLess({
  env: {
    GA_TRACKING_CODE: process.env.GA_TRACKING_CODE,
    SLACK_APP_ID: process.env.SLACK_APP_ID,
    CRISP_WEBSITE_ID: process.env.CRISP_WEBSITE_ID,
  },
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: ['flowoid.s3.amazonaws.com'],
    path: '/_next/image',
    loader: 'default',
  },
})
