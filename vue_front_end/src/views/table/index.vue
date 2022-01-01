<!--
 * @author: WoodenStone
 * @lastEditors: WoodenStone
 * @Date: 2021-10-16 13:26:08
 * @LastEditTime: 2022-01-01 19:33:23
-->
<template>
  <article-list
    name="fade"
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
      this.$http
        .get('Article')
        .then(res => {
          for (const d of res.data) {
            const publishTime = dateFormat(d.publish_time)
            const updateTime = dateFormat(d.update_time)
            this.articles.push({ ...d, publishTime, updateTime })
          }
          this.articles.reverse()
        })
        .catch(e => {
          console.log(e)
        })
    }
  }
}
</script>
