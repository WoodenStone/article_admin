<template>
  <el-container class="user-admin fade-in">
    <el-container class="user-info" direction="vertical">
      <div class="user-avatar">
        <el-avatar
          v-if="avatarUrl"
          shape="square"
          :size="220"
          :src="avatarUrl"
        ></el-avatar>
        <el-avatar
          v-else
          :size="220"
          shape="square"
          icon="el-icon-user"
        ></el-avatar>
      </div>
      <h3 class="username">{{ this.username }}</h3>
      <div class="follow-button">
        <el-button
          type="primary"
          size="small"
          plain
          v-if="isVisitor && !isFollowed"
          @click="changeFollowStatus"
          >关注</el-button
        >
        <el-button
          size="small"
          v-if="isVisitor && isFollowed"
          @click="changeFollowStatus"
          plain
          >已关注</el-button
        >
      </div>
      <el-row class="relationship" :gutter="10" type="flex">
        <el-col :span="10">
          <el-card shadow="hover">
            <div slot="header">
              <span>被关注</span>
            </div>
            {{ this.followers }}
          </el-card>
        </el-col>
        <el-col :span="10">
          <el-card shadow="hover"
            ><div slot="header">
              <span>关注了</span>
            </div>
            {{ this.following }}</el-card
          >
        </el-col>
      </el-row>
      <div class="user-change-info" v-if="!this.isVisitor">
        <el-button type="text" size="mini" @click="userinfoChange"
          >修改个人信息</el-button
        >
      </div>
    </el-container>

    <div class="tabs">
      <el-tabs :tab-position="tabPosition" class="admin">
        <el-tab-pane label="我的文章" v-if="!isVisitor">
          <article-list
            :showAuthor="false"
            :showContent="false"
            :showHeader="false"
            :personal="true"
            :personalID="this.personalID"
            :articleLists="this.articles"
            v-if="articles.length > 0"
          ></article-list>
        </el-tab-pane>
        <el-tab-pane label="TA的文章" v-if="isVisitor">
          <article-list
            :showAuthor="false"
            :showContent="false"
            :showHeader="false"
            :personal="false"
            :articleLists="this.articlesV"
            v-if="articlesV.length > 0"
          ></article-list>
        </el-tab-pane>

        <el-tab-pane label="关注我的" v-if="!isVisitor">
          <el-table :data="followersTable" border style="width: 100%">
            <el-table-column prop="user_name" label="用户名"> </el-table-column>
            <el-table-column prop="userindex" label="TA的主页">
              <template slot-scope="scope">
                <router-link
                  style="text-decoration:none"
                  :to="{
                    path: '/user/visitor',
                    query: { author: scope.row.user_name }
                  }"
                  >点击查看✌</router-link
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="我关注的" v-if="!isVisitor">
          <el-table :data="followingTable" border style="width: 100%">
            <el-table-column prop="user_name" label="用户名"> </el-table-column>
            <el-table-column prop="userindex" label="TA的主页">
              <template slot-scope="scope">
                <router-link
                  style="text-decoration:none"
                  :to="{
                    path: '/user/visitor',
                    query: { author: scope.row.user_name }
                  }"
                  >点击查看✌</router-link
                >
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="100">
              <template slot-scope="scope">
                <el-button
                  @click="changeFollowStatus(scope.row.user_id, true)"
                  type="text"
                  size="small"
                  >取关</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="评论与回复" v-if="!isVisitor">
          <el-empty
            v-if="!commentList.length"
            description="您还没有收到评论或回复噢"
          ></el-empty>
          <ul class="comment-pane">
            <li
              v-for="(item, index) in commentList"
              :key="index"
              style="list-style: none"
              class="comment-item"
            >
              <el-container>
                <router-link
                  style="text-decoration:none"
                  :to="{
                    path: '/user/visitor',
                    query: { author: item.publisher_name }
                  }"
                  >{{ item.publisher_name }}</router-link
                >
                &nbsp;在 &nbsp;
                <router-link
                  style="text-decoration:none"
                  :to="{
                    path: '/table/detail',
                    query: { id: item.article_commented_id, isEdit: false }
                  }"
                  >{{ item.title }}</router-link
                >
                &nbsp;中
                <div v-if="!item.is_reply">评论</div>
                <div v-if="item.is_reply">回复</div>
                ：
              </el-container>
              <el-container class="comment-content">{{
                item.content
              }}</el-container>
            </li>
          </ul>
        </el-tab-pane>
      </el-tabs>
    </div>
  </el-container>
</template>

<script>
import { dateFormat } from '@/utils/dateFormat.js'
import ArticleList from '@/components/ArticleList'
export default {
  name: 'UserInfo',
  components: { ArticleList },
  props: {
    isMyself: {
      type: Boolean,
      default: false
    }
  },
  inject: ['reload'],
  data () {
    return {
      temp: '',
      isVisitor: !this.isMyself,
      isFollowed: '',
      username: '',
      userID: '',
      personalID: JSON.parse(window.localStorage.getItem('user')).user_id,
      avatarUrl: '',
      followers: '',
      following: '',
      tabPosition: 'top',
      followersTable: [
        {
          user_name: '',
          userindex: ''
        }
      ],
      followingTable: [
        {
          user_name: '',
          userindex: ''
        }
      ],
      articleList: [],
      commentList: [],
      articles: [],
      articlesV: []
    }
  },
  created () {
    this.judgeVisitor()
    this.getIdentity()
    this.getUserIdByName()
    this.getRelationStatus()
    this.getFollowersTable()
    this.getFollowingTable()
    this.getCommentsByUser()
    this.getPersonalArticle()
  },
  methods: {
    userinfoChange () {
      this.$router.push('change')
    },
    // 判断是否为访客
    judgeVisitor () {
      // 用获取key为数组的方法判断是否为一个空对象
      const visitorName = Object.keys(this.$route.query)
      const userName = JSON.parse(window.localStorage.getItem('user')).user_name
      if (visitorName.length === 0 || this.$route.query.author === userName) {
        this.isVisitor = false
      } else {
        this.isVisitor = true
      }
    },
    // 由用户名获取用户信息
    getIdentity () {
      // 不是访客
      if (this.isMyself) {
        this.username = JSON.parse(
          window.localStorage.getItem('user')
        ).user_name
        this.userID = JSON.parse(window.localStorage.getItem('user')).user_id
        this.getAvatar()
      } else {
        //   是访客
        this.username = this.$route.query.author
        this.getAvatarByName()
        this.getUserIdByName()
        this.getVisitorArticle()
      }
    },
    // 由ID获取头像
    getAvatar () {
      this.$http
        .get(`getAvatar/${this.userID}`, { responseType: 'blob' })
        .then((res, err) => {
          if (!err) {
            this.avatarUrl = URL.createObjectURL(res.data)
          } else {
            console.log(err)
          }
        })
    },
    // 由用户名获取头像
    getAvatarByName () {
      this.$http
        .get(`getAvatarByName/${this.username}`, { responseType: 'blob' })
        .then((res, err) => {
          if (!err) {
            this.avatarUrl = URL.createObjectURL(res.data)
          } else {
            console.log(err)
          }
        })
    },
    // 由用户名获取ID
    getUserIdByName () {
      const self = this
      return this.$http.get(`getIdByName/${this.username}`).then((res, err) => {
        if (!err) {
          self.userID = res.data.user_id
        } else {
          console.log(err)
        }
      })
    },
    // 获取关注状态
    /*  一定要加async和await，否则this.userID是undefined */
    async getRelationStatus () {
      await this.getUserIdByName()
      await this.$http
        .get('getRelationStatusOne', {
          params: {
            uidFrom: JSON.parse(window.localStorage.getItem('user')).user_id,
            uidTo: this.userID
          }
        })
        .then((res, err) => {
          if (!err) {
            const result = Object.keys(res.data)
            if (result.length > 0) {
              if (res.data.status === 1) {
                this.isFollowed = true
              }
            }
          } else {
            console.log(err)
          }
        })
      await this.getFollowers()
      await this.getFollowing()
    },
    // 关注或取关
    changeFollowStatus (id, statusSet) {
      const myID = JSON.parse(window.localStorage.getItem('user')).user_id
      this.$http
        .get('followStatusChange', {
          params: {
            uidFrom: myID,
            uidTo: this.userID === myID ? id : this.userID,
            status: this.userID === myID ? statusSet : this.isFollowed
          }
        })
        .then((res, err) => {
          if (!err) {
            // console.log(res)
            if (res.status === 200) {
              this.isFollowed = !this.isFollowed
              this.getFollowers()
              this.getFollowing()
              if (this.userID === myID) {
                this.update()
              }
            }
          } else {
            console.log(err)
          }
        })
    },
    // 获取被关注数
    getFollowers () {
      return this.$http
        .get(`getFollowerNumber/${this.userID}`)
        .then((res, err) => {
          if (!err) {
            this.followers = res.data.cnt
          } else {
            console.log(err)
          }
        })
    },
    // 获取关注数
    getFollowing () {
      return this.$http
        .get(`getFollowingNumber/${this.userID}`)
        .then((res, err) => {
          if (!err) {
            this.following = res.data.cnt
          } else {
            console.log(err)
          }
        })
    },
    // 获取关注者名单
    getFollowersTable () {
      // await this.getUserIdByName()
      const myID = JSON.parse(window.localStorage.getItem('user')).user_id
      this.$http.get(`FollowersList/?userID=${myID}`).then((res, err) => {
        if (!err) {
          // console.log(res.data)
          this.followersTable = res.data
        } else {
          console.log(err)
        }
      })
    },
    // 获取我关注的名单
    getFollowingTable () {
      this.getUserIdByName()
      const myID = JSON.parse(window.localStorage.getItem('user')).user_id
      this.$http.get(`FollowingList/?userID=${myID}`).then((res, err) => {
        if (!err) {
          // console.log(res.data)
          this.followingTable = res.data
        } else {
          console.log(err)
        }
      })
    },
    // 获取某用户收到的所有评论和回复
    getCommentsByUser () {
      const uid = this.personalID
      this.$http.get(`CommentsReceived/?userID=${uid}`).then((res, err) => {
        if (!err) {
          // console.log(res.data)
          this.commentList = res.data
        } else {
          console.log(err)
        }
      })
    },
    getPersonalArticle () {
      this.articles = []
      this.$http.get(`personalArticle?uid=${this.personalID}`).then(res => {
        for (const d of res.data) {
          const publishTime = dateFormat(d.publish_time)
          const updateTime = dateFormat(d.update_time)
          this.articles.push({ ...d, publishTime, updateTime })
        }
      })
    },
    async getVisitorArticle () {
      await this.getUserIdByName()
      this.articlesV = []
      console.log(this.userID)
      await this.$http.get(`personalArticle?uid=${this.userID}`).then(res => {
        for (const d of res.data) {
          const publishTime = dateFormat(d.publish_time)
          const updateTime = dateFormat(d.update_time)
          this.articlesV.push({ ...d, publishTime, updateTime })
        }
      })
    },
    update () {
      this.reload()
    }
  }
}
</script>

<style lang="less" scoped>
.user-avatar {
  display: flex;
  justify-content: center;
  height: 220px;
}
.username {
  align-self: center;
}
.follow-button {
  align-self: center;
  margin: 0 0 20px 0;
  /deep/ .el-button {
    width: 100px;
    border-radius: 10px;
  }
}
.relationship {
  justify-content: center;
  cursor: default;
  margin: 0;
  /deep/ .el-card {
    background-color: rgba(194, 189, 189, 0.1);
  }
  /deep/ .el-card__header {
    padding: 10px 0 10px 0;
    text-align: center;
  }
  /deep/ .el-card__body {
    padding: 0;
    text-align: center;
  }
}
.user-change-info {
  align-self: center;
  padding-top: 15px;
}
.comment-pane {
  cursor: default;
  a {
    font-style: bold;
  }
  .comment-item {
    border-bottom: 2px solid #e4e7ed;
    margin-bottom: 20px;
    box-shadow: 0px 10px 10px -15px #acaeb1;
    border-radius: 10px;
    padding: 10px 0;
  }
  .comment-content {
    padding: 15px 0 0 10px;
  }
}
.admin {
  display: flex;
  flex-direction: column;
  align-self: flex-start;
}
.tabs {
  width: calc(100vw - 345px);
}
</style>
