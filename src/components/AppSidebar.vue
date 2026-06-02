<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../stores/auth";
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  FolderOpen,
  User,
  LogOut,
  X,
  Moon,
  Sun,
  Sparkles,
} from "lucide-vue-next";

const props = defineProps({ isOpen: Boolean });
const emit = defineEmits(["close"]);

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const isDark = ref(false);

onMounted(() => {
  if (
    localStorage.getItem("theme") === "dark" ||
    (!("theme" in localStorage) &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    isDark.value = true;
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
});

const toggleDark = () => {
  isDark.value = !isDark.value;
  if (isDark.value) {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }
};

const logout = () => {
  authStore.logout();
  router.push("/login");
};

const menus = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Transactions", path: "/transactions", icon: ArrowLeftRight },
  { name: "Budgets", path: "/budgets", icon: PieChart },
  { name: "Categories", path: "/categories", icon: FolderOpen },
  { name: "AI Assistant", path: "/ai", icon: Sparkles },
  { name: "Profile", path: "/profile", icon: User },
];
</script>

<template>
  <div>
    <!-- Mobile Overlay (Lebih blur dan estetik) -->
    <div
      v-if="isOpen"
      @click="emit('close')"
      class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 md:hidden transition-all duration-300"
    ></div>

    <!-- Sidebar Container: iOS Glassmorphism 🪟✨ -->
    <aside
      :class="[
        'fixed md:sticky top-0 left-0 z-40 w-64 h-screen bg-white/70 dark:bg-black/40 backdrop-blur-2xl border-r border-white/60 dark:border-white/5 flex flex-col transition-transform duration-300 ease-in-out shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-[4px_0_32px_rgba(0,0,0,0.2)]',
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      ]"
    >
      <!-- Header / Logo Area -->
      <div
        class="h-24 flex items-center justify-between px-6 border-b border-slate-200/50 dark:border-slate-700/30"
      >
        <div class="flex items-center gap-3.5">
          <!-- Logo Magis (Glowing Gradient) -->
          <div
            class="w-10 h-10 rounded-[1rem] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-extrabold shadow-[0_4px_12px_rgba(59,130,246,0.4)]"
          >
            S
          </div>
          <span
            class="text-[22px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 tracking-tight"
          >
            SAEduid
          </span>
        </div>

        <!-- Close Button (Mobile) -->
        <button
          @click="emit('close')"
          class="md:hidden p-2 rounded-full bg-white/50 dark:bg-white/10 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <X :size="20" stroke-width="2.5" />
        </button>
      </div>

      <!-- Menu Navigation -->
      <nav class="flex-1 overflow-y-auto py-6 px-4 space-y-1.5">
        <router-link
          v-for="menu in menus"
          :key="menu.path"
          :to="menu.path"
          @click="emit('close')"
          :class="[
            'group flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-300 font-semibold text-[14px]',
            route.path === menu.path
              ? 'text-blue-600 dark:text-white bg-white/80 dark:bg-white/10 shadow-[inset_0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]'
              : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-slate-200',
          ]"
        >
          <!-- Menu Icon -->
          <component
            :is="menu.icon"
            :size="20"
            stroke-width="2.5"
            :class="[
              'transition-colors duration-300',
              route.path === menu.path
                ? 'text-blue-500 dark:text-blue-400'
                : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300',
            ]"
          />
          {{ menu.name }}

          <!-- Active Dot Indicator (Ala Apple) -->
          <div
            v-if="route.path === menu.path"
            class="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 shadow-sm shadow-blue-500/50"
          ></div>
        </router-link>
      </nav>

      <!-- Footer Actions -->
      <div
        class="p-4 border-t border-slate-200/50 dark:border-slate-700/30 space-y-2"
      >
        <!-- Toggle Dark/Light Mode (iOS Style Switch) -->
        <button
          @click="toggleDark"
          class="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-[14px] text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-white/5 transition-all font-semibold group"
        >
          <div class="flex items-center gap-3.5">
            <Moon
              v-if="isDark"
              :size="20"
              stroke-width="2.5"
              class="text-indigo-400 group-hover:scale-110 transition-transform"
            />
            <Sun
              v-else
              :size="20"
              stroke-width="2.5"
              class="text-amber-500 group-hover:scale-110 transition-transform"
            />
            <span>{{ isDark ? "Dark Mode" : "Light Mode" }}</span>
          </div>

          <!-- Switch Kaca -->
          <div
            :class="[
              'w-11 h-6 rounded-full relative transition-colors duration-300 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]',
              isDark ? 'bg-indigo-500' : 'bg-slate-200/80 dark:bg-slate-700/50',
            ]"
          >
            <div
              :class="[
                'w-4 h-4 rounded-full bg-white absolute top-1 shadow-sm transition-transform duration-300 ease-out',
                isDark ? 'translate-x-6' : 'translate-x-1',
              ]"
            ></div>
          </div>
        </button>

        <!-- Logout Button (Subtle & Elegant) -->
        <button
          @click="logout"
          class="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-[14px] text-rose-500/90 dark:text-rose-400 hover:bg-rose-50/80 dark:hover:bg-rose-500/10 transition-all font-semibold group"
        >
          <LogOut
            :size="20"
            stroke-width="2.5"
            class="transition-transform group-hover:-translate-x-1"
          />
          Log Out
        </button>
      </div>
    </aside>
  </div>
</template>
