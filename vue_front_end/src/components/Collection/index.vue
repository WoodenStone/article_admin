<!--
 * @author: WoodenStone
 * @lastEditors: WoodenStone
 * @Date: 2021-10-17 16:50:26
 * @LastEditTime: 2021-10-18 15:41:13
-->
<template>
  <el-dialog
    title="收藏到："
    :visible.sync="showDialog"
    :close-on-click-modal="false"
    :before-close="onClose"
  >
    <el-checkbox-group v-model="collectionChecked">
      <el-checkbox
        v-for="folder in collectionList"
        :key="folder.collection_id"
        :label="folder.collection_id"
        class="collection-checkbox"
      >
        {{ folder.collection_name }}
      </el-checkbox>
    </el-checkbox-group>
    <div class="operation">
      <el-button
        type="primary"
        size="small"
        class="collection-submit"
        @click="submitCollection"
        >确定</el-button
      >
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'Collection',
  props: {
    showDialog: {
      type: Boolean,
      default: false
    },
    userInfo: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      collectedID: [],
      collectionList: [],
      collectionChecked: []
    }
  },
  async created () {
    console.log(this.userInfo, 'info')
    await this.getCollection()
    await this.findCollectionStatus()
    // console.log(this.userInfo)
  },
  methods: {
    onClose () {
      this.$emit('close')
    },
    // 查找此用户所有文件夹
    async getCollection () {
      const folder = await this.$http.get(`collection?uid=${this.userInfo.uid}`)
      this.collectionList = await folder.data
      // console.log(folder.data, 'folder')
    },
    // 查找该文章被收藏于哪些收藏夹
    async findCollectionStatus () {
      const cset = await this.$http.get(
        `collectionStatus?uid=${this.userInfo.uid}&aid=${this.userInfo.aid}`
      )
      for (const citem of cset.data) {
        // console.log(citem)
        this.collectionChecked.push(citem.collection_id)
      }
      // console.log(this.collectionChecked)
    },
    submitCollection () {
      // console.log(this.collectionChecked)
      const value = {
        aid: this.userInfo.aid,
        uid: this.userInfo.uid,
        cid: this.collectionChecked
      }
      this.$http.post('articleFavorite', value).then((res, err) => {
        if (!err) {
          if (res.status === 200) {
            this.$message({
              type: 'success',
              message: '操作成功！可到 个人中心-我的收藏 中查看',
              duration: 2000
            })
            this.$emit('close')
          } else {
            this.$message({
              type: 'warning',
              message: '收藏失败，请稍后再试',
              duration: 2000
            })
          }
        } else {
          console.log(err)
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.collection-checkbox {
  display: block;
  line-height: 30px;
}
.operation {
  overflow: auto;
  .collection-submit {
    float: right;
  }
}
</style>
