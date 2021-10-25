<template>
  <div class="error-container">
    <el-page-header class="header" @back="goHome"></el-page-header>
    <img class="error-img" src="@/assets/404error.png" alt="404" width="750" />
  </div>
</template>

<script>
export default {
  name: 'Page404',
  methods: {
    goHome () {
      this.$router.push('/')
    }
  }
}
</script>

<style lang="less" scoped>
.error-container {
  display: flex;
  flex-direction: row;
  align-content: center;
  justify-content: center;
  /deep/ .el-page-header__title {
    display: none;
  }
  /deep/ .el-icon-back {
    font-size: 30px;
  }
  /deep/ .el-page-header__left::after {
    display: none;
  }
  .header {
    margin: 30px 0 30px 30px;
  }
}
</style>
