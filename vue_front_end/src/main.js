import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/element.js'
import 'normalize.css'
import './styles/index.less'
import axios from 'axios'
import { MessageBox } from 'element-ui'
import './utils/dialog'
Vue.config.productionTip = false

Vue.prototype.$http = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 5000
})

Vue.prototype.$confirm = MessageBox.confirm

// 全局前置路由守卫
router.beforeEach(async (to, from, next) => {
  const user = JSON.parse(window.localStorage.getItem('user'))
  // const hasLogin = JSON.parse(window.localStorage.getItem('user')).user_id
  // 已经登录，不用判断

  if (!user) {
    if (to.path === '/login/login' || to.path === '/login/register') {
      next()
    } else {
      next({ path: '/login' })
    }
  } else {
    if (to.path === '/login/login') {
      next({ path: '/home' })
    } else {
      next()
    }
  }
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
