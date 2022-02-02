<template>
  <div class="message-container fade-in">
    <el-tabs v-model="activeName" :stretch="true">
      <el-tab-pane label="收件箱" name="receive-box" class="receive-box">
        <message-box-received
          :receiveList="currentReceiveMessage"
          v-if="currentReceiveMessage.length > 0"
          @msgReceived="handleCheck"
          @writeBack="writeBack"
          @deleteMsg="deleteMsg"
        >
          <slot>
            <el-pagination
              layout="prev, pager, next"
              :page-size="pageSize"
              :total="receiveMessageNumber"
              @current-change="handleReceiveCurrentChange"
            >
            </el-pagination>
          </slot>
        </message-box-received>
      </el-tab-pane>
      <el-tab-pane label="发件箱" name="send-box">
        <message-box-sent
          :sentList="currentSentMessage"
          v-if="currentSentMessage.length > 0"
          @msgSent="handleCheck"
          @deleteMsg="deleteMsg"
        >
          <slot>
            <el-pagination
              layout="prev, pager, next"
              :page-size="pageSize"
              :total="sentMessageNumber"
              @current-change="handleSentCurrentChange"
            >
            </el-pagination>
          </slot>
        </message-box-sent>
      </el-tab-pane>
      <el-tab-pane label="写站内信" name="write-box">
        <message-editor
          v-if="!isReply || (isReply && Object.keys(messageToReply).length > 0)"
          :messageToReply="messageToReply"
          :isReply="isReply"
          @sendMessage="sendMessage"
        ></message-editor>
      </el-tab-pane>
    </el-tabs>

    <message-detail
      v-if="Object.keys(messageToCheck).length > 0 && drawerStatus"
      :isReceived="isReceived"
      :drawerVisible="drawerStatus"
      @closeDrawer="closeDrawer"
      :messageToCheck="messageToCheck"
      @changeReadStatus="changeReadStatus"
    ></message-detail>
  </div>
</template>

<script>
import MessageBoxReceived from '@/components/Message/MessageBoxReceived'
import MessageBoxSent from '@/components/Message/MessageBoxSent'
import MessageDetail from '@/components/Message/MessageDetail'
import MessageEditor from '@/components/Message/MessageEditor'
import { dateFormat } from '@/utils/dateFormat.js'
export default {
  components: {
    MessageBoxReceived,
    MessageBoxSent,
    MessageDetail,
    MessageEditor
  },
  async created () {
    // console.log(this.pageSize)
    this.getMessageReceivedNumber()
    await this.getCurrentReceivedMessages()
    this.getMessageSentNumber()
    await this.getCurrentSentMessages()
  },
  inject: ['reload'],
  data () {
    return {
      activeName: 'receive-box',
      receiveData: [],
      sendData: [],
      drawerStatus: false,
      messageToCheck: {},
      isReceived: true,
      isReply: false,
      messageToReply: {},
      pageSize: 8,
      receiveMessageNumber: 0,
      currentReceivePageNum: 0,
      currentReceiveMessageOffset: 0,
      currentReceiveMessage: [],
      sentMessageNumber: 0,
      currentSentPageNum: 0,
      currentSentMessageOffset: 0,
      currentSentMessage: []
    }
  },
  methods: {
    // 获取收到的站内信总数
    getMessageReceivedNumber () {
      const userID = JSON.parse(window.localStorage.getItem('user')).user_id
      this.$http.get(`MessageNum?userID=${userID}`).then(res => {
        this.receiveMessageNumber = res.data[0].total
      })
    },
    // 获取发出的站内信总数
    getMessageSentNumber () {
      const userID = JSON.parse(window.localStorage.getItem('user')).user_id
      this.$http.get(`MessageOutNum?userID=${userID}`).then(res => {
        this.sentMessageNumber = res.data[0].total
      })
    },
    // 分页获取收到的信息
    async getCurrentReceivedMessages () {
      const userID = JSON.parse(window.localStorage.getItem('user')).user_id
      const res = await this.$http.get(
        `currentDirectMessage?userID=${userID}&pageSize=${this.pageSize}&offset=${this.currentReceiveMessageOffset}`
      )
      const result = res.data
      result.forEach(item => {
        item.delivery_time = dateFormat(item.delivery_time)
      })
      this.currentReceiveMessage = result
    },
    // 分页获取发出的信息
    async getCurrentSentMessages () {
      const userID = JSON.parse(window.localStorage.getItem('user')).user_id
      const res = await this.$http.get(
        `currentMessageOut?userID=${userID}&pageSize=${this.pageSize}&offset=${this.currentSentMessageOffset}`
      )
      const result = res.data
      result.forEach(item => {
        item.delivery_time = dateFormat(item.delivery_time)
      })
      this.currentSentMessage = result
    },

    // 收件箱页面变化
    handleReceiveCurrentChange (newPage) {
      // console.log(newPage)
      this.currentReceiveMessageOffset = (newPage - 1) * this.pageSize
      this.currentReceivePageNum = newPage - 1
      this.getCurrentReceivedMessages()
    },
    // 发件箱页面变化
    handleSentCurrentChange (newPage) {
      this.currentSentMessageOffset = (newPage - 1) * this.pageSize
      this.currentSentPageNum = newPage - 1
      this.getCurrentSentMessages()
    },
    // 获取发件信息
    async getSentMessages () {
      const userID = JSON.parse(window.localStorage.getItem('user')).user_id
      this.$http
        .get(`directMessageOut?userID=${userID}`)
        .then((res, err) => {
          if (!err) {
            const value = res.data
            value.forEach(item => {
              item.delivery_time = dateFormat(item.delivery_time)
            })
            this.sendData = value
          } else {
            console.log(err)
          }
        })
        .catch(e => {
          console.log(e)
        })
    },
    closeDrawer (v) {
      this.drawerStatus = v
    },
    findKey (arr, value) {
      for (const a of arr) {
        if (a.message_id === value) {
          return a
        }
      }
    },
    // 查看信件
    handleCheck (data) {
      this.isReceived = data.isReceived
      this.drawerStatus = data.drawerStatus
      const msg = this.isReceived
        ? this.findKey(this.currentReceiveMessage, data.msgID)
        : this.findKey(this.currentSentMessage, data.msgID)
      this.messageToCheck = msg
    },
    // 变更已读状态
    changeReadStatus (value) {
      this.$http
        .post('messageReadStatus', value)
        .then((res, err) => {
          if (res.status === 200) {
            value.read_status = 1
          }
        })
        .catch(e => {
          console.log(e)
        })
    },
    // 跳转至写信界面
    writeBack (item) {
      this.isReply = true
      // 如果使用 = 赋值，在"回复-重置-收件箱-回复"的连续操作时
      // 第二次及以后的回复会无法加载预加载内容
      this.messageToReply = Object.assign({}, item)
      this.activeName = 'write-box'
      // console.log('write back')
    },
    deleteMsg (item) {
      // console.log(item)
      this.$confirm('确定要删除吗？', '提示', {
        confirmBottonText: '确定',
        cancelButtonText: '取消',
        center: true,
        type: 'warning'
      })
        .then(() => {
          this.$http
            .delete('message', {
              data: { msgId: item.message_id }
            })
            .then((res, err) => {
              if (!err && res.data.affectedRows === 1) {
                this.$message({
                  type: 'success',
                  message: '删除成功!',
                  duration: '2000'
                })
                setTimeout(() => {
                  this.update()
                }, 2000)
              } else {
                this.$message({
                  message: '删除失败',
                  type: 'warning',
                  duration: '2000'
                })
              }
            })
            .catch(e => {
              console.log(e)
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
    sendMessage () {
      this.activeName = 'send-box'
    },
    update () {
      this.reload()
    }
  }
}
</script>
