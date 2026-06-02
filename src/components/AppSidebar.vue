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
  Sparkles, // 🔥 Tambahin ini
} from "lucide-vue-next";

// Props dari App.vue buat mode Mobile
const props = defineProps({ isOpen: Boolean });
const emit = defineEmits(["close"]);

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// ==========================================
// 🔥 FUNGSI DARK MODE
// ==========================================
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

// 🔥 Menu sudah terintegrasi rapi
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
    <div
      v-if="isOpen"
      @click="emit('close')"
      class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 md:hidden transition-opacity"
    ></div>

    <aside
      :class="[
        'fixed md:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out',
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      ]"
    >
      <div
        class="h-20 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-md shadow-blue-500/20"
          >
            S
          </div>
          <span
            class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight"
            >SAEduid</span
          >
        </div>
        <button
          @click="emit('close')"
          class="md:hidden text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X :size="24" />
        </button>
      </div>

      <!-- Menu Navigation -->
      <nav class="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        <router-link
          v-for="menu in menus"
          :key="menu.path"
          :to="menu.path"
          @click="emit('close')"
          :class="[
            'flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium',
            route.path === menu.path
              ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100',
          ]"
        >
          <component :is="menu.icon" :size="20" />
          {{ menu.name }}
        </router-link>
      </nav>

      <!-- Footer Actions -->
      <div
        class="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2"
      >
        <button
          @click="toggleDark"
          class="w-full flex items-center justify-between px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
        >
          <div class="flex items-center gap-3">
            <Moon v-if="isDark" :size="20" class="text-indigo-400" />
            <Sun v-else :size="20" class="text-amber-500" />
            <span>{{ isDark ? "Dark Mode" : "Light Mode" }}</span>
          </div>
          <div
            :class="[
              'w-10 h-5 rounded-full relative transition-colors',
              isDark ? 'bg-blue-600' : 'bg-slate-300',
            ]"
          >
            <div
              :class="[
                'w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform',
                isDark ? 'translate-x-5' : 'translate-x-1',
              ]"
            ></div>
          </div>
        </button>

        <button
          @click="logout"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors font-medium"
        >
          <LogOut :size="20" />
          Log Out
        </button>
      </div>
    </aside>
  </div>
</template>
