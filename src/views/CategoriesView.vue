<script setup>
import { ref, onMounted } from "vue";
import api from "../api/axios";
import { toast } from "vue3-toastify";
import { Edit, Trash2 } from "lucide-vue-next";

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
      // UPDATE DATA
      await api.put(`/categories/${editId.value}`, payload);
      toast.success("Kategori berhasil diupdate!");
    } else {
      // BIKIN DATA BARU
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

  // Auto scroll ke atas
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
  <div class="max-w-4xl mx-auto">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-slate-900 dark:text-white">
        Kategori Transaksi 📂
      </h1>
      <p class="text-slate-500 dark:text-slate-400 mt-1">
        Kelola kategori untuk merapikan pencatatan keuanganmu.
      </p>
    </div>

    <!-- Form Card -->
    <div
      class="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-8 transition-colors"
    >
      <div
        class="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-700 pb-2"
      >
        <h2 class="text-lg font-semibold text-slate-800 dark:text-white">
          {{ isEditing ? "✏️ Edit Kategori" : "➕ Tambah Kategori Baru" }}
        </h2>
      </div>

      <div class="flex flex-col md:flex-row items-end gap-4">
        <div class="flex-1 w-full">
          <label
            class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >Nama Kategori</label
          >
          <input
            v-model="name"
            placeholder="Cth: Makanan, Transport, Gaji"
            class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            @keyup.enter="saveCategory"
          />
        </div>

        <div class="w-full md:w-64">
          <label
            class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >Tipe</label
          >
          <select
            v-model="type"
            class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <option value="income">Pemasukan (Income)</option>
            <option value="expense">Pengeluaran (Expense)</option>
          </select>
        </div>

        <div class="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
          <button
            v-if="isEditing"
            @click="cancelEdit"
            class="w-full md:w-auto bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium py-2 px-4 rounded-xl transition-all shadow-sm"
          >
            Batal
          </button>
          <button
            @click="saveCategory"
            :disabled="isLoading || !name"
            class="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-xl transition-all shadow-sm disabled:opacity-50"
          >
            {{ isLoading ? "Loading..." : isEditing ? "Update" : "Tambah" }}
          </button>
        </div>
      </div>
    </div>

    <!-- List Card -->
    <div
      class="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors"
    >
      <div
        class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
      >
        <h2 class="font-semibold text-slate-800 dark:text-slate-200">
          Daftar Kategori Tersimpan
        </h2>
      </div>

      <div
        v-if="categories.length === 0"
        class="text-center py-10 text-slate-400 dark:text-slate-500"
      >
        Belum ada kategori yang dibuat.
      </div>

      <ul class="divide-y divide-slate-100 dark:divide-slate-700/50">
        <li
          v-for="category in categories"
          :key="category.id"
          class="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group"
        >
          <div class="flex items-center gap-3">
            <span class="font-medium text-slate-700 dark:text-slate-300">{{
              category.name
            }}</span>
            <span
              :class="[
                'px-3 py-1 rounded-full text-xs font-semibold',
                category.type === 'income'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
              ]"
            >
              {{ category.type === "income" ? "Income" : "Expense" }}
            </span>
          </div>

          <!-- Tombol Aksi (Muncul pas di hover) -->
          <div
            class="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
          >
            <button
              @click="editCategory(category)"
              class="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
              title="Edit Kategori"
            >
              <Edit :size="18" />
            </button>
            <button
              @click="deleteCategory(category.id)"
              class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              title="Hapus Kategori"
            >
              <Trash2 :size="18" />
            </button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
