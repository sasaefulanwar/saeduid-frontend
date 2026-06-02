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
  <div class="max-w-3xl mx-auto px-4 sm:px-6 py-8 font-sans pb-16">
    <div class="mb-10 border-l-4 border-slate-800 pl-4 dark:border-slate-300">
      <h1
        class="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl"
      >
        Profil Saya
      </h1>
      <p
        class="mt-1.5 text-[15px] text-slate-500 dark:text-slate-400 font-medium"
      >
        Kelola informasi akun personalmu dengan aman dan rapi.
      </p>
    </div>

    <div
      v-if="!user"
      class="text-center py-20 flex flex-col items-center justify-center gap-3"
    >
      <div
        class="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"
      ></div>
      <span class="text-slate-500 dark:text-slate-400 font-medium"
        >Memuat profil...</span
      >
    </div>

    <div
      v-else
      class="relative bg-white/70 dark:bg-black/40 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)] border border-white/80 dark:border-white/10 overflow-hidden transition-all duration-300"
    >
      <div
        class="h-36 sm:h-44 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 relative overflow-hidden"
      >
        <div
          class="absolute inset-0 bg-white/10 dark:bg-black/10 backdrop-blur-[2px]"
        ></div>
        <div
          class="absolute -bottom-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"
        ></div>
      </div>

      <div class="px-6 sm:px-10 pb-10 relative z-10">
        <div
          class="flex flex-col sm:flex-row sm:justify-between sm:items-end -mt-16 sm:-mt-20 mb-8 gap-4"
        >
          <div
            @click="triggerFileInput"
            class="relative w-32 h-32 rounded-full bg-white/50 dark:bg-slate-800/50 p-2 shadow-xl cursor-pointer group transition-transform duration-300 hover:scale-105 backdrop-blur-md ring-4 ring-white/80 dark:ring-black/30"
          >
            <div
              class="w-full h-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700 shadow-inner"
            >
              <img
                v-if="user?.avatar_url"
                :src="user.avatar_url"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-extrabold text-5xl uppercase shadow-[inset_0_-2px_10px_rgba(0,0,0,0.2)]"
              >
                {{ user?.name?.charAt(0) }}
              </div>
            </div>

            <div
              class="absolute inset-2 rounded-full bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300"
            >
              <Camera
                class="text-white drop-shadow-md"
                :size="28"
                stroke-width="2.5"
              />
            </div>
          </div>

          <input
            type="file"
            ref="fileInput"
            class="hidden"
            accept="image/*"
            @change="handleFileUpload"
          />

          <button
            @click="isEditing ? cancelEdit() : (isEditing = true)"
            :class="[
              'px-5 py-2.5 rounded-full text-[14px] font-bold flex items-center gap-2 transition-all duration-300 shadow-sm self-start sm:self-auto mt-2 sm:mt-0',
              isEditing
                ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 hover:bg-rose-100 dark:hover:bg-rose-500/20'
                : 'bg-white/80 dark:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/20',
            ]"
          >
            <component
              :is="isEditing ? X : Edit3"
              :size="16"
              stroke-width="2.5"
            />
            {{ isEditing ? "Batal Edit" : "Edit Profil" }}
          </button>
        </div>

        <div class="mb-10 pl-2">
          <div
            v-if="!isEditing"
            class="animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            <h2
              class="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1.5"
            >
              {{ user.name }}
            </h2>
            <p
              class="text-[15px] text-slate-500 dark:text-slate-400 flex items-center gap-2 font-medium"
            >
              <Mail :size="16" /> {{ user.email }}
            </p>
          </div>

          <div
            v-else
            class="max-w-md mt-1 animate-in fade-in slide-in-from-left-4 duration-300"
          >
            <label
              class="block text-[13px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1"
              >Nama Lengkap</label
            >
            <div class="relative group">
              <input
                v-model="editName"
                class="w-full pl-5 pr-16 py-3.5 text-[15px] font-bold rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                @keyup.enter="saveProfile"
              />
              <button
                @click="saveProfile"
                :disabled="isLoading"
                class="absolute right-1.5 top-1.5 bottom-1.5 aspect-square flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                <div
                  v-if="isLoading"
                  class="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"
                ></div>
                <Save v-else :size="18" stroke-width="2.5" />
              </button>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            class="flex items-center justify-between p-5 rounded-2xl bg-white/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] transition-colors group hover:bg-white/80 dark:hover:bg-white/10"
          >
            <div class="flex items-center gap-3.5">
              <div
                class="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center border border-blue-100 dark:border-blue-500/20 text-blue-500"
              >
                <Hash :size="18" stroke-width="2.5" />
              </div>
              <span
                class="text-[15px] font-bold text-slate-700 dark:text-slate-300"
                >User ID</span
              >
            </div>
            <span
              class="font-mono text-[13px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3.5 py-1.5 rounded-full border border-slate-200/80 dark:border-slate-700"
            >
              {{ user.id }}
            </span>
          </div>

          <div
            class="flex items-center justify-between p-5 rounded-2xl bg-white/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] transition-colors group hover:bg-white/80 dark:hover:bg-white/10"
          >
            <div class="flex items-center gap-3.5">
              <div
                class="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20 text-emerald-500"
              >
                <ShieldCheck :size="18" stroke-width="2.5" />
              </div>
              <span
                class="text-[15px] font-bold text-slate-700 dark:text-slate-300"
                >Provider</span
              >
            </div>
            <span
              class="px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/30 text-[11px] font-extrabold uppercase tracking-widest"
            >
              {{ user.provider }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
