<script setup>
import { useRoute } from "vue-router";
import AppSidebar from "./components/AppSidebar.vue";

const route = useRoute();
</script>

<template>
  <div
    v-if="route.path === '/login' || route.path === '/'"
    class="min-h-screen bg-slate-100 flex items-center justify-center font-sans text-slate-800"
  >
    <router-view />
  </div>

  <div
    v-else
    class="flex h-screen bg-slate-100 font-sans text-slate-800 overflow-hidden"
  >
    <AppSidebar />

    <div class="flex-1 overflow-y-auto p-8">
      <router-view />
    </div>
  </div>
</template>
