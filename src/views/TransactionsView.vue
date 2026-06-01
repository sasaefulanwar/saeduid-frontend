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
  AlignLeft, // Icon baru buat deskripsi
  Banknote, // Icon baru buat jumlah uang
  Activity, // Icon baru buat tipe
  Layers, // Icon baru buat kategori
  PlusCircle,
  XCircle,
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
      await api.put(`/transactions/${editId.value}`, payload);
      toast.success("Data transaksi berhasil diupdate!");
    } else {
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
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
    <!-- Header -->
    <div class="mb-10">
      <h1
        class="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight"
      >
        Transactions 💸
      </h1>
      <p class="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">
        Catat dan pantau arus kas kamu dengan mudah.
      </p>
    </div>

    <!-- Form Section -->
    <div
      class="bg-white dark:bg-slate-800/90 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700/60 p-8 mb-8 backdrop-blur-sm transition-colors"
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
          {{ isEditing ? "Edit Transaksi" : "Tambah Transaksi Baru" }}
        </h2>
        <button
          v-if="isEditing"
          @click="cancelEdit"
          class="flex items-center gap-1 text-sm font-semibold text-rose-500 hover:text-rose-600 transition-colors"
        >
          <XCircle :size="16" /> Batal Edit
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-5">
        <!-- Input Deskripsi -->
        <div class="space-y-1.5">
          <label
            class="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
            >Deskripsi</label
          >
          <div class="relative group">
            <div
              class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors"
            >
              <AlignLeft :size="16" />
            </div>
            <input
              v-model="description"
              placeholder="Makan siang, Gaji..."
              class="w-full pl-11 pr-4 py-3 text-sm rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-slate-400"
            />
          </div>
        </div>

        <!-- Input Jumlah -->
        <div class="space-y-1.5">
          <label
            class="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
            >Jumlah (Rp)</label
          >
          <div class="relative group">
            <div
              class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors"
            >
              <Banknote :size="16" />
            </div>
            <input
              v-model="amount"
              type="number"
              placeholder="50000"
              class="w-full pl-11 pr-4 py-3 text-sm rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-slate-400"
            />
          </div>
        </div>

        <!-- Input Tipe -->
        <div class="space-y-1.5">
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

        <!-- Input Kategori -->
        <div class="space-y-1.5">
          <label
            class="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
            >Kategori</label
          >
          <div class="relative group">
            <div
              class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors"
            >
              <Layers :size="16" />
            </div>
            <select
              v-model="categoryId"
              class="w-full pl-11 pr-4 py-3 text-sm rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none cursor-pointer"
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
      </div>

      <!-- Action Button -->
      <div class="mt-8 flex justify-end gap-3">
        <button
          v-if="isEditing"
          @click="cancelEdit"
          class="text-sm font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 py-3 px-6 rounded-full transition-all duration-300"
        >
          Batal
        </button>
        <button
          @click="saveTransaction"
          :disabled="isLoading"
          class="text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-8 rounded-full transition-all duration-300 shadow-md shadow-blue-500/30 active:scale-95 disabled:opacity-70 flex items-center gap-2"
        >
          <span
            v-if="isLoading"
            class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
          ></span>
          {{
            isLoading
              ? "Menyimpan..."
              : isEditing
                ? "Update Data"
                : "Simpan Data"
          }}
        </button>
      </div>
    </div>

    <!-- Filter Section (Pill Styled) -->
    <div
      class="bg-slate-50/70 dark:bg-slate-800/40 rounded-[2rem] border border-slate-200/60 dark:border-slate-700/50 p-6 mb-8 transition-colors backdrop-blur-sm"
    >
      <div class="flex items-center justify-between mb-5">
        <h2
          class="text-sm font-bold flex items-center gap-2 text-slate-700 dark:text-slate-300"
        >
          <Filter :size="16" class="text-blue-500" /> Filter Pencarian
        </h2>
        <button
          @click="resetFilter"
          class="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-indigo-600 transition-colors"
        >
          Reset Filter
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="relative group">
          <div
            class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500"
          >
            <Calendar :size="14" />
          </div>
          <input
            type="date"
            v-model="filterStartDate"
            class="w-full pl-10 pr-3 py-2.5 text-sm rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-1 focus:ring-blue-500 outline-none text-slate-600 dark:text-slate-300"
          />
        </div>
        <div class="relative group">
          <div
            class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500"
          >
            <Calendar :size="14" />
          </div>
          <input
            type="date"
            v-model="filterEndDate"
            class="w-full pl-10 pr-3 py-2.5 text-sm rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-1 focus:ring-blue-500 outline-none text-slate-600 dark:text-slate-300"
          />
        </div>
        <div class="relative group">
          <div
            class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500"
          >
            <Tag :size="14" />
          </div>
          <select
            v-model="filterType"
            class="w-full pl-10 pr-3 py-2.5 text-sm rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-1 focus:ring-blue-500 outline-none text-slate-600 dark:text-slate-300 appearance-none cursor-pointer"
          >
            <option value="all">Semua Tipe</option>
            <option value="income">Pemasukan (Income)</option>
            <option value="expense">Pengeluaran (Expense)</option>
          </select>
        </div>
        <div class="relative group">
          <div
            class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500"
          >
            <Layers :size="14" />
          </div>
          <select
            v-model="filterCategory"
            class="w-full pl-10 pr-3 py-2.5 text-sm rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-1 focus:ring-blue-500 outline-none text-slate-600 dark:text-slate-300 appearance-none cursor-pointer"
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
      class="bg-white dark:bg-slate-800/90 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700/60 p-8 transition-colors backdrop-blur-sm"
    >
      <div
        class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
      >
        <h2
          class="text-xl font-bold text-slate-900 dark:text-white tracking-tight"
        >
          Riwayat Transaksi
        </h2>

        <div class="flex items-center gap-3 w-full md:w-auto">
          <!-- Search Bar Melengkung Kapsul -->
          <div class="relative w-full md:w-72 group">
            <div
              class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors"
            >
              <Search :size="16" />
            </div>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari transaksi..."
              class="w-full pl-11 pr-4 py-2.5 text-sm rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
          <span
            class="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-4 py-2.5 rounded-full whitespace-nowrap"
          >
            {{ filteredTransactions.length }} Item
          </span>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="filteredTransactions.length === 0"
        class="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-[2rem]"
      >
        <div
          class="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3"
        >
          <Search :size="24" class="text-slate-300 dark:text-slate-500" />
        </div>
        <p class="text-slate-400 dark:text-slate-500 font-medium text-sm">
          Tidak ada transaksi yang sesuai.
        </p>
      </div>

      <!-- List Items (Premium Style) -->
      <div class="space-y-3">
        <div
          v-for="trx in filteredTransactions"
          :key="trx.id"
          class="flex items-center justify-between gap-4 p-4 pl-5 pr-5 rounded-[1.5rem] border border-slate-100 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-700/30 hover:border-slate-200 hover:shadow-sm transition-all duration-300 group"
        >
          <!-- Kiri: Icon + Deskripsi (Kita kasih min-w-0 & flex-1 biar teks bisa terpotong rapi) -->
          <div class="flex items-center gap-4 min-w-0 flex-1">
            <div
              :class="[
                'w-10 h-10 shrink-0 rounded-full flex items-center justify-center shadow-inner transition-transform group-hover:scale-105',
                trx.type === 'income'
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500'
                  : 'bg-rose-50 dark:bg-rose-900/20 text-rose-500',
              ]"
            >
              <ArrowUpCircle
                v-if="trx.type === 'income'"
                :size="20"
                stroke-width="2.5"
              />
              <ArrowDownCircle v-else :size="20" stroke-width="2.5" />
            </div>

            <div class="min-w-0">
              <p
                class="font-bold text-slate-800 dark:text-slate-200 text-sm truncate tracking-tight"
              >
                {{ trx.description }}
              </p>
              <p
                class="text-[11px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1.5 truncate"
              >
                <span
                  class="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md"
                  >{{ trx.category?.name || "Lainnya" }}</span
                >
                •
                {{
                  new Date(
                    trx.transaction_date || trx.created_at,
                  ).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                  })
                }}
              </p>
            </div>
          </div>

          <!-- Kanan: Nominal + Aksi (Kita kasih shrink-0 biar nggak kena peres) -->
          <div class="flex items-center gap-4 shrink-0">
            <div
              :class="[
                'font-extrabold text-right text-sm',
                trx.type === 'income' ? 'text-emerald-500' : 'text-rose-500',
              ]"
            >
              {{ trx.type === "income" ? "+" : "-" }}
              {{ formatCurrency(trx.amount) }}
            </div>

            <!-- Tombol Aksi -->
            <div
              class="flex items-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full shadow-sm"
            >
              <button
                @click="editTransaction(trx)"
                class="p-2 text-slate-400 hover:text-blue-500 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                title="Edit"
              >
                <Edit :size="14" stroke-width="2.5" />
              </button>
              <div class="w-px h-4 bg-slate-200 dark:border-slate-700"></div>
              <button
                @click="deleteTransaction(trx.id)"
                class="p-2 text-slate-400 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                title="Hapus"
              >
                <Trash2 :size="14" stroke-width="2.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
