<template>
  <article-modify :is-edit="true"></article-modify>
</template>

<script>
import ArticleModify from './components/ArticleModify.vue'
export default {
  name: 'Edit',
  components: { ArticleModify }
}
</script>
