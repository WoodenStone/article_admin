<template>
  <el-header class="navbar">
    <bread-crumb></bread-crumb>
    <div class="user-info">
      <el-avatar v-if="avatarUrl" :src="avatarUrl" class="avatar" fit="fill" />
      <el-avatar v-else icon="el-icon-user" :size="35" />
    </div>
    <router-link to="/user/index" class="username">{{
      this.username
    }}</router-link>
    <el-dropdown>
      <el-button type="text" style="color:#121">
        <i class="el-icon-arrow-down el-icon--right" />
      </el-button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item>
          <router-link to="/user/index" style="text-decoration:none">
            <el-dropdown-item>
              主页
            </el-dropdown-item>
          </router-link></el-dropdown-item
        >
        <a
          target="_blank"
          href="https://github.com/WoodenStone/article_admin"
          style="text-decoration:none; text-align:center"
        >
          <el-dropdown-item>Github</el-dropdown-item>
        </a>
        <el-dropdown-item @click.native="logout">
          <span style="display:block; text-align:center">退出</span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </el-header>
</template>

<script>
import getUserAvatarById from '@/utils/user.js'
import BreadCrumb from '@/components/BreadCrumb'
export default {
  components: { BreadCrumb },
  data () {
    return {
      username: '',
      avatarUrl: '',
      userID: ''
    }
  },
  created () {
    this.fetchInfo()
  },
  methods: {
    logout () {
      this.$store.commit('setuserInfo', '')
      this.$store.dispatch('token/logout')
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    },
    async fetchInfo () {
      // 从localstorage中取数据需要从JSON格式转换
      this.username = await JSON.parse(window.localStorage.getItem('user'))
        .user_name
      this.userID = await JSON.parse(window.localStorage.getItem('user'))
        .user_id
      await getUserAvatarById(this, this.userID).then(
        data => (this.avatarUrl = data)
      )
    }
  }
}
</script>

<style lang="less" scoped>
.navbar {
  box-sizing: border-box;
  height: 45px;
  background-color: #fff;
  box-shadow: 0 0 30px rgba(202, 196, 196, 0.87);
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin: 10px;
  padding: 15px;
  .user-info {
    margin-left: auto;
  }
  .username {
    padding: 0 15px;
  }
  a,
  .router-link-active {
    text-decoration: none;
  }
}
</style>
