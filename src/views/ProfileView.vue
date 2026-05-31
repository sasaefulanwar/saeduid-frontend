<script setup>
import { ref, onMounted } from "vue";
import api from "../api/axios";

const user = ref(null);

const loadProfile = async () => {
  try {
    const res = await api.get("/profile");
    user.value = res.data;
  } catch (err) {
    console.error(err);
  }
};

onMounted(loadProfile);
</script>

<template>
  <div class="min-h-screen bg-slate-100 p-8">
    <div
      v-if="user"
      class="max-w-2xl mx-auto bg-white rounded-3xl shadow-lg p-8"
    >
      <div class="flex flex-col items-center">
        <div
          class="w-28 h-28 rounded-full bg-blue-600 text-white flex items-center justify-center text-4xl font-bold"
        >
          {{ user.name.charAt(0) }}
        </div>

        <h1 class="text-3xl font-bold mt-4">
          {{ user.name }}
        </h1>

        <p class="text-gray-500">
          {{ user.email }}
        </p>
      </div>

      <div class="mt-8 space-y-4">
        <div class="flex justify-between border-b pb-3">
          <span>User ID</span>
          <span class="font-medium">
            {{ user.id }}
          </span>
        </div>

        <div class="flex justify-between border-b pb-3">
          <span>Provider</span>
          <span
            class="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm"
          >
            {{ user.provider }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
