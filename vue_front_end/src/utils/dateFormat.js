/**
 * @description: convert ISO date to friendly time info
 * @param {ISO 8061 date} dateToBeFormatted
 * @return {string}
 * @author: WoodenStone
 */
export function dateFormat (dateToBeFormatted) {
  var dt = dateToBeFormatted.split(/[: T-]/).map(parseFloat)
  const timeFmt = new Date(
    Date.UTC(dt[0], dt[1] - 1, dt[2], dt[3] || 0, dt[4] || 0, dt[5] || 0, 0)
  )
  const isPositiveInteger = Date.now() - timeFmt > 0 ? '前' : '后'

  const pastSeconds = Math.floor(Math.abs(Date.now() - timeFmt) / 1000)

  switch (true) {
    case pastSeconds >= 3600 * 24 * 30:
      return timeFmt.toLocaleString()

    case pastSeconds >= 3600 * 24:
      return Math.floor(pastSeconds / 3600 / 24) + '天以' + isPositiveInteger
    case pastSeconds >= 3600:
      return Math.floor(pastSeconds / 3600) + '小时以' + isPositiveInteger
    case pastSeconds >= 60:
      return Math.floor(pastSeconds / 60) + '分钟以' + isPositiveInteger

    case pastSeconds >= 0:
      return '刚刚'
  }
}
