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

// Vue.prototype.$http = axios.create({
//   baseURL: 'http://localhost:3001/api',
//   timeout: 5000
// })

Vue.prototype.$http = service

Vue.prototype.$confirm = MessageBox.confirm

Vue.prototype.$echarts = echarts

Vue.use(mavonEditor)

// 全局前置路由守卫
/* router.beforeEach(async (to, from, next) => {
  const user = JSON.parse(window.localStorage.getItem('user'))
  const userExpire = JSON.parse(window.localStorage.getItem('user__expires__'))
  const time = new Date().getTime()
  // 登录过期时间： 7天 1000 * 60 * 60 * 24 * 7
  if (userExpire) {
    if (time - userExpire > 1000 * 60 * 60 * 24 * 7) {
      // console.log(time, userExpire)
      store.commit('setuserInfo', '')
      window.setTimeout(() => {
        Message('登录信息过期，请重新登录')
      }, 2000)
    }

    // router.push(`/login?redirect=${this.$route.fullPath}`)
  }
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
}) */

router.beforeEach(async (to, from, next) => {
  const hasToken = getToken()
  if (hasToken) {
    // console.log('hasToken')
    if (to.path === '/login/login' || to.path === '/login/register') {
      next({ path: '/home' })
    } else {
      next()

      /* const user = JSON.parse(window.localStorage.getItem('user'))
      if (user) {
        if (to.path === '/login/login') {
          next({ path: '/home' })
        } else {
          next()
        }
      } else {
        if (to.path === '/login/login' || to.path === '/login/register') {
          next()
        } else {
          next({ path: '/login/login' })
        }
      } */
    }
  } else {
    // console.log('withoutToken')
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
