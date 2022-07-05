import Vue from 'vue';
import VueRouter from 'vue-router';
import Tasks from '@/pages/Tasks';
import CompletedTasks from '@/pages/CompletedTasks';
import SnoozedTasks from '@/pages/SnoozedTasks';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'home',
    redirect: 'tasks'
  },
  {
    path: '/tasks',
    name: 'tasks',
    component: Tasks
  },
  {
    path: '/tasks/completed',
    name: 'tasks.completed',
    component: CompletedTasks
  },
  {
    path: '/tasks/snoozed',
    name: 'tasks.snoozed',
    component: SnoozedTasks
  },
];

const router = new VueRouter({
  routes
});

export default router;
