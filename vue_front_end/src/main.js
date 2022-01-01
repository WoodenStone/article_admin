import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/element.js'
import 'normalize.css'
import './styles/index.less'
import { getToken } from './utils/auth'
import service from './utils/request'
import { MessageBox } from 'element-ui'
import './utils/dialog'
import mavonEditor from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'
import 'remove-markdown'
import * as echarts from 'echarts'
import '@/assets/icon/iconfont.css'
Vue.config.productionTip = false

Vue.prototype.$http = service

Vue.prototype.$confirm = MessageBox.confirm

Vue.prototype.$echarts = echarts

Vue.use(mavonEditor)

// 全局前置路由守卫
router.beforeEach(async (to, from, next) => {
  const hasToken = getToken()
  if (hasToken) {
    // 阻止跳往登录页
    if (to.path === '/login/login' || to.path === '/login/register') {
      next({ path: '/home' })
    } else {
      next()
    }
  } else {
    if (to.path === '/login/login' || to.path === '/login/register') {
      next()
    } else {
      next({ path: '/login' })
    }
  }
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
