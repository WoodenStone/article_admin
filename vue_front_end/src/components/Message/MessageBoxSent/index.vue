<template>
  <div class="send">
    <el-row style="width: 100%" type="flex" class="receive-row">
      <el-col
        :span="21"
        v-for="(item, index) of sentList"
        :key="index"
        style="margin-bottom:20px"
      >
        <el-card class="receive-card" shadow="hover">
          <div slot="header" class="clearfix">
            <span class="receive-intotext">[收件人]</span>&nbsp;
            <span>{{ item.consignee_name }}</span>
            <span style="float: right">
              <el-tooltip
                class="item"
                effect="dark"
                content="收件人已读"
                placement="top"
                v-if="item.read_status"
              >
                <i class="el-icon-document-checked"> </i>
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="dark"
                content="收件人未读"
                placement="top"
                v-if="!item.read_status"
              >
                <i class="el-icon-document"> </i>
              </el-tooltip>
            </span>
            <div class="receive-title">{{ item.title }}</div>
          </div>
          <div class="receive-content">
            <span class="receive-intotext">[预览]</span>
            {{ item.content }}
          </div>
          <div class="receive-info">
            <div class="receive-button">
              <el-button
                type="text"
                @click="checkmsgSent(item.message_id)"
                icon="el-icon-notebook-2"
                >查看</el-button
              >
              <el-button
                type="text"
                @click="deleteMsg(item)"
                icon="el-icon-delete"
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
  name: 'MessageBoxSent',
  props: {
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
    console.log(this.sentList)
  },
  methods: {
    checkmsgSent (id) {
      const value = {
        isReceived: false,
        msgID: id,
        drawerStatus: true
      }
      this.$emit('msgSent', value)
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
  display: flex;
  flex-direction: column;
  padding-right: 0;
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

.receive-intotext {
  font-family: Tahoma, Helvetica, Arial, '宋体', sans-serif;
  font-size: 10px;
  text-decoration: underline;
}
.receive-title {
  padding-top: 10px;
}
</style>
