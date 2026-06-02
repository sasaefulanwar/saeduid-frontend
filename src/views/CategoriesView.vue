<script setup>
import { ref, onMounted } from "vue";
import api from "../api/axios";
import { toast } from "vue3-toastify";
import {
  Edit,
  Trash2,
  Tag,
  Activity,
  PlusCircle,
  XCircle,
  FolderOpen,
} from "lucide-vue-next";
import { ChevronDown } from "lucide-vue-next"; // Pastiin ini ada cuy!

const isTipsOpen = ref(false);
const categories = ref([]);
const isLoading = ref(false);

// State Form
const name = ref("");
const type = ref("expense");

// State Edit
const isEditing = ref(false);
const editId = ref(null);

const loadCategories = async () => {
  try {
    const res = await api.get("/categories");
    categories.value = res.data;
  } catch (err) {
    console.error(err);
    toast.error("Gagal memuat daftar kategori.");
  }
};

// ==========================================
// 🔥 FUNGSI CRUD KATEGORI
// ==========================================
const saveCategory = async () => {
  if (!name.value) {
    toast.warning("Nama kategori tidak boleh kosong!");
    return;
  }

  try {
    isLoading.value = true;
    const payload = {
      name: name.value,
      type: type.value,
    };

    if (isEditing.value) {
      await api.put(`/categories/${editId.value}`, payload);
      toast.success("Kategori berhasil diupdate!");
    } else {
      await api.post("/categories", payload);
      toast.success("Kategori baru berhasil ditambahkan!");
    }

    cancelEdit();
    await loadCategories();
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.error || "Gagal menyimpan kategori");
  } finally {
    isLoading.value = false;
  }
};

const editCategory = (cat) => {
  isEditing.value = true;
  editId.value = cat.id;
  name.value = cat.name;
  type.value = cat.type;

  window.scrollTo({ top: 0, behavior: "smooth" });
};

const cancelEdit = () => {
  isEditing.value = false;
  editId.value = null;
  name.value = "";
  type.value = "expense";
};

const deleteCategory = async (id) => {
  if (
    !window.confirm(
      "Yakin mau menghapus kategori ini? Transaksi yang pakai kategori ini bisa ikut kehilangan labelnya lho.",
    )
  ) {
    return;
  }

  try {
    await api.delete(`/categories/${id}`);
    toast.success("Kategori berhasil dihapus!");
    await loadCategories();
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.error || "Gagal menghapus kategori");
  }
};

onMounted(() => {
  loadCategories();
});
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
    <!-- Header -->
    <div class="mb-10">
      <div
        class="mb-6 border-l-4 border-slate-800 pl-4 dark:border-slate-300 flex flex-col sm:flex-row sm:items-end justify-between gap-4"
      >
        <div>
          <h1
            class="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl"
          >
            Kategori Transaksi
          </h1>
          <p class="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Bikin laci-laci khusus buat merapikan pencatatan uangmu.
          </p>
        </div>
      </div>

      <!-- Trigger Button (Pill Elegan Ungu) -->
      <button
        @click="isTipsOpen = !isTipsOpen"
        class="group flex items-center gap-2.5 px-4 py-2.5 bg-white/70 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-300 mb-2"
      >
        <div
          class="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm shadow-purple-500/50 group-hover:scale-110 transition-transform"
        ></div>
        <span
          class="text-[13px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 transition-colors group-hover:text-slate-900 dark:group-hover:text-white"
        >
          Smart Tips
        </span>
        <ChevronDown
          :size="16"
          :class="[
            'text-slate-400 transition-transform duration-300 ml-1',
            isTipsOpen ? 'rotate-180' : '',
          ]"
        />
      </button>

      <!-- Educational Card (Expandable) -->
      <transition name="expand">
        <div v-if="isTipsOpen" class="overflow-hidden">
          <div
            class="relative bg-white/70 dark:bg-black/40 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)] border border-white/80 dark:border-white/10 p-6 sm:p-8 mt-2 transition-all group"
          >
            <div
              class="absolute -top-12 -right-12 w-40 h-40 bg-purple-500/15 dark:bg-purple-500/20 rounded-full blur-3xl pointer-events-none transition-transform duration-700 group-hover:scale-110"
            ></div>
            <div class="relative z-10">
              <h3
                class="text-[19px] sm:text-xl font-extrabold text-slate-800 dark:text-white mb-3 tracking-tight"
              >
                Rahasia Keuangan Rapi
              </h3>
              <p
                class="text-[14px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium"
              >
                Kategori yang spesifik itu kunci laporan keuangan yang gampang
                dibaca. Semakin jelas "laci" yang kamu buat (misal: dipisah
                antara Makan Siang, Ngopi, dan Belanja Bulanan), semakin gampang
                kamu ngelacak kebocoran dana di akhir bulan!
              </p>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- Form Action -->
    <div
      class="bg-white/70 dark:bg-black/40 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)] border border-white/80 dark:border-white/10 p-6 sm:p-8 mb-10 transition-all"
    >
      <div
        class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/60 dark:border-slate-700/30 pb-5 mb-6"
      >
        <h2
          class="text-[19px] sm:text-xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2.5"
        >
          <component
            :is="isEditing ? Edit : PlusCircle"
            :size="22"
            class="text-blue-500 drop-shadow-sm"
          />
          {{ isEditing ? "Edit Kategori" : "Tambah Kategori Baru" }}
        </h2>
        <button
          v-if="isEditing"
          @click="cancelEdit"
          class="mt-3 sm:mt-0 flex items-center gap-1.5 text-[15px] font-medium text-rose-500 hover:text-rose-600 transition-colors"
        >
          <XCircle :size="16" /> Batal Edit
        </button>
      </div>

      <div class="flex flex-col lg:flex-row items-end gap-5">
        <div class="flex-1 w-full space-y-1.5">
          <label
            class="block text-[13px] font-semibold text-slate-600 dark:text-slate-300/90 ml-1"
          >
            Nama Kategori
          </label>
          <div class="relative group">
            <div
              class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors"
            >
              <Tag :size="18" />
            </div>
            <input
              v-model="name"
              placeholder="Cth: Nongkrong, Bensin, Gaji"
              class="w-full pl-11 pr-4 py-3.5 text-[15px] rounded-2xl border border-slate-200/80 dark:border-white/5 bg-slate-50/60 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-blue-500/40 dark:focus:ring-blue-400/40 transition-all duration-300 placeholder-slate-400 dark:placeholder-slate-500 shadow-[inset_0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
              @keyup.enter="saveCategory"
            />
          </div>
        </div>

        <div class="w-full lg:w-64 space-y-1.5">
          <label
            class="block text-[13px] font-semibold text-slate-600 dark:text-slate-300/90 ml-1"
          >
            Tipe
          </label>
          <div class="relative group">
            <div
              class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors"
            >
              <Activity :size="18" />
            </div>
            <select
              v-model="type"
              class="w-full pl-11 pr-4 py-3.5 text-[15px] rounded-2xl border border-slate-200/80 dark:border-white/5 bg-slate-50/60 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-blue-500/40 dark:focus:ring-blue-400/40 transition-all duration-300 appearance-none cursor-pointer shadow-[inset_0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
            >
              <option value="income" class="bg-white dark:bg-slate-800">
                Pemasukan
              </option>
              <option value="expense" class="bg-white dark:bg-slate-800">
                Pengeluaran
              </option>
            </select>
          </div>
        </div>

        <div class="flex gap-3 w-full lg:w-auto mt-2 lg:mt-0">
          <button
            v-if="isEditing"
            @click="cancelEdit"
            class="w-full lg:w-auto text-[15px] font-medium bg-white/80 dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 py-3.5 px-6 rounded-2xl border border-slate-200/60 dark:border-transparent transition-all duration-300 backdrop-blur-md shadow-sm dark:shadow-none"
          >
            Batal
          </button>

          <button
            @click="saveCategory"
            :disabled="isLoading || !name"
            class="w-full lg:w-auto text-[15px] font-medium bg-blue-500 hover:bg-blue-600 text-white py-3.5 px-8 rounded-2xl transition-all duration-300 shadow-[0_4px_16px_rgba(59,130,246,0.3)] hover:shadow-[0_4px_20px_rgba(59,130,246,0.5)] active:scale-[0.97] disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            <span
              v-if="isLoading"
              class="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"
            ></span>
            {{ isLoading ? "Processing..." : isEditing ? "Update" : "Simpan" }}
          </button>
        </div>
      </div>
    </div>

    <div>
      <div
        v-if="categories.length === 0"
        class="flex flex-col items-center justify-center py-16 border border-dashed border-slate-300/70 dark:border-slate-700/50 rounded-[2rem] bg-white/30 dark:bg-white/5 backdrop-blur-sm transition-all"
      >
        <div
          class="w-14 h-14 bg-white/50 dark:bg-white/10 rounded-full flex items-center justify-center mb-4 shadow-sm border border-white/60 dark:border-white/5"
        >
          <FolderOpen :size="24" class="text-slate-400 dark:text-slate-500" />
        </div>
        <p class="text-[14px] text-slate-500 dark:text-slate-400 font-medium">
          Laci kategorimu masih kosong nih.
        </p>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="category in categories"
          :key="category.id"
          class="relative bg-white/70 dark:bg-black/40 backdrop-blur-2xl rounded-[1.5rem] shadow-[0_4px_24px_rgba(0,0,0,0.02)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)] border border-white/80 dark:border-white/10 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] group flex items-center justify-between overflow-hidden"
        >
          <div class="flex items-center gap-4 pr-14 relative z-10 w-full">
            <div
              :class="[
                'min-w-[40px] w-10 h-10 rounded-[1rem] flex items-center justify-center border shadow-sm transition-colors',
                category.type === 'income'
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200/60 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-50 dark:bg-rose-500/10 border-rose-200/60 dark:border-rose-500/20 text-rose-600 dark:text-rose-400',
              ]"
            >
              <Tag :size="18" />
            </div>

            <div class="flex-1 overflow-hidden">
              <h3
                class="font-bold text-[15px] text-slate-800 dark:text-white tracking-tight mb-0.5 truncate"
              >
                {{ category.name }}
              </h3>
              <p
                :class="[
                  'text-[10px] font-extrabold uppercase tracking-widest',
                  category.type === 'income'
                    ? 'text-emerald-500'
                    : 'text-rose-500',
                ]"
              >
                {{ category.type === "income" ? "Pemasukan" : "Pengeluaran" }}
              </p>
            </div>
          </div>

          <div
            class="absolute right-4 flex items-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 rounded-full overflow-hidden shadow-md z-20 scale-95 lg:group-hover:scale-100"
          >
            <button
              @click="editCategory(category)"
              class="p-2 px-2.5 text-slate-400 hover:text-blue-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              title="Edit"
            >
              <Edit :size="14" stroke-width="2.5" />
            </button>
            <div class="w-px h-3.5 bg-slate-200 dark:bg-slate-700"></div>
            <button
              @click="deleteCategory(category.id)"
              class="p-2 px-2.5 text-slate-400 hover:text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              title="Hapus"
            >
              <Trash2 :size="14" stroke-width="2.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Ini "nyawa" biar buka-tutupnya mulus, bukan loncat kaku */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

.expand-enter-to,
.expand-leave-from {
  max-height: 500px; /* Cukup buat nampung isi tips-nya */
  opacity: 1;
}
</style>
