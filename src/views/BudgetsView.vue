<script setup>
import { ref, onMounted } from "vue";
import api from "../api/axios";
import { formatCurrency } from "../utils/currency";
import { toast } from "vue3-toastify";
import { AlertCircle, CheckCircle, Edit, Trash2 } from "lucide-vue-next";

const categories = ref([]);
const statusList = ref([]);
const isLoading = ref(false);

// State Form
const categoryId = ref("");
const limitAmount = ref("");
const month = ref(new Date().getMonth() + 1);
const year = ref(new Date().getFullYear());

// State Edit
const isEditing = ref(false);
const editId = ref(null);

const loadCategories = async () => {
  try {
    const res = await api.get("/categories");
    categories.value = res.data;
  } catch (err) {
    console.error(err);
  }
};

const loadBudgetStatus = async () => {
  try {
    const res = await api.get("/budgets/status");
    statusList.value = res.data;
  } catch (err) {
    console.error(err);
    toast.error("Gagal memuat status budget.");
  }
};

// ==========================================
// 🔥 FUNGSI CRUD BUDGET
// ==========================================
const saveBudget = async () => {
  if (!categoryId.value || !limitAmount.value || !month.value || !year.value) {
    toast.warning("Harap lengkapi semua data budget!");
    return;
  }

  try {
    isLoading.value = true;
    const payload = {
      category_id: categoryId.value,
      limit_amount: Number(limitAmount.value), // 🔥 INI YG BIKIN ERROR, PASTIIN TULISANNYA 'limit_amount'
      month: Number(month.value),
      year: Number(year.value),
    };

    if (isEditing.value) {
      // UPDATE DATA
      await api.put(`/budgets/${editId.value}`, payload);
      toast.success("Budget berhasil diupdate!");
    } else {
      // BIKIN DATA BARU
      await api.post("/budgets", payload);
      toast.success("Budget baru berhasil disimpan!");
    }

    cancelEdit();
    await loadBudgetStatus();
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.error || "Gagal menyimpan budget");
  } finally {
    isLoading.value = false;
  }
};

const editBudget = (item) => {
  isEditing.value = true;
  // Catatan: Pastikan backend ngirim 'id' dan 'category_id' budget di response status
  editId.value = item.id || item.budget_id;
  categoryId.value = item.category_id;
  limitAmount.value = item.limit;
  month.value = item.month || new Date().getMonth() + 1;
  year.value = item.year || new Date().getFullYear();

  // Auto scroll ke form
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const cancelEdit = () => {
  isEditing.value = false;
  editId.value = null;
  categoryId.value = "";
  limitAmount.value = "";
  month.value = new Date().getMonth() + 1;
  year.value = new Date().getFullYear();
};

const deleteBudget = async (id) => {
  if (!window.confirm("Yakin mau menghapus budget ini?")) {
    return;
  }

  try {
    await api.delete(`/budgets/${id}`);
    toast.success("Budget berhasil dihapus!");
    await loadBudgetStatus();
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.error || "Gagal menghapus budget");
  }
};

onMounted(() => {
  loadCategories();
  loadBudgetStatus();
});
</script>

<template>
  <div class="max-w-5xl mx-auto">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-slate-900 dark:text-white">
        Manajemen Budget 💰
      </h1>
      <p class="text-slate-500 dark:text-slate-400 mt-1">
        Atur batas pengeluaran biar kantong nggak jebol.
      </p>
    </div>

    <!-- Form Tambah/Edit Budget -->
    <div
      class="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-8 transition-colors"
    >
      <div
        class="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-700 pb-2"
      >
        <h2 class="text-lg font-semibold text-slate-800 dark:text-white">
          {{ isEditing ? "✏️ Edit Budget" : "➕ Buat Budget Baru" }}
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label
            class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >Kategori</label
          >
          <select
            v-model="categoryId"
            class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <option value="" disabled>Pilih Kategori</option>
            <option
              v-for="category in categories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
        </div>

        <div>
          <label
            class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >Batas Maksimal (Rp)</label
          >
          <input
            v-model="limitAmount"
            type="number"
            placeholder="Contoh: 1500000"
            class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
        </div>

        <div>
          <label
            class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >Bulan (1-12)</label
          >
          <input
            v-model="month"
            type="number"
            min="1"
            max="12"
            class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
        </div>

        <div>
          <label
            class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >Tahun</label
          >
          <input
            v-model="year"
            type="number"
            class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
        </div>
      </div>

      <div class="mt-6 flex justify-end gap-3">
        <button
          v-if="isEditing"
          @click="cancelEdit"
          class="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium py-2 px-6 rounded-xl transition-all shadow-sm"
        >
          Batal
        </button>
        <button
          @click="saveBudget"
          :disabled="isLoading"
          class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-xl transition-all shadow-sm disabled:opacity-70"
        >
          {{
            isLoading
              ? "Loading..."
              : isEditing
                ? "Update Budget"
                : "Simpan Budget"
          }}
        </button>
      </div>
    </div>

    <!-- Status Monitoring -->
    <h2 class="text-xl font-bold mb-4 text-slate-900 dark:text-white">
      Monitoring Budget 🚨
    </h2>

    <div
      v-if="statusList.length === 0"
      class="text-center py-10 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 transition-colors"
    >
      Belum ada budget yang diatur bulan ini.
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        v-for="item in statusList"
        :key="item.category"
        :class="[
          'rounded-3xl p-6 border shadow-sm transition-all group relative',
          item.status === 'exceeded'
            ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30'
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700',
        ]"
      >
        <!-- Tombol Aksi di Pojok Kanan Atas -->
        <div
          class="absolute top-4 right-4 flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
        >
          <!-- Note: Tombol ini cuma bisa dipencet kalo API balikin ID dari budgetnya -->
          <button
            v-if="item.id || item.budget_id"
            @click="editBudget(item)"
            class="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit :size="16" />
          </button>
          <button
            v-if="item.id || item.budget_id"
            @click="deleteBudget(item.id || item.budget_id)"
            class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
            title="Hapus"
          >
            <Trash2 :size="16" />
          </button>
        </div>

        <div class="flex justify-between items-start mb-4 pr-16">
          <h3 class="font-bold text-lg text-slate-800 dark:text-slate-100">
            {{ item.category }}
          </h3>
          <div
            :class="[
              'flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold',
              item.status === 'exceeded'
                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
            ]"
          >
            <AlertCircle v-if="item.status === 'exceeded'" :size="14" />
            <CheckCircle v-else :size="14" />
            {{ item.status === "exceeded" ? "EXCEEDED" : "SAFE" }}
          </div>
        </div>

        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-slate-500 dark:text-slate-400"
              >Batas Budget:</span
            >
            <span class="font-semibold text-slate-900 dark:text-white">{{
              formatCurrency(item.limit)
            }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500 dark:text-slate-400">Terpakai:</span>
            <span class="font-semibold text-red-500 dark:text-red-400">{{
              formatCurrency(item.spent)
            }}</span>
          </div>
          <div
            class="flex justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700 mt-2"
          >
            <span class="text-slate-500 dark:text-slate-400 font-medium"
              >Sisa Budget:</span
            >
            <span
              :class="[
                'font-bold',
                item.status === 'exceeded'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-green-600 dark:text-green-400',
              ]"
            >
              {{ formatCurrency(item.remaining) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
