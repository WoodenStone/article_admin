import axios from 'axios'
import { Message } from 'element-ui'
import router from '../router'
import store from '../store/index'
import { getToken } from '../utils/auth'
// import router from '../router'

const service = axios.create({
  baseURL: 'http://localhost:3001/api',
  withCredentials: 'include',
  timeout: 5000
})

service.interceptors.request.use(
  config => {
    // console.log(store)
    if (store.getters.token.token) {
      config.headers.common['AA-Token'] = getToken()
    }
    return config
  },
  error => {
    console.log(error)
    return Promise.reject(error)
  }
)

let count = 1
// const self = this
service.interceptors.response.use(
  response => {
    // const res = response.data
    return response
  },
  error => {
    const errorCode = error.response && error.response.status
    if (errorCode === 801) {
      Message({
        message: '请输入正确的用户名和密码~',
        type: 'error',
        duration: 3 * 1000
      })
    } else if (errorCode === 401) {
      // token超时
      if (count) {
        Message({
          message: '登录过期，即将跳转至登录界面',
          type: 'warning',
          duration: 2 * 1000
        })
        count--
      }
      store.dispatch('token/resetToken')
      setTimeout(() => {
        router.push({ path: '/login/login' })
      }, 2000)
      // router.push({ path: '/login/login' })
    } else if (errorCode === 402) {
      Message({
        message: '未检测到登陆信息',
        type: 'warning',
        duration: 3 * 1000
      })
      store.dispatch('token/resetToken')
      router.push({ path: '/login/login' })
    } else {
      Message({
        message: '出错了，请稍后再试',
        type: 'error',
        duration: 2 * 1000
      })
    }
    return Promise.reject(error)
  }
)

export default service
