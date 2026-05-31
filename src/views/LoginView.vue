<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import api from "../api/axios";
import { useAuthStore } from "../stores/auth";
import { Wallet } from "lucide-vue-next";

const email = ref("");
const password = ref("");
const router = useRouter();
const authStore = useAuthStore();
const isLoading = ref(false);

const login = async () => {
  try {
    isLoading.value = true;
    const res = await api.post("/auth/login", {
      email: email.value,
      password: password.value,
    });
    authStore.setToken(res.data.token);
    router.push("/dashboard");
  } catch (err) {
    alert(err.response?.data?.error || "Login gagal");
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="w-full max-w-md bg-white rounded-3xl shadow-xl p-10">
    <div class="flex flex-col items-center mb-8">
      <div
        class="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg"
      >
        <Wallet :size="32" />
      </div>
      <h1 class="text-3xl font-bold text-slate-900">SAEduid</h1>
      <p class="text-slate-500 mt-2">Masuk untuk kelola keuanganmu</p>
    </div>

    <div class="space-y-5">
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1"
          >Email</label
        >
        <input
          v-model="email"
          type="email"
          placeholder="budi@example.com"
          class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1"
          >Password</label
        >
        <input
          v-model="password"
          type="password"
          placeholder="••••••••"
          class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          @keyup.enter="login"
        />
      </div>

      <button
        @click="login"
        :disabled="isLoading"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed mt-2"
      >
        {{ isLoading ? "Memuat..." : "Login" }}
      </button>
    </div>
  </div>
</template>
