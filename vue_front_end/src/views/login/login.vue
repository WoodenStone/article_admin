<template>
  <user-handler :registered="true"></user-handler>
</template>

<script>
import UserHandler from './components/UserHandler.vue'
export default {
  name: 'Login',
  components: { UserHandler }
}
</script>
