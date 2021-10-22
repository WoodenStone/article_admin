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
        <i class="el-icon-s-grid" />
        <span slot="title">主面板</span>
      </el-menu-item>
      <el-menu-item index="/table">
        <i class="el-icon-collection" />
        <span slot="title">文章列表</span>
      </el-menu-item>
      <el-menu-item index="/form">
        <i class="el-icon-notebook-1" />
        <span slot="title">新建文章</span>
      </el-menu-item>
      <el-submenu index="user">
        <template slot="title">
          <i class="el-icon-user" />
          <span slot="title">个人中心</span>
        </template>
        <el-menu-item index="/user/index">
          <i class="el-icon-box" />
          <span slot="title">主页</span>
        </el-menu-item>
        <el-menu-item index="/user/message">
          <i class="el-icon-coffee" />
          <span slot="title">站内信</span>
        </el-menu-item>
        <el-menu-item index="/user/collection">
          <i class="el-icon-collection-tag" />
          <span slot="title">我的收藏</span>
        </el-menu-item>
      </el-submenu>
      <!--
      <el-submenu index="2">
        <template slot="title">
          <i class="el-icon-notebook-1" />
          <span>书影音</span>
        </template>
        <el-menu-item-group>
          <el-menu-item index="/artwork/reading">阅读</el-menu-item>
          <el-submenu index="2-2">
            <template slot="title">影音</template>
            <el-menu-item index="2-2-1">电影</el-menu-item>
            <el-menu-item index="2-2-2">音乐</el-menu-item>
          </el-submenu>
        </el-menu-item-group>
      </el-submenu>
      <el-menu-item index="3">
        <i class="el-icon-collection" />
        <span slot="title">博客</span>
      </el-menu-item>
      <el-menu-item index="4">
        <i class="el-icon-coffee" />
        <span slot="title">游戏墙</span>
      </el-menu-item>
      <el-menu-item index="5">
        <i class="el-icon-box" />
        <span slot="title">照片墙</span>
      </el-menu-item>
      <el-menu-item index="6">
        <i class="el-icon-wallet" />
        <span slot="title">足迹</span>
      </el-menu-item>
      -->
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
}
</style>
