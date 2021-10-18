/* 利用js-cookie处理token */
import Cookies from 'js-cookie'

const myToken = 'vue_the_moment_token'

export function getToken () {
  return Cookies.get(myToken)
}

export function setToken (token) {
  return Cookies.set(myToken, token)
}

export function removeToken () {
  return Cookies.remove(myToken)
}
