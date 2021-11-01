<template>
  <div class="comment-item">
    <el-container class="comment-info">
      <el-avatar class="avatar" :src="this.avatarurl"></el-avatar>
      <div class="publisher">
        <router-link
          :to="{
            path: '/user/visitor',
            query: { author: data.item.publisher_name }
          }"
          >{{ data.item.publisher_name }}</router-link
        >
      </div>
      <div class="comment-time">
        {{ dateFormat(data.item.create_time) }}
      </div>
      <div class="floor">#{{ data.index + 1 }}</div>
    </el-container>
    <el-container class="comment-content">{{ data.item.content }}</el-container>
  </div>
</template>
<script>
import { dateFormat } from '@/utils/dateFormat.js'
import getUserAvatarById from '@/utils/user.js'
export default {
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      rData: [],
      avatarurl: ''
    }
  },
  async created () {
    this.rData = this.data
    // console.log(this.rData.item)
    this.rData.item.avatar = ''
    await getUserAvatarById(this, this.rData.item.publisher_id).then(
      data => (this.avatarurl = data)
    )
    // console.log(this.avatarurl)
  },
  methods: {
    dateFormat (createDate) {
      return dateFormat(createDate)
    }
  }
}
</script>

<style lang="less" scoped>
@floor-color: #454534;
@time-color: #666666;
.comment-info {
  align-items: center;
  margin: 10px 0;
}
.avatar {
  margin-right: 20px;
}
.comment-time {
  margin-left: 10px;
  font-size: 8px;
  color: @time-color;
}
.floor {
  margin-left: auto;
  color: @floor-color;
}
a {
  text-decoration: none;
}
</style>
