import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import Wishes from '../views/Wishes.vue';
import PublicWishlist from '../views/PublicWishlist.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/wishes'
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/register',
      name: 'Register',
      component: Register
    },
    {
      path: '/wishes',
      name: 'Wishes',
      component: Wishes,
      meta: { requiresAuth: true }
    },
    {
      path: '/list/:publicId',
      name: 'PublicWishlist',
      component: PublicWishlist
    }
  ]
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  
  if (to.meta.requiresAuth && !token) {
    next('/login');
  } else if ((to.path === '/login' || to.path === '/register') && token) {
    next('/wishes');
  } else {
    next();
  }
});

export default router;

