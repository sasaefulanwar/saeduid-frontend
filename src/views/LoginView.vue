<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import api from "../api/axios";
import { useAuthStore } from "../stores/auth";
import { Wallet, Mail, Eye, User } from "lucide-vue-next";
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
  <div class="min-h-screen w-full flex bg-white dark:bg-slate-900 font-sans">
    <div
      class="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 xl:px-32 relative py-12"
    >
      <div class="flex items-center gap-3 mb-10">
        <div
          class="w-10 h-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl flex items-center justify-center shadow-md"
        >
          <Wallet :size="22" stroke-width="2.5" />
        </div>
        <span
          class="text-xl font-bold text-slate-900 dark:text-white tracking-tight"
          >SAEduid</span
        >
      </div>

      <h1
        class="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight"
      >
        {{ isLoginMode ? "Welcome Back!" : "Create an Account" }}
      </h1>
      <p class="text-slate-500 dark:text-slate-400 text-sm mb-8">
        {{
          isLoginMode
            ? "We Are Happy To See You Again"
            : "Start managing your finances beautifully today"
        }}
      </p>

      <div class="w-full max-w-sm">
        <div
          class="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-full mb-8 border border-slate-200 dark:border-slate-700"
        >
          <button
            @click="isLoginMode = true"
            :class="
              isLoginMode
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            "
            class="flex-1 py-2.5 rounded-full text-sm font-semibold transition-all duration-300"
          >
            Sign in
          </button>
          <button
            @click="isLoginMode = false"
            :class="
              !isLoginMode
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            "
            class="flex-1 py-2.5 rounded-full text-sm font-semibold transition-all duration-300"
          >
            Sign Up
          </button>
        </div>

        <div class="space-y-4">
          <div v-if="!isLoginMode" class="relative group">
            <input
              v-model="name"
              type="text"
              placeholder="Enter your full name"
              class="w-full px-5 py-3.5 text-sm rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-400"
            />
            <User
              class="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
              :size="18"
            />
          </div>

          <div class="relative group">
            <input
              v-model="email"
              type="email"
              placeholder="Enter your email"
              class="w-full px-5 py-3.5 text-sm rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-400"
            />
            <Mail
              class="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
              :size="18"
            />
          </div>

          <div class="relative group">
            <input
              v-model="password"
              type="password"
              placeholder="Enter your password"
              class="w-full px-5 py-3.5 text-sm rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-400"
              @keyup.enter="submitForm"
            />
            <Eye
              class="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors cursor-pointer"
              :size="18"
            />
          </div>
        </div>

        <div class="flex items-center justify-between mt-4 mb-8">
          <label class="flex items-center gap-2 cursor-pointer">
            <div
              class="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20"
            >
              <div class="w-2 h-2 rounded-full bg-blue-500"></div>
            </div>
            <span class="text-sm text-slate-500 dark:text-slate-400"
              >Remember me</span
            >
          </label>
          <a href="#" class="text-sm text-blue-500 font-medium hover:underline"
            >Forgot Password?</a
          >
        </div>

        <button
          @click="submitForm"
          :disabled="isLoading"
          class="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3.5 px-4 rounded-full transition-all shadow-md active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
        >
          <span
            v-if="isLoading"
            class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
          ></span>
          <span>{{
            isLoading ? "Processing..." : isLoginMode ? "Login" : "Sign Up"
          }}</span>
        </button>

        <div class="flex items-center my-6">
          <div
            class="flex-grow border-t border-slate-200 dark:border-slate-700"
          ></div>
          <span
            class="px-4 text-slate-400 text-xs font-medium uppercase tracking-wider"
            >OR</span
          >
          <div
            class="flex-grow border-t border-slate-200 dark:border-slate-700"
          ></div>
        </div>

        <div
          class="flex justify-center w-full rounded-full overflow-hidden hover:opacity-90 transition-opacity ring-1 ring-slate-200 dark:ring-slate-700 bg-white dark:bg-slate-800"
        >
          <GoogleLogin
            :callback="callbackGoogle"
            prompt
            class="w-full flex justify-center py-1"
          />
        </div>
      </div>
    </div>

    <div class="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
        alt="Abstract Liquid"
        class="absolute inset-0 w-full h-full object-cover opacity-90 mix-blend-screen"
      />

      <div
        class="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-4/5 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 p-5 text-center text-xs text-white/80 shadow-2xl"
      >
        <p class="font-medium mb-1">© 2026 SAEduid. All rights reserved.</p>
        <p class="opacity-75">
          Unauthorized use or reproduction of any content or materials from this
          platform is prohibited. For more information, visit our Terms of
          Service and Privacy Policy.
        </p>
      </div>
    </div>
  </div>
</template>
