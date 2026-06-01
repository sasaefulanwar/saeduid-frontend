<script setup>
import { ref } from "vue";
import { useRoute } from "vue-router";
import { Menu } from "lucide-vue-next";
import AppSidebar from "./components/AppSidebar.vue"; // Sesuaikan path-nya ya!

const route = useRoute();
const isMobileMenuOpen = ref(false);
</script>

<template>
  <div
    v-if="route.path === '/login' || route.path === '/'"
    class="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-500 flex items-center justify-center p-4"
  >
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>

  <div
    v-else
    class="flex h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-500 overflow-hidden"
  >
    <div
      class="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 z-20 flex items-center justify-between px-6 shadow-sm"
    >
      <div class="flex items-center gap-2">
        <div
          class="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md"
        >
          S
        </div>
        <h1
          class="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight"
        >
          SAEduid
        </h1>
      </div>
      <button
        @click="isMobileMenuOpen = true"
        class="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
      >
        <Menu :size="24" />
      </button>
    </div>

    <AppSidebar :isOpen="isMobileMenuOpen" @close="isMobileMenuOpen = false" />

    <main
      class="flex-1 overflow-y-auto scroll-smooth pt-20 md:pt-8 px-4 md:px-8 pb-8"
    >
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<style>
/* Animasi Transisi Halus antar Halaman */
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(5px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
