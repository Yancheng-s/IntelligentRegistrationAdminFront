import Vue from 'vue'
import VueRouter from 'vue-router'
import Layout from '../layout/index.vue'
import Login from '../views/Login.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Login',
    hidden:true,
    component: Login,
    meta: {
      isLogin: false
    }
  },{
    path: '/login',
    name: 'Login',
    hidden:true,
    component: Login,
    meta: {
      isLogin: false
    }
  },// src/router/index.js

  {
    path: '/home',
    name: '后台管理',
    hidden:false,
    component: Layout,
    meta: {
      isLogin: false
    },
    children: [
      {
        path: '/home',
        name: '接诊统计',
        component: () => import('../views/home/home.vue'),
        meta: {
          isLogin: true,
          type: 'root' // 确保这里设置正确的类型
        }
      }
    ]
  },
  {
    path: '/registration',
    name: '挂号管理',
    hidden: false,
    component: Layout,
    meta: {
      isLogin: true
    },
    children: [
      {
        path: '/onsite-registration',
        name: '窗口挂号',
        component: () => import('../views/registration/onsite_registration.vue'),
        meta: {
          isLogin: true,
          type: 'root' // 确保这里设置正确的类型
        }
      },
      {
        path: '/registration-record',
        name: '窗口退号',
        component: () => import('../views/registration/registration_record.vue'),
        meta: {
          isLogin: true,
          type: 'root' // 确保这里设置正确的类型
        }
      }
    ]
  },
  {
    path: '/department',
    name: '科室管理',
    hidden:false,
    component: Layout,
    meta: {
      isLogin: false
    },
    children: [
      {
        path: '/department',
        name: '科室详情',
        component: () => import('../views/department/department.vue'),
        meta: {
          isLogin: true,
          type: 'root' // 确保这里设置正确的类型
        }
      }
    ]
  },
  {
    path: '/employee',
    name: '医生管理',
    hidden:false,
    component: Layout,
    meta: {
      isLogin: false
    },
    children: [
      {
        path: '/employee',
        name: '医生详情',
        component: () => import('../views/Employee/Employee.vue'),
        meta: {
          isLogin: true,
          type: 'root'
        }
      }
    ]
  },
  // {
  //   path: '/RegistrationLevel',
  //   name: '挂号级别管理',
  //   hidden:false,
  //   component: Layout,
  //   meta: {
  //     isLogin: false
  //   },
  //   children: [
  //     {
  //       path: '/RegistrationLevel',
  //       name: '挂号级别详情',
  //       component: () => import('../views/RegistrationLevel/RegistrationLevel.vue'),
  //       meta: {
  //         isLogin: true,
  //         type: 'root' // 确保这里设置正确的类型
  //       }
  //     }
  //   ]
  // },
  {
    path: '/patient',
    name: '患者管理',
    hidden:false,
    component: Layout,
    meta: {
      isLogin: false
    },
    children: [
      {
        path: '/patient',
        name: '患者详情',
        component: () => import('../views/patient/patient.vue'),
        meta: {
          isLogin: true,
          type: 'root' // 确保这里设置正确的类型
        }
      }
    ]
  },

];

const router = new VueRouter({
  routes
})

export default router
