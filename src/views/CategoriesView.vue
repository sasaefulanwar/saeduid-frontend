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
    <div class="mb-10">
      <h1
        class="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight"
      >
        Kategori Transaksi 📂
      </h1>
      <p class="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">
        Bikin laci-laci khusus buat merapikan pencatatan uangmu.
      </p>
    </div>

    <div
      class="bg-white dark:bg-slate-800/90 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700/60 p-8 mb-10 backdrop-blur-sm transition-colors"
    >
      <div
        class="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/80 pb-5 mb-6"
      >
        <h2
          class="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-white tracking-tight"
        >
          <component
            :is="isEditing ? Edit : PlusCircle"
            :size="20"
            class="text-blue-500"
          />
          {{ isEditing ? "Edit Kategori" : "Tambah Kategori Baru" }}
        </h2>
        <button
          v-if="isEditing"
          @click="cancelEdit"
          class="flex items-center gap-1 text-sm font-semibold text-rose-500 hover:text-rose-600 transition-colors"
        >
          <XCircle :size="16" /> Batal Edit
        </button>
      </div>

      <div class="flex flex-col md:flex-row items-end gap-5">
        <div class="flex-1 w-full space-y-1.5">
          <label
            class="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
            >Nama Kategori</label
          >
          <div class="relative group">
            <div
              class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors"
            >
              <Tag :size="16" />
            </div>
            <input
              v-model="name"
              placeholder="Cth: Nongkrong, Bensin, Gaji"
              class="w-full pl-11 pr-4 py-3 text-sm rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-slate-400"
              @keyup.enter="saveCategory"
            />
          </div>
        </div>

        <div class="w-full md:w-64 space-y-1.5">
          <label
            class="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
            >Tipe</label
          >
          <div class="relative group">
            <div
              class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors"
            >
              <Activity :size="16" />
            </div>
            <select
              v-model="type"
              class="w-full pl-11 pr-4 py-3 text-sm rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none cursor-pointer"
            >
              <option value="income">Pemasukan</option>
              <option value="expense">Pengeluaran</option>
            </select>
          </div>
        </div>

        <div class="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
          <button
            v-if="isEditing"
            @click="cancelEdit"
            class="w-full md:w-auto text-sm font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 py-3 px-6 rounded-full transition-all duration-300"
          >
            Batal
          </button>
          <button
            @click="saveCategory"
            :disabled="isLoading || !name"
            class="w-full md:w-auto text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-8 rounded-full transition-all duration-300 shadow-md shadow-blue-500/30 active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            <span
              v-if="isLoading"
              class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
            ></span>
            {{ isLoading ? "Processing..." : isEditing ? "Update" : "Simpan" }}
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="categories.length === 0"
      class="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2rem] bg-white/50 dark:bg-slate-800/50"
    >
      <div
        class="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3"
      >
        <FolderOpen :size="24" class="text-slate-300 dark:text-slate-500" />
      </div>
      <p class="text-slate-400 dark:text-slate-500 font-medium text-sm">
        Laci kategorimu masih kosong nih.
      </p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="category in categories"
        :key="category.id"
        class="bg-white dark:bg-slate-800/90 rounded-[1.5rem] border border-slate-100 dark:border-slate-700/60 p-5 shadow-sm hover:shadow-md hover:border-slate-200 dark:hover:border-slate-600 transition-all duration-300 group flex items-center justify-between backdrop-blur-sm"
      >
        <div class="flex items-center gap-4">
          <div
            :class="[
              'w-10 h-10 rounded-full flex items-center justify-center border',
              category.type === 'income'
                ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30 text-emerald-500'
                : 'bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-800/30 text-rose-500',
            ]"
          >
            <Tag :size="16" />
          </div>
          <div>
            <h3
              class="font-bold text-slate-800 dark:text-slate-200 text-sm tracking-tight mb-0.5"
            >
              {{ category.name }}
            </h3>
            <p
              :class="[
                'text-[10px] font-extrabold uppercase tracking-wider',
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
          class="flex items-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full overflow-hidden shadow-sm"
        >
          <button
            @click="editCategory(category)"
            class="p-2 text-slate-400 hover:text-blue-500 hover:bg-white dark:hover:bg-slate-700 transition-colors"
            title="Edit"
          >
            <Edit :size="14" stroke-width="2.5" />
          </button>
          <div class="w-px h-3 bg-slate-200 dark:bg-slate-700"></div>
          <button
            @click="deleteCategory(category.id)"
            class="p-2 text-slate-400 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-700 transition-colors"
            title="Hapus"
          >
            <Trash2 :size="14" stroke-width="2.5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
