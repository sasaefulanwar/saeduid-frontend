<script setup>
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import AppSidebar from "./components/AppSidebar.vue";
import { Menu } from "lucide-vue-next";

const route = useRoute();
const isMobileMenuOpen = ref(false);

watch(
  () => route.path,
  () => {
    isMobileMenuOpen.value = false;
  },
);
</script>

<template>
  <div
    v-if="route.path === '/login' || route.path === '/'"
    class="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors flex items-center justify-center font-sans text-slate-800 dark:text-slate-100"
  >
    <router-view />
  </div>

  <div
    v-else
    class="flex h-screen bg-slate-100 dark:bg-slate-900 transition-colors font-sans text-slate-800 dark:text-slate-100 overflow-hidden"
  >
    <div
      class="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 z-20 flex items-center justify-between px-6 shadow-sm"
    >
      <div class="flex items-center gap-2">
        <div
          class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold"
        >
          S
        </div>
        <h1 class="text-xl font-bold text-slate-900 dark:text-white">
          SAEduid
        </h1>
      </div>
      <button
        @click="isMobileMenuOpen = true"
        class="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
      >
        <Menu :size="24" />
      </button>
    </div>

    <AppSidebar :isOpen="isMobileMenuOpen" @close="isMobileMenuOpen = false" />

    <div class="flex-1 overflow-y-auto p-4 md:p-8 mt-16 md:mt-0">
      <router-view />
    </div>
  </div>
</template>
