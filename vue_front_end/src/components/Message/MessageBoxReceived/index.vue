<template>
  <div class="receive">
    <div v-if="!receiveList.length">?</div>
    <el-row
      style="width: 100%"
      type="flex"
      class="receive-row"
      v-if="receiveList.length"
    >
      <el-col
        :span="21"
        v-for="(item, index) of receiveList"
        :key="index"
        style="margin-bottom:20px"
      >
        <el-card class="receive-card" shadow="hover">
          <div slot="header" class="clearfix">
            <span class="receive-infotext">[发件人]</span>&nbsp;
            <span>{{ item.addresser_name }}</span>
            <span style="float: right">
              <el-tooltip
                class="item"
                effect="dark"
                content="已读"
                placement="top"
                v-if="item.read_status"
              >
                <i class="el-icon-finished"> </i>
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="dark"
                content="未读"
                placement="top"
                v-if="!item.read_status"
              >
                <i class="el-icon-bell"> </i>
              </el-tooltip>
            </span>
            <div class="receive-title">{{ item.title }}</div>
          </div>
          <div class="receive-content">
            <span class="receive-infotext">[预览]</span>
            {{ item.content }}
          </div>
          <div class="receive-info">
            <div class="receive-button">
              <el-button
                type="text"
                @click="checkmsgReceived(item.message_id)"
                icon="iconfont icon-ar-biaojiyidu"
                >查看</el-button
              >
              <el-button
                type="text"
                @click="writeBack(item)"
                icon="iconfont icon-ar-reply"
                >回复</el-button
              >
              <el-button
                type="text"
                @click="deleteMsg(item)"
                icon="iconfont icon-ar-delete"
                >删除</el-button
              >
            </div>
            <div class="receive-time">{{ item.delivery_time }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'MessageBoxReceived',
  props: {
    receiveList: {
      type: Array,
      default: () => []
    },
    sentList: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      receiveMessages: []
    }
  },
  created () {
    // console.log(this.receiveList)
  },
  methods: {
    checkmsgReceived (id) {
      const value = {
        isReceived: true,
        msgID: id,
        drawerStatus: true
      }
      this.$emit('msgReceived', value)
    },
    writeBack (item) {
      this.$emit('writeBack', item)
    },
    deleteMsg (item) {
      this.$emit('deleteMsg', item)
    }
  }
}
</script>

<style lang="less" scoped>
@time-color: #999;
.text {
  font-size: 14px;
}

.item {
  margin-bottom: 18px;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: '';
}
.clearfix:after {
  clear: both;
}
/*
.box-card {
  width: 480px;
} */
.receive-box {
  display: flex;
  justify-content: center;
}
.receive-row {
  flex-direction: column;
  align-items: center;
}
.receive-content {
  max-height: 3.2rem;
  overflow: hidden;
  font-size: 15px;
}
.receive-info {
  float: right;
  .receive-time {
    font-size: 10px;
    color: @time-color;
    float: right;
    padding-bottom: 10px;
  }

  .receive-button {
    align-self: flex-end;
  }
}

.receive-infotext {
  font-family: Tahoma, Helvetica, Arial, '宋体', sans-serif;
  font-size: 0.8rem;
  text-decoration: underline;
}
.receive-title {
  padding-top: 10px;
}
</style>
