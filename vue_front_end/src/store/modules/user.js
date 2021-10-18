const state = {
  user: JSON.parse(window.localStorage.getItem('user')) || {}
}

const mutations = {
  setuserInfo (state, v) {
    localStorage.setItem('user', JSON.stringify(v))
    state.user = v
  }
}

export default {
  state,
  mutations
}
