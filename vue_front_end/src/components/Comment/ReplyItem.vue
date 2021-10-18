<template>
  <el-container class="reply-container" direction="vertical">
    <el-container style="align-items: center">
      <div>{{ children.data.publisher_name }}</div>
      &nbsp;回复&nbsp;
      <div>{{ children.data.recipient_name }}</div>
      <div class="reply-time">
        {{ dateFormat(children.data.create_time) }}
      </div>
    </el-container>
    <div style="margin-top: 10px">{{ children.data.content }}</div>
  </el-container>
</template>

<script>
import { dateFormat } from '@/utils/dateFormat.js'
export default {
  props: {
    children: {
      type: Object,
      default: () => ({})
    }
  },
  methods: {
    dateFormat (createDate) {
      return dateFormat(createDate)
    }
  }
}
</script>

/* 加上scoped样式会失效 */
<style lang="less">
@time-color: #666666;
.reply-time {
  margin-left: 10px;
  font-size: 8px;
  color: @time-color;
}
</style>
