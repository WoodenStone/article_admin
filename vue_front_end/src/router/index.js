import Vue from 'vue'
import VueRouter from 'vue-router'

import Layout from '@/layout'

Vue.use(VueRouter)

// 解决ElementUI导航栏中的vue-router在3.0版本以上重复点菜单报错问题
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push (location) {
  return originalPush.call(this, location).catch(err => err)
}

const constRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/login'),
    redirect: '/login/login',
    children: [
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/views/login/login'),
        meta: { title: 'Login', icon: '', requireAuth: false }
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('@/views/login/register'),
        meta: { title: 'Register', icon: '', requireAuth: false }
      }
    ]
  },

  {
    path: '/',
    component: Layout,
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: '主面板',
        component: () => import('@/views/home/index'),
        meta: { title: 'Home', icon: '' }
      }
    ]
  },

  {
    path: '/table',
    component: Layout,
    redirect: '/table/index',
    children: [
      {
        path: 'index',
        name: '文章列表',
        component: () => import('@/views/table/index'),
        meta: { title: 'Table', icon: '', requireAuth: true }
      },
      {
        path: 'detail',
        name: '文章详情',
        component: () => import('@/views/table/detail'),
        meta: { title: 'Detail', icon: '', requireAuth: true }
      }
    ]
  },

  {
    path: '/form',
    component: Layout,
    redirect: '/form/create',
    children: [
      {
        path: 'create',
        name: '新增一篇',
        component: () => import('@/views/form/create'),
        meta: { title: 'Create', icon: '', requireAuth: true }
      },
      {
        path: 'edit',
        name: '编辑文章',
        component: () => import('@/views/form/edit'),
        meta: { title: 'Edit', icon: '', requireAuth: true }
      }
    ]
  },

  {
    path: '/user',
    component: Layout,
    redirect: '/user/index',
    children: [
      {
        path: 'index',
        name: '个人主页',
        component: () => import('@/views/user/index'),
        meta: { title: 'Self', icon: '', requireAuth: true }
      },
      {
        path: 'message',
        name: '站内信',
        component: () => import('@/views/user/message'),
        meta: { title: 'Message', icon: '' }
      },
      {
        path: 'collection',
        name: '我的收藏',
        component: () => import('@/views/user/collection'),
        meta: { title: 'Collection', icon: '' }
      },
      {
        path: 'favorite',
        name: '收藏文章',
        component: () => import('@/views/user/favorite'),
        meta: { title: 'Favorite', icon: '' }
      },
      {
        path: 'change',
        name: '修改个人信息',
        component: () => import('@/views/user/change'),
        meta: { title: 'UserChange', icon: '', requireAuth: true }
      },
      {
        path: 'visitor',
        name: '访客界面',
        component: () => import('@/views/user/visitor'),
        meta: { title: 'Visitor', icon: '', requireAuth: true }
      }
    ]
  }
]

const createRouter = () =>
  new VueRouter({
    // mode: 'history'
    scrollBehavior: () => ({ y: 0 }),
    routes: constRoutes
  })

const router = createRouter()

// 动态清除注册的路由
export function resetRouter () {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
