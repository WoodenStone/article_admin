<template>
  <div class="message-container">
    <el-tabs v-model="activeName" :stretch="true">
      <el-tab-pane label="收件箱" name="receive-box" class="receive-box">
        <message-box-received
          :receiveList="receiveData"
          v-if="receiveData.length > 0"
          @msgReceived="handleCheck"
          @writeBack="writeBack"
          @deleteMsg="deleteMsg"
        ></message-box-received>
      </el-tab-pane>
      <el-tab-pane label="发件箱" name="send-box">
        <message-box-sent
          :sentList="sendData"
          v-if="sendData.length > 0"
          @msgSent="handleCheck"
          @deleteMsg="deleteMsg"
        >
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
    await this.getReceivedMessages()
    await this.getSentMessages()
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
      messageToReply: {}
    }
  },
  methods: {
    // 获取全部的收件信息并格式化时间
    async getReceivedMessages () {
      const userID = JSON.parse(window.localStorage.getItem('user')).user_id
      const res = await this.$http.get(`directMessage?userID=${userID}`)
      const result = res.data
      result.forEach(item => {
        item.delivery_time = dateFormat(item.delivery_time)
      })
      this.receiveData = result
    },
    // 获取发件信息
    async getSentMessages () {
      const userID = JSON.parse(window.localStorage.getItem('user')).user_id
      this.$http.get(`directMessageOut?userID=${userID}`).then((res, err) => {
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
        ? this.findKey(this.receiveData, data.msgID)
        : this.findKey(this.sendData, data.msgID)
      this.messageToCheck = msg
    },
    // 变更已读状态
    changeReadStatus (value) {
      this.$http.post('messageReadStatus', value).then((res, err) => {
        if (res.status === 200) {
          value.read_status = 1
        }
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
      console.log(item)
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
