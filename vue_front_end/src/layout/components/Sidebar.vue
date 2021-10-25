<!--
 * @author: WoodenStone
 * @lastEditors: WoodenStone
 * @Date: 2021-10-16 13:26:08
 * @LastEditTime: 2021-10-22 22:27:48
-->
<template>
  <el-aside
    class="sidebar-container"
    width="auto"
    :collapse-transition="false"
    @mouseenter.native="collapseOpen"
    @mouseleave.native="collapseClose"
  >
    <el-menu
      class="sidebar-menu"
      :collapse="isCollapse"
      router
      :default-active="this.$route.path"
      :default-openeds="opened"
    >
      <el-menu-item index="/home">
        <i class="iconfont icon-ar-kongzhizhongxin" />
        <span slot="title">主面板</span>
      </el-menu-item>
      <el-menu-item index="/table">
        <i class="iconfont icon-ar-a-icon_Articlelist" />
        <span slot="title">文章列表</span>
      </el-menu-item>
      <el-menu-item index="/form">
        <i class="iconfont icon-ar-write" />
        <span slot="title">新建文章</span>
      </el-menu-item>
      <el-submenu index="user">
        <template slot="title">
          <i class="iconfont icon-ar-gerenzhongxin-gerenxinxi" />
          <span slot="title">个人中心</span>
        </template>
        <el-menu-item index="/user/index">
          <i class="iconfont icon-ar-zhuye" />
          <span slot="title">主页</span>
        </el-menu-item>
        <el-menu-item index="/user/message">
          <i class="iconfont icon-ar-openmail" />
          <span slot="title">站内信</span>
        </el-menu-item>
        <el-menu-item index="/user/collection">
          <i class="iconfont icon-ar-shoucangjia" />
          <span slot="title">我的收藏</span>
        </el-menu-item>
      </el-submenu>
    </el-menu>
    <div class="collapse-button">
      <el-button type="text" @click="collapseStatus">
        <i v-show="isCollapse" class="el-icon-d-arrow-right" />
        <i v-show="!isCollapse" class="el-icon-d-arrow-left" />
      </el-button>
    </div>
  </el-aside>
</template>

<script>
export default {
  data () {
    return {
      collapseBtnClick: false,
      isCollapse: true,
      opened: ['user']
    }
  },
  methods: {
    collapseStatus () {
      this.collapseBtnClick = this.isCollapse
      this.isCollapse = !this.isCollapse
    },
    collapseOpen () {
      if (this.collapseBtnClick) return
      this.isCollapse = false
    },
    collapseClose () {
      if (this.collapseBtnClick) return
      this.isCollapse = true
    }
  }
}
</script>

<style lang="less" scoped>
.sidebar-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  .sidebar-menu {
    flex: 1 0 auto;
  }
  .sidebar-menu:not(.el-menu--collapse) {
    width: 200px;
  }
  .collapse-button {
    align-self: center;
    flex: 0 0 auto;
  }
  i[class*='iconfont'] {
    font-size: 20px;
    margin-right: 5px;
  }
}
</style>
