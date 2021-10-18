<template>
  <el-container>
    <div class="message-container" style="width: 500px">
      <el-container class="comment-article">
        <i class="el-icon-edit"></i>
        <el-button
          type="text"
          @click="
            dialogFormVisible = true
            isReply = false
            setCommentData()
          "
          >说点什么吧……</el-button
        >
      </el-container>
      <ul>
        <li v-for="(item, index) in dataList" :key="index">
          <comment-item :data="{ item, index }"></comment-item>
          <el-container class="comment-operation">
            <el-button
              type="text"
              @click="
                isReply = true
                getCommentData(item, index)
                dialogFormVisible = true
              "
              >回复</el-button
            >
          </el-container>

          <ul>
            <li v-for="(data, idx) in item.children" :key="idx">
              <reply-item style="padding-left: 20px" :children="{ data, idx }">
              </reply-item>
              <el-container class="comment-operation">
                <el-button
                  type="text"
                  @click="
                    isReply = true
                    getCommentData(data, index)
                    dialogFormVisible = true
                  "
                  >回复</el-button
                >
              </el-container>
            </li>
          </ul>
        </li>
      </ul>
      <!-- dialog form -->
      <el-dialog
        title="请输入评论"
        :visible.sync="dialogFormVisible"
        v-dialogDrag
        @close="clearForm"
      >
        <el-form :model="comment" ref="comment">
          <el-container class="comment-info">
            <span v-show="isReply">
              回复 {{ this.comment.publisher_name }}</span
            >
          </el-container>
          <el-form-item>
            <el-input
              type="textarea"
              v-model="comment.content"
              auto-complete="off"
              :autosize="{ minRows: 4, maxRows: 8 }"
            ></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" size="small" @click="onSubmit"
            >发表</el-button
          >
        </div>
      </el-dialog>
    </div>
  </el-container>
</template>

<script>
import CommentItem from './CommentItem.vue'
import ReplyItem from './ReplyItem.vue'
export default {
  name: 'Comment',
  components: { CommentItem, ReplyItem },
  props: {
    dataList: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  inject: ['reload'],
  data () {
    return {
      dialogFormVisible: false,
      articleID: this.$route.query.id,
      isReply: '',
      comment: {
        publisher_id: JSON.parse(window.localStorage.getItem('user')).user_id,
        article_commented_id: this.articleID,
        content: '',
        recipient_id: '',
        is_reply: this.isReply,
        comment_index: '',
        publisher_name: ''
      }
    }
  },
  methods: {
    getCommentData (item, index) {
      // console.log(item.publisher_id)
      this.comment.recipient_id = item.publisher_id
      this.comment.is_reply = this.isReply
      this.comment.article_commented_id = parseInt(this.articleID)
      this.comment.comment_index = index
      this.comment.publisher_name = item.publisher_name
    },
    setCommentData () {
      this.comment.is_reply = false
      this.comment.article_commented_id = parseInt(this.articleID)
      this.comment.recipient_id = null
      this.comment.comment_index = this.dataList.length
    },
    onSubmit () {
      // console.log(this.comment)
      if (this.comment.content.length < 1) {
        this.$message.warning('请输入评论')
      } else {
        this.$http.post('Comment', this.comment).then(res => {
          // console.log(res)
          if (res.status === 200) {
            console.log('success')
            this.dialogFormVisible = false
            this.update()
          } else {
            console.log('err')
          }
        })
      }
    },
    clearForm () {
      this.comment.content = ''
    },
    update () {
      this.reload()
    }
  }
}
</script>

<style>
ul,
li {
  list-style: none;
  margin: 0;
  padding: 0;
}
.comment-operation {
  justify-content: flex-end;
}
.comment-info {
  align-items: center;
  margin-bottom: 10px;
}
.comment-article {
  align-items: center;
}
</style>
