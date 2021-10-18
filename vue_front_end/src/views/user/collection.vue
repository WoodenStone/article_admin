<template>
  <el-container class="collection-wrapper">
    <el-button
      type="text"
      class="collection-add"
      @click="dialogFormVisible = true"
    >
      <i class="el-icon-folder-add"></i>
      新建收藏夹</el-button
    >
    <el-row :gutter="20" type="flex" class="collection-row">
      <el-col
        :span="11"
        v-for="(collection, index) in collectionList"
        :key="index"
        class="collection-col"
      >
        <el-card class="box-card" shadow="always">
          <div slot="header" class="clearfix">
            <h4>{{ collection.collection_name }}</h4>
            <p>{{ collection.collection_description }}</p>
          </div>
          <el-button type="text" @click="handleCheck(collection.collection_id)"
            >查看</el-button
          >
        </el-card>
      </el-col>
    </el-row>

    <el-dialog
      title="新建收藏夹"
      :visible.sync="dialogFormVisible"
      :close-on-click-modal="false"
    >
      <el-form :model="collection" ref="collection" :rules="rules">
        <el-form-item label="收藏夹名称" prop="name">
          <el-input v-model="collection.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="收藏夹描述" prop="description">
          <el-input
            v-model="collection.description"
            placeholder="在这里输入描述..."
            type="textarea"
          >
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm('collection')"
          >立即创建</el-button
        >
      </div>
    </el-dialog>
  </el-container>
</template>

<script>
export default {
  inject: ['reload'],
  data () {
    return {
      collectionList: [],
      dialogFormVisible: false,
      collection: {
        name: '',
        description: ''
      },
      rules: {
        name: [
          {
            required: true,
            message: '请输入收藏夹名',
            trigger: 'blur'
          },
          {
            max: 50,
            message: '收藏夹名应小于50字符',
            trigger: 'blur'
          },
          {
            min: 1,
            message: '请至少输入一个字符',
            trigger: 'blur'
          }
        ],
        description: [
          {
            max: 140,
            message: '描述应小于140字符',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created () {
    this.getCollection()
  },
  methods: {
    getCollection () {
      const uid = JSON.parse(window.localStorage.getItem('user')).user_id
      this.$http.get(`collection?uid=${uid}`).then(res => {
        this.collectionList = res.data
        // console.log(this.collectionList)
      })
    },
    handleCheck (cid) {
      //   console.log(cid)
      this.$router.push({
        path: '/user/favorite',
        query: { cid: cid }
      })
    },
    submitForm (formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.createCollection()
        } else {
          console.log(this.collection)
          return false
        }
      })
    },
    createCollection () {
      const value = {
        cname: this.collection.name,
        cdes: this.collection.description,
        uid: JSON.parse(window.localStorage.getItem('user')).user_id
      }
      this.$http.post('newCollection', value).then((res, err) => {
        if (!err) {
          if (res.status === 200) {
            this.$message({
              type: 'success',
              message: '创建成功!',
              duration: '2000'
            })
          } else {
            this.$message({
              type: 'warning',
              message: '未知错误，请稍后再试',
              duration: '2000'
            })
          }

          setTimeout(() => {
            this.dialogFormVisible = false
            this.update()
          }, 2000)
        } else {
          console.log(err)
        }
      })
    },
    update () {
      this.reload()
    }
  }
}
</script>

<style lang="less" scoped>
.collection-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
}
.collection-add {
  align-self: flex-end;
  right: 0;
  margin-right: 30px;
}
.collection-row {
  justify-content: center;
  flex-wrap: wrap;
}
.collection-col {
  margin: 0 10px;
}
.box-card {
  margin-bottom: 20px;
  box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.13);
  border: none;
  transition: box-shadow 0.5s;
  /deep/ .el-card__header {
    padding: 5px 20px;
  }
  /deep/ .el-card__body {
    padding: 0 20px;
  }
  p {
    font-size: 8px;
    font-family: Tahoma, Helvetica, Arial, '宋体', sans-serif;
  }
  &:hover {
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.4);
  }
  .el-button {
    margin: auto;
  }
}
</style>
