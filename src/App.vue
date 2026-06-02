<script setup>
import { ref } from "vue";
import { useRoute } from "vue-router";
import { Menu } from "lucide-vue-next";
import AppSidebar from "./components/AppSidebar.vue"; // Pastikan path sesuai

const route = useRoute();
const isMobileMenuOpen = ref(false);
</script>

<template>
  <!-- Global Background with Subtle Glow (Rahasia Glassmorphism Apple) ✨ -->
  <div
    class="fixed inset-0 z-[-1] bg-[#f8fafc] dark:bg-[#09090b] transition-colors duration-500 overflow-hidden"
  >
    <!-- Bola Cahaya Blur (Kiri Atas) -->
    <div
      class="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-400/20 dark:bg-blue-600/15 rounded-full blur-[120px] pointer-events-none"
    ></div>
    <!-- Bola Cahaya Blur (Kanan Bawah) -->
    <div
      class="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-purple-400/20 dark:bg-purple-600/15 rounded-full blur-[120px] pointer-events-none"
    ></div>
  </div>

  <!-- LAYOUT 1: AUTH / LOGIN (Tanpa Sidebar) -->
  <div
    v-if="route.path === '/login' || route.path === '/'"
    class="min-h-screen flex items-center justify-center p-4"
  >
    <router-view v-slot="{ Component }">
      <transition name="ios-fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>

  <!-- LAYOUT 2: MAIN DASHBOARD (Ada Sidebar & Header) -->
  <div v-else class="flex h-screen overflow-hidden">
    <!-- Mobile Header: iOS Glassmorphism -->
    <div
      class="md:hidden fixed top-0 left-0 right-0 h-[72px] bg-white/70 dark:bg-black/40 backdrop-blur-2xl border-b border-white/60 dark:border-white/5 z-20 flex items-center justify-between px-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)] transition-all"
    >
      <div class="flex items-center gap-3.5">
        <!-- Logo Match dengan Sidebar -->
        <div
          class="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-base font-extrabold shadow-[0_4px_12px_rgba(59,130,246,0.4)]"
        >
          S
        </div>
        <h1
          class="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 tracking-tight"
        >
          SAEduid
        </h1>
      </div>

      <!-- Hamburger Menu (Glass Style) -->
      <button
        @click="isMobileMenuOpen = true"
        class="p-2.5 bg-white/50 dark:bg-white/10 hover:bg-white/90 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 rounded-full border border-white/60 dark:border-white/5 backdrop-blur-md shadow-sm transition-all active:scale-95"
      >
        <Menu :size="20" stroke-width="2.5" />
      </button>
    </div>

    <!-- Sidebar Component -->
    <AppSidebar :isOpen="isMobileMenuOpen" @close="isMobileMenuOpen = false" />

    <!-- Main Content Area -->
    <main
      class="flex-1 overflow-y-auto scroll-smooth pt-[90px] md:pt-8 px-4 md:px-8 pb-8 relative z-10"
    >
      <router-view v-slot="{ Component }">
        <transition name="ios-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<style>
/* Animasi Transisi ala iOS (Fade + Slightly Scale) */
.ios-fade-enter-active,
.ios-fade-leave-active {
  transition:
    opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.ios-fade-enter-from {
  opacity: 0;
  transform: scale(0.98) translateY(10px);
}

.ios-fade-leave-to {
  opacity: 0;
  transform: scale(0.98) translateY(-10px);
}
</style>
