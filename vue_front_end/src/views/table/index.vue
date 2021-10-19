<template>
  <article-list
    :showAuthor="true"
    :showContent="true"
    :showHeader="true"
    :personal="false"
    :userPermission="user_pms"
    :articleLists="articles"
    v-if="articles.length > 0"
  ></article-list>
</template>

<script>
import ArticleList from '@/components/ArticleList'
import { dateFormat } from '@/utils/dateFormat.js'
export default {
  components: { ArticleList },
  created () {
    this.getAllArticle()
  },
  data () {
    return {
      user_pms: JSON.parse(window.localStorage.getItem('user')).user_permission,
      articles: []
    }
  },
  methods: {
    getAllArticle () {
      // 不先置空文章数量会增加
      this.articles = []
      this.$http.get('Article').then(res => {
        // console.log(res.data)
        for (const d of res.data) {
          const publishTime = dateFormat(d.publish_time)
          const updateTime = dateFormat(d.update_time)
          if (d.content.length > 30) {
            d.content = d.content.slice(0, 30).concat('......')
          }
          this.articles.push({ ...d, publishTime, updateTime })
        }
        // console.log(this.articles, '文章')
      })
    }
  }
}
</script>
