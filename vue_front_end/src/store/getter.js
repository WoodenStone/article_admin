const getters = {
  token: state => state.token,
  avatar: state => state.user.avatar,
  uname: state => state.user.user_name,
  uid: state => state.user.user_id
}

export default getters
