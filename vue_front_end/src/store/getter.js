const getters = {
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  uname: state => state.user.user_name,
  uid: state => state.user.user_id
}

export default getters
