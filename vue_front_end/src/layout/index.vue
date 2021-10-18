<template>
  <el-container class="app-wrapper">
    <sidebar class="sidebar-container" />
    <el-container direction="vertical">
      <navbar />
      <app-main />
    </el-container>
  </el-container>
</template>

<script>
import { AppMain, Sidebar, Navbar } from './components'

export default {
  name: 'Layout',
  components: {
    AppMain,
    Sidebar,
    Navbar
  }
}
</script>

<style lang="less" scoped>
.app-wrapper {
  height: 100%;
}
</style>
