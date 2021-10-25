<!--
 * @author: WoodenStone
 * @lastEditors: WoodenStone
 * @Date: 2021-10-16 13:26:08
 * @LastEditTime: 2021-10-20 16:07:41
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
        .catch(e => {
          console.log(e)
        })
    }
  }
}
</script>
