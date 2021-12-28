import Vue from 'vue'
import Vuex from 'vuex'
import user from './modules/user'
import getters from './getter'
import token from './modules/token'
Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    user,
    token
  },
  getters
})
export default store
