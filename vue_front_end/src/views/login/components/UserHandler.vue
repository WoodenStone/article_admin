<template>
  <div class="login-container">
    <div class="welcome-box">
      <h1>Welcome!</h1>
      <div class="welcome-note">
        <span>✨发现新点子</span>
        <span>🍻与同好交流</span>
        <span>🎉就是现在！开启创作之旅🎉</span>
      </div>
    </div>
    <div class="login-box">
      <el-form
        ref="loginForm"
        :model="loginForm"
        status-icon
        :rules="rules"
        label-width="100px"
        class="login-form"
      >
        <div class="title-container">
          <h2 class="title" v-if="this.isRegistered">Sign In</h2>
          <h2 class="title2" v-if="!this.isRegistered">
            Sign Up
          </h2>
        </div>
        <el-form-item prop="username">
          <el-input
            prefix-icon="iconfont icon-ar-custom-user"
            ref="username"
            v-model="loginForm.username"
            autocomplete="off"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            prefix-icon="iconfont icon-ar-passwordcopy"
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
          <div class="reg-or-log">
            <el-button
              type="text"
              @click="gotoRegister"
              size="mini"
              v-if="this.isRegistered"
              >Register NOW!</el-button
            >
            <el-button
              type="text"
              @click="gotoLogin"
              size="mini"
              v-if="!this.isRegistered"
              >Login NOW!</el-button
            >
          </div>
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
    const validatePass = (rule, value, callback) => {
      const pattern = /^(\w){6,18}$/
      if (value.match(pattern)) {
        callback()
      } else {
        callback(new Error('密码只能包含字母、数字和下划线'))
      }
    }
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
          },
          {
            validator: validatePass,
            trigger: 'blur',
            message: '密码只能包含字母、数字和下划线'
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
    },
    gotoLogin () {
      this.isRegistered = true
      this.$router.push('login')
    },
    // 提交表单
    submitForm () {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          // 登录
          if (this.isRegistered) {
            this.$store
              .dispatch('token/login', this.loginForm)
              .then(res => {
                this.$store.commit('setuserInfo', res)
              })
              .then(() => {
                // console.log(this.redirect)
                this.$router.push({ path: this.redirect || '/' })
                this.loading = false
              })
              .catch(error => {
                this.loading = false
                console.log(error)
              })
          } else {
            // 注册
            this.$http
              .post('Register', this.loginForm)
              .then((res, err) => {
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
              .catch(e => {
                console.log(e)
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

<style lang="less" scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;

  background: #134e5e; /* fallback for old browsers */
  background: -webkit-linear-gradient(
    to right,
    #71b280,
    #134e5e
  ); /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(
    to right,
    #71b280,
    #134e5e
  ); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
}
.welcome-box {
  cursor: default;
  width: 300px;
  height: 350px;
  background: hsla(214, 73%, 82%, 0.314);
  border-radius: 10px 0 0 10px;
  position: relative;
  display: flex;
  align-items: center;
  flex-direction: column;
  h1 {
    font-size: 40px;
    margin: 60px 0 0 20px;
    color: rgba(255, 255, 255, 0.952);
    text-shadow: 0px 2px 2px #6b6a6a;
  }
  .welcome-note {
    display: flex;
    flex-direction: column;
    align-items: center;
    span {
      margin-top: 20px;
      color: rgba(255, 255, 255, 0.863);
      text-shadow: 0px 2px 2px #759177;
    }
  }
}
.login-box {
  display: flex;
  justify-content: center;
  background: #fff;
  width: 350px;
  height: 350px;
  border-radius: 0 10px 10px 0;
}
.title-container {
  margin: 40px 100px;
}
.login-form {
  padding: 0;
  width: 300px;
  /deep/ .el-form-item__content {
    margin-left: 10px !important;
  }
  /deep/ .el-input__inner {
    border: 0;
    border-bottom: 1.5px solid rgba(154, 173, 183, 0.5);
    &:focus {
      border-bottom: 1.5px solid rgba(154, 173, 183, 0.8);
    }
  }
}
.login-button {
  margin: 30px 60px;
}
.reg-or-log {
  margin: 15px 70px;
  float: right;
}
</style>
