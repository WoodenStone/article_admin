<template>
  <el-container
    class="article-detail"
    direction="vertical"
    :v-model="articleDetail"
    name="article-detail"
  >
    <h2 prop="title">
      {{ articleDetail.title }}
    </h2>
    <el-container class="article-info" direction="vertical">
      <div prop="author">{{ articleDetail.author }}</div>
      <div class="time-info">
        <span>发布于 {{ articleDetail.publish_time }}</span>
        &nbsp;
        <span>最后更新于 {{ articleDetail.update_time }}</span>
      </div>
      <div class="tags">
        <span
          v-for="(item, index) in articleDetail.tagName"
          :key="index"
          class="tagName"
        >
          {{ item }}
        </span>
      </div>
    </el-container>
    <el-container class="content-detail" prop="content" name="content">
      <pre>{{ articleDetail.content }}</pre>
    </el-container>

    <el-container class="action" name="action">
      <el-button
        icon="el-icon-caret-top"
        circle
        @click="thumbupChange"
        :class="thumbup_status === 1 ? 'thumbup-yes' : ''"
      ></el-button>
      <el-button
        icon="el-icon-star-off"
        circle
        @click="collectionSet"
        :class="favorite_status === 1 ? 'favorite-yes' : ''"
      ></el-button>
    </el-container>
    <el-container>
      <el-button class="goback" size="small" @click="handleBack"
        >返回列表</el-button
      >
      <el-button class="goback" size="small" @click="handleBack"
        >我的收藏</el-button
      >
    </el-container>
    <Comment :data-list="dataList"></Comment>

    <collection
      :showDialog.sync="showDialog"
      :userInfo="userInfo"
      @close="showDialog = false"
      v-if="Object.keys(userInfo).length > 0"
    >
    </collection>
  </el-container>
</template>

<script>
import Comment from '@/components/Comment'
import Collection from '@/components/Collection'
import { dateFormat } from '@/utils/dateFormat.js'
export default {
  components: { Comment, Collection },
  data () {
    return {
      userID: JSON.parse(window.localStorage.getItem('user')).user_id,
      articleID: this.$route.query.id,
      thumbup_status: '',
      favorite_status: '',
      articleDetail: {},
      dataList: [],
      showDialog: false,
      userInfo: {
        uid: JSON.parse(window.localStorage.getItem('user')).user_id,
        aid: parseInt(this.$route.query.id)
      }
    }
  },
  created () {
    // 获取文章信息
    this.fetchArticle()
    // 获取用户操作信息
    this.fetchStatus()
    this.getComments()
  },
  methods: {
    handleBack () {
      this.$router.push('/table/index')
    },
    fetchArticle () {
      const articleID = this.$route.query.id
      this.$http.get(`articleDetail?aid=${articleID}`).then((res, err) => {
        if (!err) {
          this.articleDetail = res.data
          this.articleDetail.publish_time = dateFormat(res.data.publish_time)
          this.articleDetail.update_time = dateFormat(res.data.update_time)
        } else {
          console.log(err)
        }
      })
    },
    // 获取用户对某篇文章的操作状态
    fetchStatus () {
      const userID = JSON.parse(window.localStorage.getItem('user')).user_id
      const articleID = this.$route.query.id
      // 点赞状态
      this.$http
        .get(`thumbupStatus?userID=${userID}&articleID=${articleID}`)
        .then((res, err) => {
          if (res.data.length > 0) {
            this.thumbup_status = res.data[0].thumbup_status
          } else {
            this.thumbup_status = 0
          }
        })
      // 收藏状态
      this.$http
        .get(`favoriteStatus?userID=${userID}&articleID=${articleID}`)
        .then((res, err) => {
          if (res.data.length > 0) {
            this.favorite_status = res.data[0].favorite_status
          } else {
            this.favorite_status = 0
          }
        })
    },
    // 变更点赞状态
    thumbupChange () {
      const value = {
        userID: this.userID,
        articleID: this.articleID,
        thumbupStatus: this.thumbup_status
      }
      this.$http.post('thumbupStatus', value).then((res, err) => {
        if (!err) {
          if (res.status === 200) {
            this.thumbup_status = this.thumbup_status === 1 ? 0 : 1
          } else {
            this.$message({
              message: '操作失败，请稍后再试',
              type: 'warning',
              duration: '2000'
            })
          }
        } else {
          console.log(err)
        }
      })
    },
    // 变更收藏状态
    favoriteChange () {
      const value = {
        userID: this.userID,
        articleID: this.articleID,
        favoriteStatus: this.favorite_status
      }
      this.$http.post('favoriteStatus', value).then((res, err) => {
        if (!err) {
          if (res.status === 200) {
            this.favorite_status = this.favorite_status === 1 ? 0 : 1
            if (this.favorite_status === 1) {
              this.$message({
                type: 'success',
                message: '已添加至默认收藏夹',
                duration: 1000
              })
            }
          } else {
            this.$message({
              message: '操作失败，请稍后再试',
              type: 'warning',
              duration: '2000'
            })
          }
        } else {
          console.log(err)
        }
      })
    },
    getComments () {
      this.$http
        .get(`commentsOfOneArticle/${this.articleID}`)
        .then((res, err) => {
          if (!err) {
            if (res.data === '') {
              this.dataList = []
            } else {
              this.dataList = res.data
            }
          } else {
            console.log(err)
          }
        })
    },
    collectionSet () {
      this.showDialog = !this.showDialog
    }
  }
}
</script>

<style lang="less" scoped>
@status-color: rgba(80, 158, 253, 0.5);
@time-color: hsla(0, 22%, 8%, 0.637);
.article-detail {
  display: flex;
  align-items: center;
}
.author-detail {
  margin: 15px 0;
}
.content-detail {
  width: 100%;
  padding: 20px;
  margin: 10px 0;
  cursor: text;
  background-color: #fff;
  box-shadow: 0 0 30px rgba(202, 196, 196, 0.5);
}
.action {
  display: flex;
  margin: 15px;
  padding: 0 25px;
}
.thumbup-yes,
.favorite-yes {
  background-color: @status-color;
}
.article-info {
  align-items: center;
  .time-info {
    font-size: 8px;
    padding: 10px;
    color: @time-color;
  }
}
.tagName {
  font-size: 8px;
  margin: 0 3px;
  padding: 3px;
  border-radius: 5px;
  cursor: default;
  color: #000;
  background: rgba(80, 158, 253, 0.3);
  &:after {
    content: '';
  }
}
pre {
  white-space: pre-wrap;
  white-space: -pre-wrap; /* Opera 4-6 */
  white-space: -moz-pre-wrap;
  white-space: -o-pre-wrap;
  word-wrap: break-word;
}
</style>
