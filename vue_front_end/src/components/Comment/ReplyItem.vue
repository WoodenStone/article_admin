<template>
  <el-container class="reply-container" direction="vertical">
    <el-container style="align-items: center">
      <div>
        <router-link
          :to="{
            path: '/user/visitor',
            query: { author: children.data.publisher_name }
          }"
          >{{ children.data.publisher_name }}</router-link
        >
      </div>
      &nbsp;回复&nbsp;
      <div>
        <router-link
          :to="{
            path: '/user/visitor',
            query: { author: children.data.recipient_name }
          }"
          >{{ children.data.recipient_name }}</router-link
        >
      </div>
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
  font-size: 0.8rem;
  color: @time-color;
}
a {
  text-decoration: none;
}
</style>
