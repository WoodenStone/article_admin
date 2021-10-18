<template>
  <article-modify :is-edit="false"></article-modify>
</template>

<script>
import ArticleModify from './components/ArticleModify.vue'
export default {
  name: 'Create',
  components: { ArticleModify }
}
</script>
