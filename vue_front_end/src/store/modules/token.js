import Vue from 'vue'
import { getToken, setToken, removeToken } from '../../utils/auth'

const getDefaultState = () => {
  return {
    token: getToken(),
    name: ''
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: state => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  }
}

const actions = {
  // user login
  login ({ commit }, userInfo) {
    // console.log(userInfo)
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      Vue.prototype.$http &&
        Vue.prototype.$http
          .post('Login', { username: username.trim(), password: password })
          .then(response => {
            commit('SET_TOKEN', response.data.token)
            setToken(response.data.token)
            resolve(response.data.userInfo)
            // resolve()
          })
          .catch(error => {
            reject(error)
          })
    })
  },

  // get user info
  getInfo ({ commit, state }) {
    return new Promise((resolve, reject) => {
      Vue.$http
        .get('/api/user')
        .then(response => {
          const { data } = response

          if (!data) {
            return reject(new Error('Verification failed, please Login again.'))
          }

          const { name, avatar } = data

          commit('SET_NAME', name)
          commit('SET_AVATAR', avatar)
          resolve(data)
        })
        .catch(error => {
          reject(error)
        })
    })
  },

  // user logout
  logout ({ commit, state }) {
    return new Promise((resolve, reject) => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  },

  // remove token
  resetToken ({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
