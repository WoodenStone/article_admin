<template>
  <el-container direction="vertical">
    <el-page-header @back="goBack"> </el-page-header>
    <article-list
      :showAuthor="false"
      :showContent="true"
      :showHeader="false"
      :personal="false"
      :collection="true"
      :articleLists="favorArticles"
      v-if="favorArticles.length > 0"
    ></article-list>
  </el-container>
</template>

<script>
import { dateFormat } from '@/utils/dateFormat.js'
import ArticleList from '@/components/ArticleList'
export default {
  components: { ArticleList },
  data () {
    return {
      favorArticles: []
    }
  },
  created () {
    this.getFavoriteArticles()
  },
  methods: {
    goBack () {
      this.$router.push('/user/collection')
    },
    getFavoriteArticles () {
      const cid = this.$route.query.cid
      const uid = JSON.parse(window.localStorage.getItem('user')).user_id
      this.$http
        .get(`favoriteArticle?cid=${cid}&uid=${uid}`)
        .then(res => {
          for (const d of res.data) {
            const publishTime = dateFormat(d.publish_time)
            const updateTime = dateFormat(d.update_time)
            if (d.content.length > 30) {
              d.content = d.content.slice(0, 30).concat('......')
            }
            this.favorArticles.push({ ...d, publishTime, updateTime })
          }
          this.favorArticles.reverse()
        })
        .catch(e => {
          console.log(e)
        })
    }
  }
}
</script>
