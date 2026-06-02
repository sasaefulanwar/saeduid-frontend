<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import api from "../api/axios";
import { useAuthStore } from "../stores/auth";
import { Wallet, Mail, Eye, User, EyeOff } from "lucide-vue-next";
import { toast } from "vue3-toastify";

const router = useRouter();
const authStore = useAuthStore();
const showPassword = ref(false);
const rememberMe = ref(false);

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
    class="min-h-screen w-full flex bg-slate-50 dark:bg-[#09090b] font-sans overflow-hidden"
  >
    <!-- Left Side: Login Form Area -->
    <div
      class="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 md:px-20 xl:px-28 relative py-12"
    >
      <div
        class="absolute -top-[20%] -left-[10%] w-[80%] h-[80%] bg-blue-400/20 dark:bg-blue-600/15 rounded-full blur-[120px] pointer-events-none"
      ></div>

      <div
        class="w-full max-w-lg mx-auto bg-white/70 dark:bg-black/40 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)] border border-white/80 dark:border-white/10 p-8 sm:p-10 lg:p-12 relative overflow-hidden group transition-all"
      >
        <div
          class="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl pointer-events-none transition-transform duration-1000 group-hover:scale-110"
        ></div>

        <div class="relative z-10 flex flex-col">
          <div class="flex items-center gap-3.5 mb-10">
            <div
              class="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-[0_4px_12px_rgba(59,130,246,0.4)]"
            >
              <Wallet :size="22" stroke-width="2.5" />
            </div>
            <span
              class="text-[24px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 tracking-tight"
            >
              SAEduid
            </span>
          </div>

          <div class="mb-8 w-full">
            <h1
              class="text-3xl font-extrabold text-slate-800 dark:text-white mb-2.5 tracking-tight"
            >
              {{ isLoginMode ? "Welcome Back!" : "Create an Account" }}
            </h1>
            <p
              class="text-[15px] text-slate-500 dark:text-slate-400 font-medium ml-0.5"
            >
              {{
                isLoginMode
                  ? "We are happy to see you again."
                  : "Start managing your finances beautifully today."
              }}
            </p>
          </div>

          <div class="w-full">
            <div
              class="flex p-1.5 bg-slate-200/50 dark:bg-slate-800/40 backdrop-blur-md rounded-2xl mb-8 border border-white/60 dark:border-white/5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]"
            >
              <button
                @click="isLoginMode = true"
                :class="
                  isLoginMode
                    ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                "
                class="flex-1 py-2.5 rounded-xl text-[14px] font-bold transition-all duration-300"
              >
                Sign In
              </button>
              <button
                @click="isLoginMode = false"
                :class="
                  !isLoginMode
                    ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                "
                class="flex-1 py-2.5 rounded-xl text-[14px] font-bold transition-all duration-300"
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
                  class="w-full px-5 py-3.5 pr-12 text-[15px] rounded-2xl border border-slate-200/80 dark:border-white/5 bg-white/50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-blue-500/40 transition-all duration-300 placeholder-slate-400 shadow-[inset_0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
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
                  class="w-full px-5 py-3.5 pr-12 text-[15px] rounded-2xl border border-slate-200/80 dark:border-white/5 bg-white/50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-blue-500/40 transition-all duration-300 placeholder-slate-400 shadow-[inset_0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                />
                <Mail
                  class="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                  :size="18"
                />
              </div>

              <div class="relative group">
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Enter your password"
                  class="w-full px-5 py-3.5 pr-12 text-[15px] rounded-2xl border border-slate-200/80 dark:border-white/5 bg-white/50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-blue-500/40 transition-all duration-300 placeholder-slate-400 shadow-[inset_0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                  @keyup.enter="submitForm"
                />

                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-0 top-0 h-full px-5 text-slate-400 group-focus-within:text-blue-500 hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex items-center justify-center focus:outline-none"
                >
                  <component :is="showPassword ? EyeOff : Eye" :size="18" />
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between mt-5 mb-8">
              <label class="flex items-center gap-2.5 cursor-pointer group">
                <input type="checkbox" v-model="rememberMe" class="hidden" />

                <div
                  :class="[
                    'w-4 h-4 rounded border flex items-center justify-center transition-colors duration-300',
                    rememberMe
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
                      : 'border-slate-300/80 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 group-hover:border-blue-400',
                  ]"
                >
                  <div
                    :class="[
                      'w-2 h-2 rounded-[2px] bg-blue-500 transition-all duration-300',
                      rememberMe
                        ? 'opacity-100 scale-100'
                        : 'opacity-0 scale-0',
                    ]"
                  ></div>
                </div>

                <span
                  class="text-[13px] font-medium text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors"
                >
                  Remember me
                </span>
              </label>
              <a
                href="#"
                class="text-[13px] font-bold text-blue-500 hover:text-blue-600 transition-colors"
              >
                Forgot Password?
              </a>
            </div>

            <button
              @click="submitForm"
              :disabled="isLoading"
              class="w-full text-[15px] font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3.5 px-4 rounded-2xl transition-all duration-300 shadow-[0_4px_16px_rgba(59,130,246,0.3)] hover:shadow-[0_4px_20px_rgba(59,130,246,0.5)] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 flex justify-center items-center gap-2"
            >
              <span
                v-if="isLoading"
                class="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"
              ></span>
              <span>{{
                isLoading
                  ? "Processing..."
                  : isLoginMode
                    ? "Sign In"
                    : "Create Account"
              }}</span>
            </button>

            <div class="flex items-center my-7">
              <div
                class="flex-grow border-t border-slate-200/80 dark:border-slate-700/50"
              ></div>
              <span
                class="px-4 text-slate-400 text-[11px] font-bold uppercase tracking-widest"
              >
                Or continue with
              </span>
              <div
                class="flex-grow border-t border-slate-200/80 dark:border-slate-700/50"
              ></div>
            </div>

            <div
              class="flex justify-center w-full rounded-2xl overflow-hidden hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300 border border-slate-200/80 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-sm shadow-sm"
            >
              <GoogleLogin
                :callback="callbackGoogle"
                prompt
                class="w-full flex justify-center py-1.5 opacity-90 hover:opacity-100 transition-opacity"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Side: Image Banner Area -->
    <div class="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
      <!-- Gradient overlay biar gambar gak terlalu terang -->
      <div
        class="absolute inset-0 bg-gradient-to-bl from-transparent via-slate-900/50 to-slate-900 z-10 pointer-events-none"
      ></div>

      <img
        src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
        alt="Abstract Liquid"
        class="absolute inset-0 w-full h-full object-cover opacity-90 mix-blend-screen scale-105"
      />

      <!-- Floating Footer Info (Kaca Premium) -->
      <div
        class="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-4/5 max-w-lg rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 text-center z-20 shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
      >
        <p class="text-[13px] font-bold text-white mb-1.5 tracking-wide">
          © 2026 SAEduid. All rights reserved.
        </p>
        <p class="text-[12px] text-white/70 font-medium leading-relaxed">
          Unauthorized use or reproduction of any content or materials from this
          platform is prohibited. For more information, visit our Terms of
          Service and Privacy Policy.
        </p>
      </div>
    </div>
  </div>
</template>
