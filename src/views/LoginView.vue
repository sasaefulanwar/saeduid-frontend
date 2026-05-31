<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import api from "../api/axios";
import { useAuthStore } from "../stores/auth";
import { Wallet } from "lucide-vue-next";
import { toast } from "vue3-toastify";

const router = useRouter();
const authStore = useAuthStore();

const isLoginMode = ref(true); // Toggle antara Login & Register
const name = ref("");
const email = ref("");
const password = ref("");
const isLoading = ref(false);

const submitForm = async () => {
  try {
    isLoading.value = true;
    if (isLoginMode.value) {
      const res = await api.post("/auth/login", {
        email: email.value,
        password: password.value,
      });
      authStore.setToken(res.data.token);
      toast.success("Login berhasil! Selamat datang."); // Toast Sukses
      router.push("/dashboard");
    } else {
      await api.post("/auth/register", {
        name: name.value,
        email: email.value,
        password: password.value,
      });
      toast.success("Registrasi berhasil! Silakan login."); // Toast Sukses
      isLoginMode.value = true;
      return;
    }
  } catch (err) {
    // Toast Error
    toast.error(err.response?.data?.error || "Terjadi kesalahan");
  } finally {
    isLoading.value = false;
  }
};

const callbackGoogle = async (response) => {
  try {
    isLoading.value = true;
    const res = await api.post("/auth/google", {
      id_token: response.credential,
    });
    authStore.setToken(res.data.token);

    toast.success("Login Google berhasil!"); // Toast Sukses
    router.push("/dashboard");
  } catch (err) {
    console.error("Google Auth Error:", err);
    toast.error(err.response?.data?.error || "Gagal login dengan Google"); // Toast Error
  } finally {
    isLoading.value = false;
  }
};

const loginWithGoogle = () => {
  // Arahkan ke endpoint Google Auth backend lu
  // Nanti backend redirect balik bawa token
  window.location.href =
    "http://saeduid-backend-production.up.railway.app/api/v1/auth/google";
};
</script>

<template>
  <div
    class="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-10 transition-colors border border-slate-100 dark:border-slate-700"
  >
    <div class="flex flex-col items-center mb-8">
      <div
        class="w-16 h-16 bg-blue-600 dark:bg-blue-500 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg"
      >
        <Wallet :size="32" />
      </div>
      <h1 class="text-3xl font-bold text-slate-900 dark:text-white">
        {{ isLoginMode ? "Welcome Back" : "Create Account" }}
      </h1>
      <p class="text-slate-500 dark:text-slate-400 mt-2 text-center">
        {{
          isLoginMode
            ? "Masuk ke akun SAEduid kamu"
            : "Mulai atur keuanganmu hari ini"
        }}
      </p>
    </div>

    <div class="space-y-5">
      <div v-if="!isLoginMode">
        <label
          class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
          >Nama Lengkap</label
        >
        <input
          v-model="name"
          type="text"
          placeholder="John Doe"
          class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        />
      </div>

      <div>
        <label
          class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
          >Email</label
        >
        <input
          v-model="email"
          type="email"
          placeholder="budi@example.com"
          class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        />
      </div>

      <div>
        <label
          class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
          >Password</label
        >
        <input
          v-model="password"
          type="password"
          placeholder="••••••••"
          class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          @keyup.enter="submitForm"
        />
      </div>

      <button
        @click="submitForm"
        :disabled="isLoading"
        class="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md mt-2 disabled:opacity-70"
      >
        {{ isLoading ? "Memproses..." : isLoginMode ? "Login" : "Daftar" }}
      </button>

      <!-- Divider -->
      <div class="flex items-center my-4">
        <div
          class="flex-grow border-t border-slate-200 dark:border-slate-700"
        ></div>
        <span class="px-3 text-slate-400 dark:text-slate-500 text-sm"
          >Atau</span
        >
        <div
          class="flex-grow border-t border-slate-200 dark:border-slate-700"
        ></div>
      </div>

      <!-- Google Button Wrapper -->
      <div
        class="flex justify-center w-full rounded-xl overflow-hidden bg-white dark:bg-slate-800"
      >
        <GoogleLogin :callback="callbackGoogle" prompt class="w-full" />
      </div>

      <!-- Toggle Login/Register -->
      <p class="text-center text-sm text-slate-600 dark:text-slate-400 mt-4">
        {{ isLoginMode ? "Belum punya akun?" : "Sudah punya akun?" }}
        <button
          @click="isLoginMode = !isLoginMode"
          class="text-blue-600 dark:text-blue-400 font-semibold hover:underline transition-colors"
        >
          {{ isLoginMode ? "Daftar sekarang" : "Login di sini" }}
        </button>
      </p>
    </div>
  </div>
</template>
