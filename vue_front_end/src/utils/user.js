/**
 * @description:: get user avatar by user id
 * @param {*} that  --- the original 'this'
 * @param {*} id  --- user id
 * @return {*}  --- blob data of AvatarURL
 * @author: WoodenStone
 */
export default function getUserAvatarById (that, id) {
  return that.$http
    .get(`getAvatar/${id}`, { responseType: 'blob' })
    .then((res, err) => {
      if (!err) {
        return URL.createObjectURL(res.data)
      } else {
        console.log(err)
      }
    })
}
