<template>
  <user-info :isMyself="false"></user-info>
</template>

<script>
import UserInfo from './components/UserInfo.vue'
export default {
  name: 'Visitor',
  components: { UserInfo }
}
</script>
