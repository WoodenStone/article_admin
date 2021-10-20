<template>
  <el-container class="table" direction="vertical">
    <el-container class="operations" v-if="showHeader">
      <el-button size="small" type="primary" @click="addArticle"
        >新增一篇</el-button
      >
      <el-button size="small" @click="getAllArticle" class="button-update"
        >更新列表</el-button
      >
      <el-autocomplete
        :maxlength="15"
        v-model="articles.title"
        :fetch-suggestions="querySearchAsync"
        @select="handleSelect"
        :trigger-on-focus="false"
        suffix-icon="el-icon-search"
        placeholder="模糊查询"
      >
      </el-autocomplete>
    </el-container>

    <div class="article-list-wrapper  fade-in">
      <el-table :data="articleLists" style="width: 100%">
        <el-table-column prop="title" label="标题" width="180">
        </el-table-column>
        <el-table-column
          v-if="showAuthor"
          prop="author"
          label="作者"
          width="100"
        >
          <template slot-scope="scope">
            <router-link
              style="text-decoration:none"
              :to="{
                path: '/user/visitor',
                query: { author: scope.row.author }
              }"
              >{{ scope.row.author }}</router-link
            >
          </template>
        </el-table-column>
        <el-table-column prop="publishTime" label="发布时间"></el-table-column>
        <el-table-column prop="updateTime" label="最后更新"></el-table-column>
        <el-table-column prop="tagName" label="标签" class="tag">
          <template slot-scope="scope">
            <span
              v-for="(item, index) in scope.row.tagName"
              :key="index"
              class="tagName"
            >
              {{ item }}
            </span>
          </template>
        </el-table-column>
        <el-table-column v-if="showContent" prop="content" label="预览">
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="130">
          <template slot-scope="scope">
            <el-button @click="handleCheck(scope.row)" type="text" size="small"
              >查看</el-button
            >
            <el-button
              type="text"
              size="small"
              @click="handleEdit(scope.row)"
              v-if="personal || (!personal && scope.row.author_id === userID)"
              >编辑</el-button
            >
            <el-button
              type="text"
              size="small"
              @click="handleDelete(scope.row)"
              v-if="personal || (!personal && userPermission)"
              >删除</el-button
            >
            <el-button
              type="text"
              size="small"
              @click="collectionSet(scope.row)"
              v-if="collection"
              >移动到</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
    <collection
      :showDialog.sync="showDialog"
      :userInfo="userInfo"
      @close="showDialog = false"
      v-if="userInfo.aid > 0"
    >
    </collection>
  </el-container>
</template>

<script>
import { dateFormat } from '@/utils/dateFormat.js'
import Collection from '@/components/Collection'
export default {
  name: 'ArticleList',
  props: [
    'showAuthor',
    'showContent',
    'showHeader',
    'personal',
    'personalID',
    'userPermission',
    'articleLists',
    'collection'
  ],
  components: { Collection },
  data () {
    return {
      articles: [],
      isEdit: false,
      userID: '',
      showDialog: false,
      userInfo: {
        uid: JSON.parse(window.localStorage.getItem('user')).user_id,
        aid: 0
      }
    }
  },
  created () {
    if (!this.personal) {
      // this.getAllArticle()
      // console.log(this.articleLists[0], '列表')
      this.artilces = this.articleLists
    } else {
      this.getPersonalArticle()
    }
    this.userID = JSON.parse(window.localStorage.getItem('user')).user_id
    // console.log(this.articles)
  },
  methods: {
    // 查看文章
    handleCheck (row) {
      // console.log(row.id)
      this.$router.push({
        path: '/table/detail',
        query: { id: row.id, isEdit: false }
      })
    },
    // 编辑文章
    handleEdit (row) {
      this.$router.push({
        path: '/form/edit',
        query: { id: row.id, isEdit: true }
      })
    },
    // 删除文章
    handleDelete (row) {
      this.$confirm('确定要删除文章吗？', '提示', {
        confirmBottonText: '确定',
        cancelButtonText: '取消',
        center: true,
        type: 'warning'
      })
        .then(() => {
          this.$http
            .delete('deleteArticle', {
              data: { id: row.id }
            })
            .then((res, err) => {
              if (!err && res.data.affectedRows === 1) {
                this.$message({
                  type: 'success',
                  message: '删除成功!',
                  duration: '2000'
                })
                if (!this.personal) {
                  this.getAllArticle()
                } else {
                  this.getPersonalArticle()
                }
              } else {
                this.$message({
                  message: '删除失败',
                  type: 'warning',
                  duration: '2000'
                })
              }
            })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除',
            duration: '2000'
          })
        })
    },
    // 跳转至添加文章界面
    addArticle () {
      this.$router.push('/form/create')
    },
    // 更新文章列表
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
            // d.content
          }
          // d.tagName = d.tagName.join(' | ')
          this.articles.push({ ...d, publishTime, updateTime })
        }
        this.$message('已更新！')
      })
    },
    // 更新指定作者的文章列表
    async getPersonalArticle () {
      this.articles = []
      await this.$http
        .get(`personalArticle?uid=${this.personalID}`)
        .then(res => {
          for (const d of res.data) {
            const publishTime = dateFormat(d.publish_time)
            const updateTime = dateFormat(d.update_time)
            this.articles.push({ ...d, publishTime, updateTime })
          }
        })
    },
    // 关键字搜索，后端数据库模糊搜索
    querySearchAsync (query, callback) {
      let list = [{}]
      const value = { q: query }
      this.$http.post('search', value).then((res, err) => {
        if (!err) {
          if (res.data.length > 0) {
            for (const i of res.data) {
              i.value = i.title
            }
            list = res.data
          } else {
            list = [{ value: '暂无结果' }]
          }
          callback(list)
        } else {
          console.log('err', err)
        }
      })
    },
    // 选中条目可以跳转到详情页
    handleSelect (item) {
      //   console.log(item)
      if (item.id > 0) {
        this.$router.push({
          path: '/table/detail',
          query: { id: item.id, isEdit: false }
        })
      }
    },
    collectionSet (row) {
      this.userInfo.aid = row.id
      // console.log(this.userInfo.aid, 'aid')
      this.showDialog = !this.showDialog
    }
  }
}
</script>

<style lang="less" scoped>
.article-list-wrapper {
  transition: 0.5s;
}
/* 解决点击之后必须再次点击别处才能重置背景色的bug */
/*鼠标点击后移开，恢复本身样式*/
.button-update,
.button-update:focus:not(.button-update:hover) {
  margin-right: 12px;
  border: 1px solid #2794f8;
  border-radius: 2px;
  box-shadow: 0 2px 4px 0 #f4f4f4;
  color: #2794f8;
  background: white;
}
/*鼠标悬浮，没有按下；鼠标按下后抬起，没有移开*/
.button-update:focus,
.button-update:hover {
  background: #eaf5ff;
  border: 1px solid #2794f8 !important;
  color: #2794f8;
}
/*鼠标按下，没有抬起*/
.button-update:active {
  background: #2794f8;
  color: white;
}

.tagName {
  font-size: 8px;
  margin: 0 3px;
  padding: 3px;
  border-radius: 5px;
  cursor: default;
  color: #111;
  background: rgba(80, 158, 253, 0.3);
  &:after {
    content: '';
  }
}
.el-table {
  /deep/ tr {
    max-height: 100px !important;
  }
}
</style>
