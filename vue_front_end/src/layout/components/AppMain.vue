<template>
  <el-main class="app-main">
    <router-view :key="key" />
  </el-main>
</template>

<script>
export default {
  name: 'AppMain',
  computed: {
    key () {
      return this.$route.path
    }
  }
}
</script>
