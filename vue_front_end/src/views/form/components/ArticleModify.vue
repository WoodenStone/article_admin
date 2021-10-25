<template>
  <el-form
    @submit.native.prevent
    ref="article"
    :model="article"
    label-width="80px"
    :rules="articleRules"
  >
    <el-form-item label="标题" prop="title">
      <el-input v-model="article.title"></el-input>
    </el-form-item>
    <el-form-item label="作者" prop="author">
      <el-input
        v-model="article.author"
        :readonly="true"
        class="author-input"
      ></el-input>
    </el-form-item>
    <el-form-item label="标签" prop="tags">
      <tag-input v-model="article.tagName"></tag-input>
    </el-form-item>
    <el-form-item label="内容" prop="content">
      <!--
      <el-input
        type="textarea"
        v-model="article.content"
        :autosize="{ minRows: 10, maxRows: 80 }"
      ></el-input>

      <el-input type="textarea" v-model="article.content"> </el-input>-->
      <mavon-editor
        v-model="article.content"
        ref="md"
        name="img"
        @imgAdd="imgAdd"
      ></mavon-editor>
    </el-form-item>
    <el-form-item>
      <el-button
        v-if="!this.isEdit"
        type="primary"
        @click="handleModify('article')"
        >立即创建</el-button
      >
      <el-button
        v-if="this.isEdit"
        type="primary"
        @click="handleModify('article')"
        >保存</el-button
      >
      <el-button v-if="this.isEdit" @click="handleBack">返回</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import TagInput from '@/components/Tags'
export default {
  name: 'ArticleModify',
  components: { TagInput },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      user_name: JSON.parse(window.localStorage.getItem('user')).user_name,
      article: {
        title: '',
        author: '',
        content: '',
        tagName: [],
        author_id: '',
        rawcontent: ''
      },
      articleRules: {
        title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
        content: [
          { required: true, message: '请输入文章内容', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    if (this.isEdit) {
      this.getArticleDetail()
    }
    // 设置作者为用户名 只读
    this.article.author = this.user_name
    this.article.author_id = JSON.parse(
      window.localStorage.getItem('user')
    ).user_id
    // console.log('create')
  },
  methods: {
    // 获取文章信息
    getArticleDetail () {
      const aid = this.$route.query.id
      this.$http
        .get(`articleDetail?aid=${aid}`)
        .then((res, err) => {
          if (!err) {
            this.article = res.data
            // console.log(this.article, '文章信息')
          } else {
            console.log(err)
          }
        })
        .catch(e => {
          console.log(e)
        })
    },
    // 去除markdown符号 用于模糊查询
    articleFilter () {
      const removeMd = require('remove-markdown')
      this.article.rawcontent = removeMd(this.article.content)
      // console.log(this.article.rawcontent, 'after')
    },
    // 进行文章创建或更新，成功后跳转到详情页
    handleModify (formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          // console.log('编辑模式', this.isEdit)
          // 编辑就执行更新函数，否则执行新建文章
          if (this.article.tagName.length > 5) {
            this.$message({
              message: '标签不能超过5个',
              type: 'warning',
              duration: '2000'
            })
          } else {
            this.articleFilter()
            if (!this.isEdit) {
              // console.log(this.article, 'arti add')
              // this.submitAdd()
              this.submitAdd()
            } else {
              // console.log(this.article, 'arti update')
              this.submitUpdate()
            }
          }
        } else {
          this.$message({
            message: '请正确填写文章内容',
            type: 'warning',
            duration: '2000'
          })
        }
      })
    },
    // 更新某篇文章
    submitUpdate () {
      this.$http
        .post('updateArticle', this.article)
        .then((res, err) => {
          if (!err) {
            // console.log('success')
            if (res.data.affectedRows === 1) {
              // console.log('success', res.data)
              this.$message({
                message: '修改成功',
                type: 'success',
                duration: '2000'
              })
              // 跳转到详情页
              setTimeout(() => {
                this.$router.push({
                  path: '/table/detail',
                  query: { id: this.article.id }
                })
              }, 2000)
            }
          } else {
            console.log(err)
          }
        })
        .catch(e => {
          console.log(e)
        })
    },
    // 新增文章
    submitAdd () {
      this.$http
        .post('addArticle', this.article)
        .then((res, err) => {
          if (!err) {
            if (res.data.insertId) {
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
        .catch(e => {
          console.log(e)
        })
    },
    // 编辑界面返回
    handleBack () {
      this.$message({
        message: '已取消修改',
        duration: '2000'
      })
      // 跳转到详情页
      setTimeout(() => {
        this.$router.push('/table/index')
      }, 2000)
    },
    // 在md中添加图片
    imgAdd (pos, $file) {
      // 第一步.将图片上传到服务器.
      var formdata = new FormData()
      formdata.append('image', $file)
      this.$http({
        url: 'imgUpload',
        method: 'post',
        data: formdata,
        headers: { 'Content-Type': 'multipart/form-data' }
      })
        .then(url => {
          // 第二步.将返回的url替换到文本原位置![...](0) -> ![...](url)
          // console.log(url)
          this.$refs.md.$img2Url(pos, url.data)
        })
        .catch(e => {
          console.log(e)
        })
    }
  }
}
</script>

<style lang="less" scoped>
.author-input /deep/ .el-input__inner {
  border: 0;
  cursor: default;
}
</style>
