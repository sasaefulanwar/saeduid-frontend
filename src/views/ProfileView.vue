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
} from "lucide-vue-next";

const user = ref(null);
const isEditing = ref(false);
const editName = ref("");
const isLoading = ref(false);

// State untuk Upload Foto
const fileInput = ref(null);
const isUploadingAvatar = ref(false);

const loadProfile = async () => {
  try {
    const res = await api.get("/auth/profile");
    user.value = res.data;
    editName.value = res.data.name; // Set data awal buat form edit
  } catch (err) {
    console.error("Gagal memuat profil:", err);
    toast.error("Gagal memuat data profil");
  }
};

// ==========================================
// 🔥 FUNGSI EDIT NAMA PROFIL
// ==========================================
const saveProfile = async () => {
  if (!editName.value.trim()) {
    toast.warning("Nama tidak boleh kosong cuy!");
    return;
  }

  try {
    isLoading.value = true;
    await api.put("/auth/profile", { name: editName.value });

    // Update state UI biar langsung ganti tanpa refresh
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

// ==========================================
// 🔥 FUNGSI UPLOAD FOTO PROFIL
// ==========================================
const triggerFileInput = () => {
  fileInput.value.click();
};

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validasi ukuran max 2MB
  if (file.size > 2 * 1024 * 1024) {
    toast.error("Ukuran gambar maksimal 2MB cuy!");
    event.target.value = null;
    return;
  }

  const formData = new FormData();
  formData.append("avatar", file);

  try {
    isUploadingAvatar.value = true;
    toast.info("Sedang mengupload gambar...");

    const res = await api.post("/auth/profile/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // Update state gambar langsung di UI
    user.value.avatar_url = res.data.avatar_url;
    toast.success("Foto profil berhasil diganti! 📸");
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.error || "Gagal mengupload foto");
  } finally {
    isUploadingAvatar.value = false;
    event.target.value = null; // Reset input biar bisa pilih foto yg sama lagi
  }
};

onMounted(loadProfile);
</script>

<template>
  <div class="max-w-3xl mx-auto">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-slate-900 dark:text-white">
        Profil Saya 👤
      </h1>
      <p class="text-slate-500 dark:text-slate-400 mt-1">
        Kelola informasi akun personalmu.
      </p>
    </div>

    <div
      v-if="!user"
      class="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 shadow-sm transition-colors"
    >
      Memuat data profil...
    </div>

    <div
      v-else
      class="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors"
    >
      <div
        class="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-900"
      ></div>

      <div class="px-8 pb-8">
        <div class="relative flex justify-between items-end -mt-12 mb-6">
          <div
            @click="triggerFileInput"
            class="relative w-24 h-24 rounded-full bg-white dark:bg-slate-800 p-1.5 shadow-md transition-colors cursor-pointer group"
          >
            <div
              v-if="user?.avatar_url"
              class="w-full h-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700"
            >
              <img
                :src="user.avatar_url"
                class="w-full h-full object-cover"
                alt="Profile"
              />
            </div>

            <div
              v-else
              class="w-full h-full rounded-full bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center text-4xl font-bold uppercase"
            >
              {{ user?.name?.charAt(0) || "U" }}
            </div>

            <div
              class="absolute inset-1.5 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300"
            >
              <Camera class="text-white" :size="24" />
            </div>

            <div
              v-if="isUploadingAvatar"
              class="absolute inset-1.5 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm z-10"
            >
              <span class="animate-spin text-white text-xl">⏳</span>
            </div>
          </div>

          <input
            type="file"
            ref="fileInput"
            class="hidden"
            accept="image/png, image/jpeg, image/jpg"
            @change="handleFileUpload"
          />

          <div>
            <button
              v-if="!isEditing"
              @click="isEditing = true"
              class="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium py-2 px-4 rounded-xl transition-colors text-sm flex items-center gap-2"
            >
              <User :size="16" /> Edit Profil
            </button>
            <button
              v-else
              @click="cancelEdit"
              class="bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 font-medium py-2 px-4 rounded-xl transition-colors text-sm flex items-center gap-2"
            >
              <X :size="16" /> Batal
            </button>
          </div>
        </div>

        <div class="mb-8">
          <h2
            v-if="!isEditing"
            class="text-2xl font-bold text-slate-900 dark:text-white"
          >
            {{ user.name }}
          </h2>

          <div v-else class="flex items-center gap-3 max-w-sm mt-1 mb-2">
            <input
              v-model="editName"
              type="text"
              class="w-full px-4 py-2 rounded-xl border border-blue-300 dark:border-blue-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors shadow-sm"
              @keyup.enter="saveProfile"
              autofocus
            />
            <button
              @click="saveProfile"
              :disabled="isLoading"
              class="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl transition-colors shadow-sm disabled:opacity-50"
              title="Simpan Perubahan"
            >
              <Check :size="20" />
            </button>
          </div>

          <p
            class="text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1"
          >
            <Mail :size="16" /> {{ user.email }}
          </p>
        </div>

        <div class="space-y-4">
          <h3
            class="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2"
          >
            Detail Akun
          </h3>

          <div
            class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
          >
            <div
              class="flex items-center gap-3 text-slate-600 dark:text-slate-300"
            >
              <Hash :size="20" class="text-blue-500 dark:text-blue-400" />
              <span class="font-medium">User ID</span>
            </div>
            <span
              class="font-semibold text-slate-900 dark:text-slate-100 font-mono text-xs md:text-sm"
              >{{ user.id }}</span
            >
          </div>

          <div
            class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
          >
            <div
              class="flex items-center gap-3 text-slate-600 dark:text-slate-300"
            >
              <ShieldCheck
                :size="20"
                class="text-green-500 dark:text-green-400"
              />
              <span class="font-medium">Provider</span>
            </div>
            <span
              class="px-4 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold uppercase tracking-wide"
            >
              {{ user.provider }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
