<script setup>
import { ref, onMounted } from "vue";
import api from "../api/axios";
import { Mail, Hash, ShieldCheck, User } from "lucide-vue-next"; // Tambahin icon biar cakep

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
  <div class="max-w-3xl mx-auto">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-slate-900">Profil Saya 👤</h1>
      <p class="text-slate-500 mt-1">Kelola informasi akun personalmu.</p>
    </div>

    <!-- Loading State -->
    <div
      v-if="!user"
      class="text-center py-20 bg-white rounded-3xl border border-slate-200 text-slate-400 shadow-sm"
    >
      Memuat data profil...
    </div>

    <!-- Profile Card -->
    <div
      v-else
      class="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden"
    >
      <!-- Cover Background (Gradien) -->
      <div class="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

      <div class="px-8 pb-8">
        <!-- Avatar Section (Narik ke atas ngelewatin batas cover) -->
        <div class="relative flex justify-between items-end -mt-12 mb-6">
          <div class="w-24 h-24 rounded-full bg-white p-1.5 shadow-md">
            <div
              class="w-full h-full rounded-full bg-blue-600 text-white flex items-center justify-center text-4xl font-bold uppercase"
            >
              {{ user.name.charAt(0) }}
            </div>
          </div>

          <!-- Tombol Edit (Opsional buat ke depannya) -->
          <button
            class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-4 rounded-xl transition-colors text-sm flex items-center gap-2"
          >
            <User :size="16" /> Edit Profil
          </button>
        </div>

        <!-- Info User -->
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-slate-900">{{ user.name }}</h2>
          <p class="text-slate-500 flex items-center gap-2 mt-1">
            <Mail :size="16" /> {{ user.email }}
          </p>
        </div>

        <!-- Detail Akun List -->
        <div class="space-y-4">
          <h3
            class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2"
          >
            Detail Akun
          </h3>

          <div
            class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors"
          >
            <div class="flex items-center gap-3 text-slate-600">
              <Hash :size="20" class="text-blue-500" />
              <span class="font-medium">User ID</span>
            </div>
            <span class="font-semibold text-slate-900 font-mono">{{
              user.id
            }}</span>
          </div>

          <div
            class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors"
          >
            <div class="flex items-center gap-3 text-slate-600">
              <ShieldCheck :size="20" class="text-green-500" />
              <span class="font-medium">Authentication Provider</span>
            </div>
            <span
              class="px-4 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wide"
            >
              {{ user.provider }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
