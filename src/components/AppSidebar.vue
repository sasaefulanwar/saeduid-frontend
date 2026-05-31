<script setup>
import {
  LayoutDashboard,
  Receipt,
  Tags,
  Wallet,
  User,
  LogOut,
} from "lucide-vue-next";

import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const isActive = (path) => {
  return route.path === path;
};

const logout = () => {
  localStorage.removeItem("token");
  router.replace("/login");
};
</script>

<template>
  <div class="w-72 bg-slate-900 text-white flex flex-col p-6">
    <div>
      <h1 class="text-3xl font-bold mb-10">SAEduid 💰</h1>

      <div class="text-center mb-10">
        <div
          class="w-20 h-20 mx-auto rounded-full bg-blue-600 flex items-center justify-center text-3xl font-bold"
        >
          B
        </div>

        <p class="mt-3 font-semibold">Budi</p>
      </div>

      <nav class="flex flex-col gap-2">
        <router-link
          to="/dashboard"
          :class="[
            'flex items-center gap-3 p-3 rounded-xl',
            isActive('/dashboard') ? 'bg-blue-600' : 'hover:bg-slate-800',
          ]"
        >
          <LayoutDashboard :size="20" />
          Dashboard
        </router-link>

        <router-link
          to="/transactions"
          :class="[
            'flex items-center gap-3 p-3 rounded-xl',
            isActive('/transactions') ? 'bg-blue-600' : 'hover:bg-slate-800',
          ]"
        >
          <Receipt :size="20" />
          Transactions
        </router-link>

        <router-link
          to="/categories"
          :class="[
            'flex items-center gap-3 p-3 rounded-xl',
            isActive('/categories') ? 'bg-blue-600' : 'hover:bg-slate-800',
          ]"
        >
          <Tags :size="20" />
          Categories
        </router-link>

        <router-link
          to="/budgets"
          :class="[
            'flex items-center gap-3 p-3 rounded-xl',
            isActive('/budgets') ? 'bg-blue-600' : 'hover:bg-slate-800',
          ]"
        >
          <Wallet :size="20" />
          Budgets
        </router-link>

        <router-link
          to="/profile"
          :class="[
            'flex items-center gap-3 p-3 rounded-xl',
            isActive('/profile') ? 'bg-blue-600' : 'hover:bg-slate-800',
          ]"
        >
          <User :size="20" />
          Profile
        </router-link>
      </nav>
    </div>

    <button
      @click="logout"
      class="mt-auto flex items-center gap-3 bg-red-500 hover:bg-red-600 p-3 rounded-xl"
    >
      <LogOut :size="20" />

      Logout
    </button>
  </div>
</template>
