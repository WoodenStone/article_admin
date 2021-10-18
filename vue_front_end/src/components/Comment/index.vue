<template>
  <div class="comment-container">
    <comment-group :dataList="dataList"></comment-group>
  </div>
</template>
<script>
import CommentGroup from './CommentGroup.vue'
export default {
  name: 'Comment',
  components: {
    CommentGroup
  },

  props: {
    dataList: {
      type: Array,
      default: () => []
    }
  }
}
</script>
