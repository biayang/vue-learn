import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
  },
  {
    path: '/change',
    name: 'Change',
    component: () => import('../views/ChangeAuth.vue')
  },
  {
    path: '/git',
    name: 'Git',
    component: () => import('../views/Git.vue'),
    props: (route) => ({ b: route.query.b })
  },
  {
    path: '/trans',
    name: 'Trans',
    component: () => import('../views/Trans.vue')
  },
  {
    path: '/user',
    name: 'User',
    component: () => import('../views/UserManager.vue')
  },
  {
    path: '/oplog',
    name: 'OpLog',
    component: () => import('../views/OPShowManager.vue')
  },
  {
    path: '/todo',
    name: 'Todo',
    component: () => import(/* webpackChunkName: "about" */ '../views/Todo.vue'),
    props: (route) => ({ d: route.query.d })
  }
]

const router = new VueRouter({
  mode: 'hash',
  routes
})

// 导航守卫
// 使用 router.beforeEach 注册一个全局前置守卫，判断用户是否登陆
router.beforeEach((to, from, next) => {
  if (to.path === '/login' || to.path === '/register') {
    next();
  } else {
    let token = localStorage.getItem('Authorization');
    console.log('token,',token)
    if (token === null || token === '') {
      console.log('导航守卫生效，转移到login',token)
      next('/login');
    } else {
      console.log('导航守卫不生效',token == null)
      next();
    }
  }
});

export default router
