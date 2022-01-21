import Vue from 'vue';
import VueRouter from 'vue-router';
import Tasks from '@/pages/Tasks';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    component: Tasks
  },
];

const router = new VueRouter({
  routes
});

export default router;
