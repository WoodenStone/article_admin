<!--
 * @author: WoodenStone
 * @lastEditors: WoodenStone
 * @Date: 2021-10-16 19:36:10
 * @LastEditTime: 2021-11-06 14:11:13
-->
<template>
  <el-drawer
    title="站内信"
    :visible.sync="visible_"
    direction="rtl"
    size="40%"
    style="height: 100%"
  >
    <div class="message-main">
      <h3>{{ this.messageItem.title }}</h3>
      <div v-if="isReceived">
        发件人：
        <strong>{{ this.messageItem.addresser_name }}</strong>
      </div>
      <div v-if="!isReceived">
        收件人：
        <strong>{{ this.messageItem.consignee_name }}</strong>
      </div>
      <div class="message-time">{{ this.messageItem.delivery_time }}</div>
      <div class="message-content">
        <pre class="msg-content">{{ this.messageItem.content }}</pre>
      </div>
    </div>
  </el-drawer>
</template>
<script>
export default {
  name: 'MessageDetail',
  props: {
    messageToCheck: {
      type: Object,
      default: () => ({})
    },
    drawerVisible: {
      type: Boolean,
      default: false
    },
    isReceived: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      messageItem: {}
    }
  },
  computed: {
    visible_: {
      get () {
        return this.drawerVisible
      },
      set (v) {
        this.$emit('closeDrawer', v)
      }
    }
  },
  methods: {
    handleClose () {
      this.visible_ = false
    }
  },
  created () {
    this.messageItem = this.messageToCheck
    if (this.isReceived && this.messageItem.readStauts !== 1) {
      this.$emit('changeReadStatus', this.messageItem)
    }
  }
}
</script>

<style lang="less" scoped>
@time-color: #999;

.message-main {
  margin-left: 20px;
  .message-time {
    font-size: 10px;
    color: @time-color;
    padding: 10px 0 10px 0;
  }
  .message-content {
    margin-right: 10px;
    padding: 20px;
    background-color: #fff;
    box-shadow: 0 0 20px rgba(202, 196, 196, 0.3);
  }
  .msg-content {
    white-space: pre-wrap;
    word-wrap: break-word;
  }
}
</style>
