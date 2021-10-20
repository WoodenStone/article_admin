<template>
  <el-container class="collection-wrapper">
    <el-button type="text" class="collection-add" @click="handleCreate">
      <i class="el-icon-folder-add"></i>
      新建收藏夹</el-button
    >
    <el-row :gutter="20" type="flex" class="collection-row">
      <el-col
        :span="11"
        v-for="(collection, index) in collectionList"
        :key="index"
        class="collection-col fade-in"
      >
        <el-card class="box-card" shadow="always">
          <div
            slot="header"
            class="clearfix collection-card"
            @click="handleCheck(collection.collection_id)"
          >
            <h4>{{ collection.collection_name }}</h4>
            <p>{{ collection.collection_description }}</p>
          </div>
          <el-button-group class="collection-op">
            <el-button
              type="text"
              icon="el-icon-delete"
              @click="handleDelete(collection.collection_id)"
            ></el-button>
            <el-button
              type="text"
              icon="el-icon-edit"
              @click="handleChange(collection)"
            ></el-button>
          </el-button-group>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog
      :visible.sync="dialogFormVisible"
      :close-on-click-modal="false"
      :modal-append-to-body="false"
    >
      <div slot="title">
        <span v-if="!isEdit">新建收藏夹</span>
        <span v-else>修改收藏夹信息</span>
      </div>
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
      isEdit: false,
      collection: {
        name: '',
        description: '',
        cid: ''
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
          if (this.collection.name === '默认收藏') {
            this.$message({
              type: 'error',
              message: '不可命名为"默认收藏"！',
              duration: '2000'
            })
            this.dialogFormVisible = false
            return
          }
          if (!this.isEdit) {
            this.createCollection()
          } else {
            this.editCollection()
          }
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
            this.dialogFormVisible = false
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
          this.dialogFormVisible = false
          console.log(err)
        }
      })
    },
    editCollection () {
      // console.log(this.collection)
      const value = {
        ...this.collection
      }
      // console.log(value, 'v')
      this.$http.post('collectionInfo', value).then((res, err) => {
        if (!err) {
          this.$message({
            type: 'success',
            message: '修改成功!',
            duration: '2000'
          })
          setTimeout(() => {
            this.dialogFormVisible = false
            this.update()
          }, 2000)
        } else {
          console.log(err)
        }
      })
    },
    handleChange (item) {
      console.log(item)
      this.dialogFormVisible = true
      this.isEdit = true
      this.collection.cid = item.collection_id
      this.collection.name = item.collection_name
      this.collection.description = item.collection_description
    },
    handleCreate () {
      this.dialogFormVisible = true
      this.isEdit = false
      this.collection.name = ''
      this.collection.description = ''
    },
    handleDelete (cid) {
      this.$confirm('确定要删除收藏夹吗？', '提示', {
        confirmBottonText: '确定',
        cancelButtonText: '取消',
        center: true,
        type: 'warning'
      })
        .then(() => {
          this.$http
            .delete('collection', {
              data: { cid: cid }
            })
            .then((res, err) => {
              if (!err) {
                this.$message({
                  type: 'success',
                  message: '删除成功!',
                  duration: '2000'
                })
                this.update()
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
.collection-card {
  cursor: pointer;
}
.collection-op {
  /deep/ .el-button {
    padding: 10px 10px 10px 0;
  }
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
