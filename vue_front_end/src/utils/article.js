export function addArticle () {
  return this.$http.post('addArticle', this.article).then((res, err) => {
    if (!err) {
      console.log('success')
      if (res.data.affectedRows === 1) {
        console.log('success', res.data)
        this.$message({
          message: '新增成功',
          type: 'success',
          duration: '2000'
        })
        // 跳转到详情页
        setTimeout(() => {
          this.$router.push({
            path: '/table/detail',
            query: { id: res.data.insertId }
          })
        }, 2000)
      }
    } else {
      console.log(err)
    }
  })
}
