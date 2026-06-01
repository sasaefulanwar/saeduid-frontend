<script setup>
import { ref, onMounted } from "vue";
import api from "../api/axios";
import { toast } from "vue3-toastify";
import {
  Mail,
  Hash,
  ShieldCheck,
  User,
  Check,
  X,
  Camera,
  Edit3,
  Save,
  UserCircle,
} from "lucide-vue-next";

const user = ref(null);
const isEditing = ref(false);
const editName = ref("");
const isLoading = ref(false);
const fileInput = ref(null);
const isUploadingAvatar = ref(false);

const loadProfile = async () => {
  try {
    const res = await api.get("/auth/profile");
    user.value = res.data;
    editName.value = res.data.name;
  } catch (err) {
    console.error("Gagal memuat profil:", err);
    toast.error("Gagal memuat data profil");
  }
};

const saveProfile = async () => {
  if (!editName.value.trim()) {
    toast.warning("Nama tidak boleh kosong cuy!");
    return;
  }
  try {
    isLoading.value = true;
    await api.put("/auth/profile", { name: editName.value });
    user.value.name = editName.value;
    isEditing.value = false;
    toast.success("Profil berhasil diupdate! 🎉");
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.error || "Gagal mengupdate profil");
  } finally {
    isLoading.value = false;
  }
};

const cancelEdit = () => {
  isEditing.value = false;
  editName.value = user.value.name;
};

const triggerFileInput = () => fileInput.value.click();

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    toast.error("Ukuran gambar maksimal 2MB cuy!");
    return;
  }
  const formData = new FormData();
  formData.append("avatar", file);
  try {
    isUploadingAvatar.value = true;
    const res = await api.post("/auth/profile/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    user.value.avatar_url = res.data.avatar_url;
    toast.success("Foto profil berhasil diganti! 📸");
  } catch (err) {
    toast.error("Gagal mengupload foto");
  } finally {
    isUploadingAvatar.value = false;
  }
};

onMounted(loadProfile);
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-8 font-sans">
    <div class="mb-10">
      <h1
        class="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight"
      >
        Profil Saya 👤
      </h1>
      <p class="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">
        Kelola informasi akun personalmu dengan rapi.
      </p>
    </div>

    <div v-if="!user" class="text-center py-20 text-slate-400">
      Loading profil...
    </div>

    <div
      v-else
      class="bg-white dark:bg-slate-800/90 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700/60 overflow-hidden backdrop-blur-sm transition-colors"
    >
      <!-- Cover Banner -->
      <div class="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

      <div class="px-8 pb-10">
        <!-- Avatar Section -->
        <div class="relative flex justify-between items-end -mt-12 mb-6">
          <div
            @click="triggerFileInput"
            class="relative w-28 h-28 rounded-full bg-white dark:bg-slate-800 p-2 shadow-lg cursor-pointer group transition-transform hover:scale-105"
          >
            <div
              class="w-full h-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700"
            >
              <img
                v-if="user?.avatar_url"
                :src="user.avatar_url"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center bg-blue-500 text-white font-bold text-4xl uppercase"
              >
                {{ user?.name?.charAt(0) }}
              </div>
            </div>
            <div
              class="absolute inset-2 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"
            >
              <Camera class="text-white" :size="24" />
            </div>
          </div>

          <input
            type="file"
            ref="fileInput"
            class="hidden"
            accept="image/*"
            @change="handleFileUpload"
          />

          <!-- Edit Toggle Button -->
          <button
            @click="isEditing ? cancelEdit() : (isEditing = true)"
            :class="[
              isEditing
                ? 'bg-rose-100 text-rose-600'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200',
            ]"
            class="px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all hover:opacity-90"
          >
            <component :is="isEditing ? X : Edit3" :size="16" />
            {{ isEditing ? "Batal" : "Edit Profil" }}
          </button>
        </div>

        <!-- Name Section -->
        <div class="mb-10">
          <div v-if="!isEditing">
            <h2
              class="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight"
            >
              {{ user.name }}
            </h2>
            <p class="text-slate-500 flex items-center gap-2 mt-2 font-medium">
              <Mail :size="16" /> {{ user.email }}
            </p>
          </div>

          <div v-else class="flex items-center gap-3 max-w-sm mt-1">
            <input
              v-model="editName"
              class="w-full px-5 py-3 text-sm rounded-full border border-blue-300 dark:border-blue-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            <button
              @click="saveProfile"
              :disabled="isLoading"
              class="bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-full transition-all shadow-lg shadow-blue-500/30"
            >
              <Save :size="18" />
            </button>
          </div>
        </div>

        <!-- Details Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            class="flex items-center justify-between p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700"
          >
            <div
              class="flex items-center gap-3 text-slate-600 dark:text-slate-300 font-bold text-sm"
            >
              <Hash :size="20" class="text-blue-500" /> User ID
            </div>
            <span
              class="font-mono text-xs font-semibold bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200"
              >{{ user.id }}</span
            >
          </div>
          <div
            class="flex items-center justify-between p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700"
          >
            <div
              class="flex items-center gap-3 text-slate-600 dark:text-slate-300 font-bold text-sm"
            >
              <ShieldCheck :size="20" class="text-emerald-500" /> Provider
            </div>
            <span
              class="px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest"
              >{{ user.provider }}</span
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
