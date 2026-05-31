<script setup>
import { ref, onMounted, computed } from "vue";
import api from "../api/axios";
import { formatCurrency } from "../utils/currency";
import { toast } from "vue3-toastify";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Filter,
  Calendar,
  Tag,
  Search,
  Edit,
  Trash2,
} from "lucide-vue-next";

const transactions = ref([]);
const categories = ref([]);

// State Form
const description = ref("");
const amount = ref("");
const type = ref("expense");
const categoryId = ref("");

// State untuk Edit
const isEditing = ref(false);
const editId = ref(null);
const isLoading = ref(false);

// State untuk Filter & Search
const filterStartDate = ref("");
const filterEndDate = ref("");
const filterType = ref("all");
const filterCategory = ref("all");
const searchQuery = ref("");

const loadTransactions = async () => {
  try {
    const res = await api.get("/transactions");
    transactions.value = res.data;
  } catch (err) {
    console.error(err);
    toast.error("Gagal memuat transaksi");
  }
};

const loadCategories = async () => {
  try {
    const res = await api.get("/categories");
    categories.value = res.data;
  } catch (err) {
    console.error(err);
  }
};

// ==========================================
// 🔥 FUNGSI CRUD TRANSAKSI
// ==========================================
const saveTransaction = async () => {
  if (!description.value || !amount.value || !categoryId.value) {
    toast.warning("Harap lengkapi semua data transaksi!");
    return;
  }

  try {
    isLoading.value = true;
    const payload = {
      description: description.value,
      amount: Number(amount.value),
      type: type.value,
      category_id: categoryId.value,
    };

    if (isEditing.value) {
      // UPDATE DATA
      await api.put(`/transactions/${editId.value}`, payload);
      toast.success("Data transaksi berhasil diupdate!");
    } else {
      // BIKIN DATA BARU
      await api.post("/transactions", payload);
      toast.success("Transaksi baru berhasil disimpan!");
    }

    cancelEdit();
    await loadTransactions();
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.error || "Gagal menyimpan transaksi");
  } finally {
    isLoading.value = false;
  }
};

const editTransaction = (trx) => {
  isEditing.value = true;
  editId.value = trx.id;
  description.value = trx.description;
  amount.value = trx.amount;
  type.value = trx.type;
  categoryId.value = trx.category_id;

  // Auto scroll ke atas (ke arah form)
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const cancelEdit = () => {
  isEditing.value = false;
  editId.value = null;
  description.value = "";
  amount.value = "";
  type.value = "expense";
  categoryId.value = "";
};

const deleteTransaction = async (id) => {
  // Peringatan sebelum hapus beneran
  if (
    !window.confirm(
      "Yakin mau menghapus transaksi ini? Data yang dihapus tidak bisa dikembalikan.",
    )
  ) {
    return;
  }

  try {
    await api.delete(`/transactions/${id}`);
    toast.success("Transaksi berhasil dihapus!");
    await loadTransactions();
  } catch (err) {
    console.error(err);
    toast.error("Gagal menghapus transaksi.");
  }
};

// ==========================================
// 🔥 FUNGSI FILTER & SEARCH
// ==========================================
const filteredTransactions = computed(() => {
  return transactions.value.filter((trx) => {
    if (filterType.value !== "all" && trx.type !== filterType.value)
      return false;
    if (
      filterCategory.value !== "all" &&
      trx.category_id !== filterCategory.value
    )
      return false;

    const trxDate = new Date(trx.transaction_date || trx.created_at);
    if (filterStartDate.value) {
      const start = new Date(filterStartDate.value);
      start.setHours(0, 0, 0, 0);
      if (trxDate < start) return false;
    }
    if (filterEndDate.value) {
      const end = new Date(filterEndDate.value);
      end.setHours(23, 59, 59, 999);
      if (trxDate > end) return false;
    }

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      if (!trx.description.toLowerCase().includes(query)) return false;
    }

    return true;
  });
});

const resetFilter = () => {
  filterStartDate.value = "";
  filterEndDate.value = "";
  filterType.value = "all";
  filterCategory.value = "all";
  searchQuery.value = "";
};

onMounted(() => {
  loadTransactions();
  loadCategories();
});
</script>

<template>
  <div class="max-w-6xl mx-auto">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-slate-900 dark:text-white">
        Transactions 💸
      </h1>
      <p class="text-slate-500 dark:text-slate-400 mt-1">
        Catat dan pantau arus kas kamu di sini.
      </p>
    </div>

    <!-- Form Section -->
    <div
      class="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-8 transition-colors"
    >
      <div
        class="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4 mb-4"
      >
        <h2
          class="text-lg font-semibold flex items-center gap-2 text-slate-800 dark:text-white"
        >
          {{ isEditing ? "✏️ Edit Transaksi" : "➕ Tambah Transaksi" }}
        </h2>
        <button
          v-if="isEditing"
          @click="cancelEdit"
          class="text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
        >
          Batal Edit
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label
            class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >Deskripsi</label
          >
          <input
            v-model="description"
            placeholder="Makan siang, Gaji..."
            class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >Jumlah (Rp)</label
          >
          <input
            v-model="amount"
            type="number"
            placeholder="50000"
            class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >Tipe</label
          >
          <select
            v-model="type"
            class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="income">Pemasukan</option>
            <option value="expense">Pengeluaran</option>
          </select>
        </div>

        <div>
          <label
            class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >Kategori</label
          >
          <select
            v-model="categoryId"
            class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          @click="saveTransaction"
          :disabled="isLoading"
          class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-xl transition-all shadow-sm disabled:opacity-50"
        >
          {{
            isLoading
              ? "Menyimpan..."
              : isEditing
                ? "Update Transaksi"
                : "Simpan Transaksi"
          }}
        </button>
      </div>
    </div>

    <!-- Filter Section (Tetap sama) -->
    <div
      class="bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 mb-6 transition-colors"
    >
      <div class="flex items-center justify-between mb-4">
        <h2
          class="text-md font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300"
        >
          <Filter :size="18" /> Filter Pencarian
        </h2>
        <button
          @click="resetFilter"
          class="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Reset Filter
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label
            class="block text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1"
            ><Calendar :size="12" /> Dari Tanggal</label
          >
          <input
            type="date"
            v-model="filterStartDate"
            class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        <div>
          <label
            class="block text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1"
            ><Calendar :size="12" /> Sampai Tanggal</label
          >
          <input
            type="date"
            v-model="filterEndDate"
            class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        <div>
          <label
            class="block text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1"
            ><Tag :size="12" /> Tipe Transaksi</label
          >
          <select
            v-model="filterType"
            class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">Semua Tipe</option>
            <option value="income">Pemasukan (Income)</option>
            <option value="expense">Pengeluaran (Expense)</option>
          </select>
        </div>

        <div>
          <label
            class="block text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1"
            ><Tag :size="12" /> Kategori</label
          >
          <select
            v-model="filterCategory"
            class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">Semua Kategori</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- List Section -->
    <div
      class="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors"
    >
      <div
        class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4"
      >
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
          Riwayat Transaksi
        </h2>

        <div class="flex items-center gap-3 w-full md:w-auto">
          <div class="relative w-full md:w-64">
            <div
              class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
            >
              <Search :size="16" class="text-slate-400" />
            </div>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari nama transaksi..."
              class="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm"
            />
          </div>
          <span
            class="text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded-xl whitespace-nowrap"
          >
            {{ filteredTransactions.length }} data
          </span>
        </div>
      </div>

      <div
        v-if="filteredTransactions.length === 0"
        class="text-center py-10 text-slate-400 dark:text-slate-500"
      >
        Tidak ada transaksi yang ditemukan.
      </div>

      <div class="space-y-3">
        <div
          v-for="trx in filteredTransactions"
          :key="trx.id"
          class="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
        >
          <div class="flex items-center gap-4">
            <div
              :class="[
                'w-10 h-10 rounded-full flex items-center justify-center shadow-sm',
                trx.type === 'income'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
              ]"
            >
              <ArrowUpCircle v-if="trx.type === 'income'" :size="24" />
              <ArrowDownCircle v-else :size="24" />
            </div>
            <div>
              <p class="font-medium text-slate-900 dark:text-slate-200">
                {{ trx.description }}
              </p>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                {{ trx.category?.name || "Tanpa Kategori" }} •
                {{
                  new Date(
                    trx.transaction_date || trx.created_at,
                  ).toLocaleDateString("id-ID")
                }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <!-- Nominal Angka -->
            <div
              :class="[
                'font-semibold text-right',
                trx.type === 'income'
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400',
              ]"
            >
              {{ trx.type === "income" ? "+" : "-" }}
              {{ formatCurrency(trx.amount) }}
            </div>

            <!-- Tombol Aksi (Muncul pas di hover / khusus HP selalu ada dikit) -->
            <div
              class="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
            >
              <button
                @click="editTransaction(trx)"
                class="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                title="Edit Data"
              >
                <Edit :size="18" />
              </button>
              <button
                @click="deleteTransaction(trx.id)"
                class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                title="Hapus Data"
              >
                <Trash2 :size="18" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
