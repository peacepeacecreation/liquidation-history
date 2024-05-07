import { createApp } from 'vue'

import axios, { AxiosError } from 'axios'
axios.defaults.headers["Access-Control-Allow-Origin"] = '*'
axios.defaults.baseURL = 'http://185.237.206.20/:3000' //'https://api.binance.com'

import App from './App.vue'
import router from './router'

import './index.css'

const app = createApp(App).use(router)
app.config.globalProperties.$axios = AxiosError
app.mount('#app')
