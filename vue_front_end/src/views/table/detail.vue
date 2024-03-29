<template>
  <el-container
    class="article-detail"
    direction="vertical"
    :v-model="articleDetail"
    name="article-detail"
  >
    <h2 prop="title" class="title-typing">
      {{ articleDetail.title }}
    </h2>
    <el-container class="article-info" direction="vertical">
      <router-link
        prop="author"
        :to="{
          path: '/user/visitor',
          query: { author: articleDetail.author }
        }"
        >{{ articleDetail.author }}</router-link
      >
      <div class="time-info">
        <span>发布于 {{ articleDetail.publish_time }}</span>
        &nbsp;
        <span>最后更新于 {{ articleDetail.update_time }}</span>
        &nbsp;
        <el-button @click="downloadMD" type="text" size="mini"
          >下载本文的markdown文件</el-button
        >
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
    <!--
    <el-container class="content-detail  fade-in" prop="content" name="content">
      <pre>{{ articleDetail.content }}</pre>
    </el-container> -->

    <mavon-editor
      class="content-detail  fade-in"
      prop="content"
      name="content"
      :toolbarsFlag="false"
      :subfield="false"
      defaultOpen="preview"
      v-model="articleDetail.content"
    >
    </mavon-editor>

    <el-container class="action" name="action">
      <el-button
        icon="iconfont icon-ar-thumb-up"
        circle
        @click="thumbupChange"
        :class="thumbup_status === 1 ? 'thumbup-yes' : 'thumbup'"
      ></el-button>
      <el-button
        icon="iconfont icon-ar-collection"
        circle
        @click="collectionSet"
        :class="favorite_status === 1 ? 'favorite-yes' : 'favorite'"
      ></el-button>
    </el-container>
    <el-container>
      <el-button class="goback" size="small" @click="handleBack"
        >返回列表</el-button
      >
      <el-button class="goback" size="small" @click="handleCollection"
        >我的收藏</el-button
      >
    </el-container>
    <Comment :data-list="dataList" class="fade-in"></Comment>

    <collection
      :showDialog.sync="showDialog"
      :userInfo="userInfo"
      @close="showDialog = false"
      @changeFavorStatus="changeFavorStatus"
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
  watch: {
    favorite_status: {
      handler (newVal) {
        this.favorite_status = newVal
      },
      immediate: true
    }
  },
  methods: {
    handleBack () {
      this.$router.push('/table/index')
    },
    handleCollection () {
      this.$router.push('/user/collection')
    },
    fetchArticle () {
      const articleID = this.$route.query.id
      this.$http
        .get(`articleDetail?aid=${articleID}`)
        .then((res, err) => {
          if (!err) {
            this.articleDetail = res.data
            this.articleDetail.publish_time = dateFormat(res.data.publish_time)
            this.articleDetail.update_time = dateFormat(res.data.update_time)
          } else {
            console.log(err)
          }
        })
        .catch(e => {
          console.log(e)
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
        .catch(e => {
          console.log(e)
        })
      // 收藏状态
      this.$http
        .get(`favoriteStatus?userID=${userID}&articleID=${articleID}`)
        .then((res, err) => {
          if (!err) {
            if (res.data.length > 0) {
              this.favorite_status = 1
            } else {
              this.favorite_status = 0
            }
          } else {
            console.log(err)
          }
        })
        .catch(e => {
          console.log(e)
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
        .catch(e => {
          console.log(e)
        })
    },
    collectionSet () {
      this.showDialog = !this.showDialog
    },
    changeFavorStatus (status) {
      this.favorite_status = status === true ? 1 : 0
    },
    fileDownload (content, name = '下载文件', suffix = 'md') {
      // 添加字节序标识，避免乱码
      const data = `\uFEFF${content}`
      const blob = new Blob([data], { type: 'text/markdown,charset=UTF-8' })
      // 创建链接，设置download和href属性，即可下载
      const downloadElement = document.createElement('a')
      const href = window.URL.createObjectURL(blob)
      downloadElement.href = href
      downloadElement.download = `${name}.${suffix}`
      document.body.appendChild(downloadElement)
      downloadElement.click()
      document.body.removeChild(downloadElement)
      window.URL.revokeObjectURL(href)
    },
    downloadMD () {
      const downloadContent = `# ${this.articleDetail.title}\n作者：${this.articleDetail.author}\n> 未经作者许可不得擅自使用 \n来源: ${window.location.href}\n \n ${this.articleDetail.content}\n`
      this.fileDownload(
        downloadContent,
        this.articleDetail.title.concat(`-${this.articleDetail.author}`)
      )
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
  width: 80%;
  padding: 20px;
  margin: 10px 20px;
  cursor: text;
  background-color: #fff;
  box-shadow: 0 0 30px rgba(202, 196, 196, 0.5);
  align-content: center;
}
.action {
  display: flex;
  margin: 15px;
  padding: 0 25px;
}
.favorite,
.thumbup {
  box-shadow: 2px 2px 1px #aaa;
}
.thumbup-yes,
.favorite-yes {
  color: #4977c7;
  background-color: #d8eeee;
  box-shadow: 1px 1px 1px #aaa;
}
.article-info {
  align-items: center;
  .time-info {
    font-size: 0.8rem;
    padding: 10px;
    color: @time-color;
  }
}
.tagName {
  font-size: 0.8rem;
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
