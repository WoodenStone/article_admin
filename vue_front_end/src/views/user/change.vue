<template>
  <el-container class="useradmin">
    <el-upload
      name="avatar"
      class="avatar-uploader"
      :data="{ id: userID }"
      action="http://localhost:3001/api/uploadAvatar"
      :show-file-list="false"
      :on-success="handleAvatarSuccess"
      :before-upload="beforeAvatarUpload"
      :on-error="handleAvatarError"
    >
      <img v-if="isAvatarExist" :src="avatarUrl" class="avatar" />
      <el-empty v-else :image-size="180" description="上传头像"></el-empty>
      <el-button size="small" type="primary" class="avatar-button"
        >点击上传</el-button
      >
    </el-upload>

    <el-form
      ref="userInfo"
      :model="userInfo"
      status-icon
      :rules="rules"
      label-width="100px"
      class="loginForm"
    >
      <el-form-item label="用户名" prop="username">
        <el-input
          ref="username"
          v-model="userInfo.username"
          autocomplete="off"
        />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input
          ref="password"
          v-model="userInfo.password"
          type="password"
          autocomplete="off"
          show-password
        />
      </el-form-item>
      <el-form-item label="确认密码" prop="checkPassword">
        <el-input
          ref="checkPassword"
          v-model="userInfo.checkPassword"
          type="password"
          autocomplete="off"
          show-password
          @keyup.enter.native="submitForm"
        />
      </el-form-item>

      <div class="userInfo-button">
        <el-button
          type="primary"
          @click.native.prevent="userinfoChange"
          size="small"
          >保存</el-button
        >
        <el-button @click="resetForm" size="small">重置</el-button>
        <el-button size="small" @click="handleBack">返回</el-button>
      </div>
    </el-form>
  </el-container>
</template>

<script>
export default {
  inject: ['reload'],
  data () {
    const validatePwd2 = (rule, value, callback) => {
      if (this.userInfo.checkPassword !== this.userInfo.password) {
        callback(new Error('两次输入的密码不一致!'))
      } else {
        callback()
      }
    }
    // const userID = JSON.parse(window.localStorage.getItem('user')).user_id
    return {
      avatarUrl: '',
      isAvatarExist: true,
      userID: JSON.parse(window.localStorage.getItem('user')).user_id,
      prevStored: JSON.parse(window.localStorage.getItem('user')),
      userInfo: {
        username: JSON.parse(window.localStorage.getItem('user')).user_name,
        password: JSON.parse(window.localStorage.getItem('user')).user_pwd,
        checkPassword: ''
      },
      rules: {
        username: [
          { required: true, trigger: 'blur', message: '请填写用户名' },
          {
            min: 3,
            max: 10,
            message: '用户名长度应在3到10个字符',
            trigger: 'blur'
          }
        ],
        password: [
          { required: true, trigger: 'blur', message: '请填写密码' },
          {
            min: 6,
            max: 18,
            message: '密码长度应在6到18个字符',
            trigger: 'blur'
          }
        ],
        checkPassword: [
          { required: true, trigger: 'blur', message: '请再次输入密码' },
          {
            validator: validatePwd2,
            trigger: 'blur',
            message: '两次输入的密码不一致'
          }
        ]
      }
    }
  },
  created () {
    this.getAvatar()
  },
  methods: {
    resetForm () {
      this.$refs.userInfo.resetFields()
    },
    // 用户信息更改
    userinfoChange () {
      this.$refs.userInfo.validate(valid => {
        if (valid) {
          const value = {
            id: this.userID,
            NEWname: this.userInfo.username,
            NEWpwd: this.userInfo.password
          }
          const tobeStored = this.prevStored
          tobeStored.user_name = this.userInfo.username
          tobeStored.user_pwd = this.userInfo.password
          this.$http
            .post('userInfoChange', value)
            .then((res, err) => {
              if (!err) {
                const changeResult = res.data.result
                if (changeResult === 0) {
                  this.$message({
                    message: '修改成功',
                    type: 'success',
                    duration: '2000'
                  })
                  // 更新localStorage存储的信息
                  this.$store.commit('setuserInfo', tobeStored)
                } else if (changeResult === 2) {
                  this.$message({
                    message: '该用户名已被占用',
                    type: 'warning',
                    duration: '2000'
                  })
                } else {
                  this.$message({
                    message: '服务器未知错误，请稍后再试',
                    type: 'error',
                    duration: '2000'
                  })
                }
              } else {
                console.log(err)
              }
            })
            .catch(e => {
              console.log(e)
            })
        } else {
          return false
        }
      })
    },
    // 用户头像更改
    handleAvatarSuccess (res, file) {
      this.avatarUrl = URL.createObjectURL(file.raw)
      setTimeout(() => {
        this.update()
      }, 2000)
      this.$message({
        message: '修改成功',
        type: 'success',
        duration: '2000'
      })
    },
    beforeAvatarUpload (file) {
      const isJPG = file.type === 'image/jpeg'
      const isPNG = file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG && !isPNG) {
        this.$message.error('上传头像图片只能是 JPG 或 PNG 格式')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB')
      }
      return (isJPG || isPNG) && isLt2M
    },
    handleAvatarError () {
      this.$message({
        message: '修改失败',
        type: 'error',
        duration: '2000'
      })
    },
    // 获取用户头像
    getAvatar () {
      this.$http
        .get(`getAvatar/${this.userID}`, { responseType: 'blob' })
        .then((res, err) => {
          if (!err) {
            // console.log(res)
            this.avatarUrl = URL.createObjectURL(res.data)
            // console.log(res.data.size)
            this.isAvatarExist = !!res.data.size
          } else {
            console.log(err)
          }
        })
        .catch(e => {
          console.log(e)
        })
    },
    // 取消修改
    handleBack () {
      this.$message({
        message: '已取消修改',
        type: 'info',
        duration: '2000'
      })
      setTimeout(() => {
        this.$router.push('index')
      }, 2000)
    },
    update () {
      this.reload()
    }
  }
}
</script>

<style lang="less" scoped>
.useradmin {
  .avatar-uploader,
  .el-upload {
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;

    .avatar-button {
      margin-top: 10px;
    }
  }
  .avatar-uploader:hover,
  .el-upload:hover {
    border-color: #409eff;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    line-height: 200px;
    width: 300px;
    height: 300px;
    text-align: center;
  }
  .avatar {
    border: 1px solid #d9d9d9;
    width: 200px;
    height: 200px;
    display: block;
  }
  .userInfo-button {
    display: flex;
    justify-content: center;
    padding-left: 70px;
  }
  .el-empty {
    padding: 0;
  }
}
</style>
