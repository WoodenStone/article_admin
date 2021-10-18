<template>
  <user-handler :registered="false"></user-handler>
</template>

<script>
import UserHandler from './components/UserHandler.vue'
export default {
  name: 'Register',
  components: { UserHandler }
}
</script>
