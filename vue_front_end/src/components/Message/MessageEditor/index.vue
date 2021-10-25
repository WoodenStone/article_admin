<template>
  <el-form
    :label-position="labelPosition"
    label-width="80px"
    :model="message"
    :rules="rules"
    ref="message"
  >
    <el-form-item label="标题" prop="title">
      <el-input placeholder="站内信标题" v-model="message.title"> </el-input>
    </el-form-item>
    <el-form-item label="收件人" prop="consignee_name">
      <el-autocomplete
        :maxlength="15"
        v-model="message.consignee_name"
        :fetch-suggestions="querySearchAsync"
        @select="handleSelect"
        :trigger-on-focus="false"
        suffix-icon="el-icon-search"
        placeholder="收件人用户名"
        @input="onInput()"
      >
      </el-autocomplete>
    </el-form-item>
    <el-form-item label="内容" prop="content">
      <el-input
        type="textarea"
        v-model="message.content"
        :autosize="{ minRows: 4, maxRows: 15 }"
        @input="onInput()"
      >
      </el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="sendMessage('message')">发送</el-button>
      <el-button @click="resetForm('message')">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: 'MessageEditor',
  props: {
    messageToReply: {
      type: Object,
      default: () => ({})
    },
    isReply: {
      type: Boolean,
      default: false
    }
  },
  inject: ['reload'],
  data () {
    return {
      labelPosition: 'left',
      message: {
        title: '',
        consignee_name: '',
        content: ''
      },
      rules: {
        title: [
          { required: true, trigger: 'blur', message: '请输入标题' },
          {
            min: 2,
            max: 10,
            message: '请输入长度在2-10个字符间的标题',
            trigger: 'blur'
          }
        ],
        content: [
          { required: true, trigger: 'blur', message: '请输入内容' },
          { max: 200, message: '站内信长度不能超过200个字符', trigger: 'blur' }
        ],
        consignee_name: [
          { required: true, trigger: 'blur', message: '请输入收件人用户名' }
        ]
      }
    }
  },
  /* mounted () {
    this.message = this.messageToReply
    if (this.isReply && Object.keys(this.messageToReply).length > 0) {
      console.log('1')
    } else if (!this.isReply) {
      console.log('2')
    }
  }, */
  watch: {
    isReply: {
      handler (val) {
        this.isReply = val
      },
      immediate: true
    },
    messageToReply: {
      handler (value) {
        // 如果直接写 = 赋值的话，在"回复-重置-收件箱"的连续操作中，
        // 收件箱中的内容会被置空
        this.message = Object.assign({}, value)
        if (Object.keys(value).length > 0) {
          this.message.consignee_name = value.addresser_name
          this.message.content = `回复 @${this.message.consignee_name} 的 [ ${this.message.title} ]:
`
          this.message.title = ''
        }
      },
      immediate: true
    }
  },
  methods: {
    resetForm (formName) {
      // 没有nexttick不生效
      this.$nextTick(() => {
        this.$refs[formName].resetFields()
        this.message.content = ''
      })
    },
    // 检查输入的用户名是否合法
    checkUsername (value) {
      return this.$http
        .get(`getIdByName/${value.consignee_name}`)
        .then((res, err) => {
          if (err) {
            console.log(err)
          } else {
            if (res.data.length === 0) {
              return false
            } else {
              value.consignee_id = res.data.user_id
              return true
            }
          }
        })
        .catch(e => {
          console.log(e)
        })
    },
    addMessage (value) {
      return this.$http
        .post('newMessage', value)
        .then((res, err) => {
          if (!err) {
            if (res.status === 200) {
              this.$message({
                type: 'success',
                message: '发送成功',
                duration: '2000'
              })
              // 先重置再跳转到发件箱
              this.resetForm('message')

              setTimeout(() => {
                this.update()
              }, 2000)
            }
          } else {
            this.$message({
              type: 'error',
              message: '服务器错误，请稍候再试…',
              duration: '2000'
            })
            console.log(err)
          }
        })
        .catch(e => {
          console.log(e)
        })
    },
    sendMessage (formName) {
      this.$refs[formName].validate(async valid => {
        if (valid) {
          // console.log(this.message)
          const value = Object.assign({}, this.message)
          const uid = JSON.parse(window.localStorage.getItem('user')).user_id
          const uname = JSON.parse(window.localStorage.getItem('user'))
            .user_name
          value.addresser_id = uid
          value.addresser_name = uname
          const validName = await this.checkUsername(value)
          if (validName) {
            this.addMessage(value)
          } else {
            this.$message({
              type: 'error',
              message: '请检查输入的用户名是否正确',
              duration: '2000'
            })
          }
        } else {
          return false
        }
      })
    },
    // 收件人用户名提示
    querySearchAsync (query, callback) {
      let list = [{}]
      const value = { q: query }
      this.$http
        .post('searchName', value)
        .then((res, err) => {
          if (!err) {
            if (res.data.length > 0) {
              for (const i of res.data) {
                i.value = i.user_name
              }
              list = res.data
            } else {
              list = [{ value: '暂无结果' }]
            }
            callback(list)
          } else {
            console.log('err', err)
          }
        })
        .catch(e => {
          console.log(e)
        })
    },
    handleSelect (item) {
      //   console.log(item)
      /* if (item.id > 0) {
        this.$router.push({
          path: '/table/detail',
          query: { id: item.id, isEdit: false }
        })
      } */
      this.message.consignee_name = item.user_name
      // console.log(item)
    },
    // 强制刷新输入内容
    onInput () {
      this.$forceUpdate()
    },
    update () {
      this.reload()
    }
  }
}
</script>
