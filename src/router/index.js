import { createRouter, createWebHistory } from "vue-router";

import LoginView from "../views/LoginView.vue";
import DashboardView from "../views/DashboardView.vue";
import CategoriesView from "../views/CategoriesView.vue";
import TransactionsView from "../views/TransactionsView.vue";
import BudgetsView from "../views/BudgetsView.vue";
import ProfileView from "../views/ProfileView.vue";
import AIAssistantView from "../views/AIAssistantView.vue";

const routes = [
  {
    path: "/",
    redirect: "/login",
  },

  {
    path: "/login",
    component: LoginView,
  },

  {
    path: "/dashboard",
    component: DashboardView,
  },

  {
    path: "/categories",
    component: CategoriesView,
  },

  {
    path: "/transactions",
    component: TransactionsView,
  },

  {
    path: "/budgets",
    component: BudgetsView,
  },

  {
    path: "/profile",
    component: ProfileView,
  },

  {
    path: "/ai",
    component: AIAssistantView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
