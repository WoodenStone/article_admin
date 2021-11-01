<template>
  <div class="breadcrumb-container">
    <el-breadcrumb separator-class="iconfont icon-ar-ic_locate_line">
      <el-breadcrumb-item
        v-for="(item, index) in breadList"
        :key="index"
        :to="{ path: item.path }"
        >{{ item.name }}</el-breadcrumb-item
      >
    </el-breadcrumb>
  </div>
</template>

<script>
export default {
  name: 'BreadCrumb',
  data () {
    return {
      user_name: JSON.parse(window.localStorage.getItem('user')).user_name,
      breadList: []
    }
  },
  watch: {
    $route () {
      this.getBreadcrumb()
    }
  },
  methods: {
    isHome (route) {
      return route.name === 'home'
    },
    getBreadcrumb () {
      const matched = this.$route.matched
      if (
        matched[1].name === '访客界面' &&
        this.$route.query.author === this.user_name
      ) {
        this.$router.push('/user/index')
      }
      this.breadList = matched
    }
  },
  created () {
    this.getBreadcrumb()
  }
}
</script>
<style lang="less" scoped>
.breadcrumb-container {
  /deep/ el-breadcrumb {
    cursor: default;
  }
}
</style>
