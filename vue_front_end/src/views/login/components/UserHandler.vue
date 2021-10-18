<template>
  <div class="login-container">
    <div class="login-box">
      <el-form
        ref="loginForm"
        :model="loginForm"
        status-icon
        :rules="rules"
        label-width="100px"
        class="loginForm"
      >
        <div class="title-container">
          <h3 class="title" v-if="this.isRegistered">用户登录</h3>
          <h3 class="title2" v-if="!this.isRegistered">用户注册</h3>
        </div>
        <el-form-item label="用户名" prop="username">
          <el-input
            ref="username"
            v-model="loginForm.username"
            autocomplete="off"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            ref="password"
            v-model="loginForm.password"
            type="password"
            autocomplete="off"
            show-password
            @keyup.enter.native="submitForm"
          />
        </el-form-item>

        <div class="login-button">
          <el-button
            :loading="loading"
            type="primary"
            @click.native.prevent="submitForm"
            >提交</el-button
          >
          <el-button @click="resetForm">重置</el-button>
          <el-button
            type="text"
            @click="gotoRegister"
            size="mini"
            v-if="this.isRegistered"
            >还未注册？去注册</el-button
          >
          <el-button
            type="text"
            @click="gotoLogin"
            size="mini"
            v-if="!this.isRegistered"
            >已注册，直接登录</el-button
          >
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserHandler',
  props: {
    registered: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      isRegistered: this.registered,
      loginForm: {
        username: '',
        password: ''
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
        ]
      },
      pwdType: 'password',
      loading: false,
      redirect: undefined
    }
  },
  watch: {
    $route: {
      handler: function (route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  methods: {
    gotoRegister () {
      this.isRegistered = false
      this.$router.push('register')
      // console.log('go to reg')
    },
    gotoLogin () {
      this.isRegistered = true
      this.$router.push('login')
      // console.log('go to login')
    },
    // 提交表单
    submitForm () {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          // 登录
          if (this.isRegistered) {
            this.$http.post('login', this.loginForm).then((res, err) => {
              if (!err) {
                // console.log(res.data)
                if (res.data[1] === true) {
                  this.$message({
                    message: '登录成功',
                    type: 'success',
                    duration: '2000'
                  })
                  // 登录后将用户信息存入localStorage
                  this.$store.commit('setuserInfo', res.data[0])
                  const that = this
                  setTimeout(function () {
                    that.$router.push({ path: that.redirect || '/' })
                  }, 1000)
                  this.loading = false
                } else {
                  this.$message({
                    message: '请输入正确的用户名和密码',
                    type: 'error',
                    duration: '2000'
                  })
                  this.loading = false
                }
              } else {
                console.log(err)
              }
            })
          } else {
            // 注册
            this.$http.post('register', this.loginForm).then((res, err) => {
              if (!err) {
                if (res.data === true) {
                  this.$message({
                    message: '注册成功',
                    type: 'success',
                    duration: '2000'
                  })
                  this.isRegistered = true
                  const that = this
                  setTimeout(function () {
                    that.$router.push('login')
                  }, 1000)
                  this.loading = false
                } else {
                  this.$message({
                    message: '该用户名已被占用',
                    type: 'error',
                    duration: '2000'
                  })
                  this.loading = false
                }
              } else {
                console.log(err)
              }
            })
          }
        } else {
          this.loading = false
          return false
        }
      })
    },
    resetForm () {
      this.$refs.loginForm.resetFields()
    }
  }
}
</script>

<style lang="less">
/* cover element-ui css */
.login-container {
  .el-input {
    display: inline-block;

    input {
      background: transparent;
      border: 1px solid #ccc;
      border-radius: 3px;
      padding: 12px 5px 12px 5px;
      color: #000;
    }
  }

  .el-form-item {
    background: rgba(238, 238, 238, 0.1);
    border-radius: 5px;
  }
}
</style>

<style lang="less" scoped>
@bg: #20495a;
@login-bg: #fff;
.login-container {
  height: 100%;
  background: @bg;
  .login-box {
    background-color: @login-bg;
    position: absolute;
    overflow: hidden;
    border-radius: 10px;
    width: 450px;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    padding: 20px;
    .title-container {
      position: relative;
      .title,
      .title2 {
        font-size: 25px;
        color: #3a5361;
        margin: 0 auto 20px auto;
        text-align: center;
      }
    }
    .show-pwd {
      position: absolute;
      right: 10px;
      top: 7px;
      font-size: 16px;
      color: black;
      cursor: pointer;
      user-select: none;
    }
    .login-button {
      text-align: center;
      display: flex;
      align-items: flex-end;
      justify-content: flex-end;
      .el-button {
        margin: 0 15px 0 20px;
      }
    }
  }
}
</style>
