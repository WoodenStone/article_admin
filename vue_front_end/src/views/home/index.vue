<template>
  <div class="home-container">
    <el-empty description="首页开发中" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'Home',
  computed: {
    ...mapGetters(['name'])
  }
}
</script>
