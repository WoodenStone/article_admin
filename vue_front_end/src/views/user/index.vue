<template>
  <user-info :isMyself="true"></user-info>
</template>

<script>
import UserInfo from './components/UserInfo.vue'
export default {
  name: 'Self',
  components: { UserInfo }
}
</script>
