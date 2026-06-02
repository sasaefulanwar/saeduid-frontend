<script setup>
import { ref, onMounted, computed } from "vue";
import api from "../api/axios";
import { formatCurrency } from "../utils/currency";
import { toast } from "vue3-toastify";
import {
  Edit,
  Trash2,
  RefreshCw,
  FileText,
  Banknote,
  ArrowRightLeft,
  Layers,
  PlusCircle,
  XCircle,
} from "lucide-vue-next";
import { ChevronDown } from "lucide-vue-next"; // Pastiin ini ada cuy!

const isTipsOpen = ref(false);
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

<style scoped>
/* Animasi Expand/Collapse Mulus */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 300px; /* Cukup buat nampung card-nya */
  opacity: 1;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
  margin-top: 0;
}
</style>

<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
    <!-- Header: Elegant Stacked Layout -->
    <div class="mb-10">
      <div
        class="mb-6 border-l-4 border-slate-800 pl-4 dark:border-slate-300 flex flex-col sm:flex-row sm:items-end justify-between gap-4"
      >
        <div>
          <h1
            class="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl"
          >
            Transaksi
          </h1>
          <p class="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Kamu sudah mencatat
            <span class="font-semibold text-slate-800 dark:text-slate-200">{{
              filteredTransactions.length
            }}</span>
            transaksi
          </p>
        </div>
      </div>

      <button
        @click="isTipsOpen = !isTipsOpen"
        class="group flex items-center gap-2.5 px-4 py-2.5 bg-white/70 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-300 mb-2"
      >
        <div
          class="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 group-hover:scale-110 transition-transform"
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

      <transition name="expand">
        <div v-if="isTipsOpen" class="overflow-hidden">
          <div
            class="relative bg-white/70 dark:bg-black/40 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)] border border-white/80 dark:border-white/10 p-6 sm:p-8 mt-2 transition-all group"
          >
            <div
              class="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/15 dark:bg-emerald-500/20 rounded-full blur-3xl pointer-events-none transition-transform duration-700 group-hover:scale-110"
            ></div>
            <div class="relative z-10">
              <h3
                class="text-[19px] sm:text-xl font-extrabold text-slate-800 dark:text-white mb-3 tracking-tight"
              >
                Catat Pengeluaran Sekecil Apapun!
              </h3>
              <p
                class="text-[14px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium"
              >
                Tahu nggak? Kebocoran finansial paling sering terjadi bukan
                karena beli barang mahal, tapi dari pengeluaran kecil yang
                sering diabaikan (kayak uang parkir, jajan minimarket, atau
                biaya admin). Biasakan langsung catat setiap ada uang
                keluar/masuk biar <i>cashflow</i> kamu tetap sehat!
              </p>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- Form Section -->
    <!-- Form Section Transaksi: iOS Glassmorphism (With Icons!) 🪟✨ -->
    <div
      class="bg-white/70 dark:bg-black/40 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)] border border-white/80 dark:border-white/10 p-6 sm:p-8 mb-8 transition-all"
    >
      <!-- Form Header -->
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
          {{ isEditing ? "Edit Transaksi" : "Tambah Transaksi Baru" }}
        </h2>
        <button
          v-if="isEditing"
          @click="cancelEdit"
          class="mt-3 sm:mt-0 flex items-center gap-1.5 text-[15px] font-medium text-rose-500 hover:text-rose-600 transition-colors"
        >
          <XCircle :size="16" /> Batal Edit
        </button>
      </div>

      <!-- Form Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- Input Deskripsi -->
        <div class="space-y-1.5">
          <label
            class="block text-[13px] font-semibold text-slate-600 dark:text-slate-300/90 ml-1"
          >
            Deskripsi
          </label>
          <div class="relative group">
            <div
              class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors"
            >
              <FileText :size="18" />
            </div>
            <input
              v-model="description"
              placeholder="Makan siang, Gaji..."
              class="w-full pl-11 pr-4 py-3.5 text-[15px] rounded-2xl border border-slate-200/80 dark:border-white/5 bg-slate-50/60 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-blue-500/40 dark:focus:ring-blue-400/40 transition-all duration-300 placeholder-slate-400 dark:placeholder-slate-500 shadow-[inset_0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
            />
          </div>
        </div>

        <!-- Input Jumlah -->
        <div class="space-y-1.5">
          <label
            class="block text-[13px] font-semibold text-slate-600 dark:text-slate-300/90 ml-1"
          >
            Jumlah (Rp)
          </label>
          <div class="relative group">
            <div
              class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors"
            >
              <Banknote :size="18" />
            </div>
            <input
              v-model="amount"
              type="number"
              placeholder="50000"
              class="w-full pl-11 pr-4 py-3.5 text-[15px] rounded-2xl border border-slate-200/80 dark:border-white/5 bg-slate-50/60 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-blue-500/40 dark:focus:ring-blue-400/40 transition-all duration-300 placeholder-slate-400 dark:placeholder-slate-500 shadow-[inset_0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
            />
          </div>
        </div>

        <!-- Input Tipe -->
        <div class="space-y-1.5">
          <label
            class="block text-[13px] font-semibold text-slate-600 dark:text-slate-300/90 ml-1"
          >
            Tipe
          </label>
          <div class="relative group">
            <div
              class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors"
            >
              <ArrowRightLeft :size="18" />
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

        <!-- Input Kategori -->
        <div class="space-y-1.5">
          <label
            class="block text-[13px] font-semibold text-slate-600 dark:text-slate-300/90 ml-1"
          >
            Kategori
          </label>
          <div class="relative group">
            <div
              class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors"
            >
              <Layers :size="18" />
            </div>
            <select
              v-model="categoryId"
              class="w-full pl-11 pr-4 py-3.5 text-[15px] rounded-2xl border border-slate-200/80 dark:border-white/5 bg-slate-50/60 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-blue-500/40 dark:focus:ring-blue-400/40 transition-all duration-300 appearance-none cursor-pointer shadow-[inset_0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
            >
              <option value="" disabled class="bg-white dark:bg-slate-800">
                Pilih Kategori
              </option>
              <option
                v-for="category in categories"
                :key="category.id"
                :value="category.id"
                class="bg-white dark:bg-slate-800"
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
          class="text-[15px] font-medium bg-white/80 dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 py-3 px-6 rounded-full border border-slate-200/60 dark:border-transparent transition-all duration-300 backdrop-blur-md shadow-sm dark:shadow-none"
        >
          Batal
        </button>

        <button
          @click="saveTransaction"
          :disabled="isLoading"
          class="text-[15px] font-medium bg-blue-500 hover:bg-blue-600 text-white py-3 px-8 rounded-full transition-all duration-300 shadow-[0_4px_16px_rgba(59,130,246,0.3)] hover:shadow-[0_4px_20px_rgba(59,130,246,0.5)] active:scale-[0.97] disabled:opacity-70 disabled:hover:scale-100 flex items-center gap-2"
        >
          <span
            v-if="isLoading"
            class="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"
          ></span>
          {{ isLoading ? "Menyimpan..." : isEditing ? "Update" : "Simpan" }}
        </button>
      </div>
    </div>

    <!-- Filter Section -->
    <div
      class="bg-white/70 dark:bg-black/40 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)] border border-white/80 dark:border-white/10 p-6 mb-8 transition-all"
    >
      <div class="flex items-center justify-between mb-5">
        <h2
          class="text-[17px] font-bold text-slate-800 dark:text-white tracking-tight"
        >
          Filter Pencarian
        </h2>

        <button
          @click="resetFilter"
          class="group flex items-center gap-1.5 text-[14px] font-medium text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors active:scale-95"
        >
          <RefreshCw
            :size="14"
            class="transition-transform duration-500 group-hover:rotate-180"
          />
          Reset Filter
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <input
          type="date"
          v-model="filterStartDate"
          class="w-full px-4 py-3 text-[14px] rounded-2xl border border-slate-200/80 dark:border-white/5 bg-slate-50/60 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-blue-500/40 dark:focus:ring-blue-400/40 transition-all duration-300 shadow-[inset_0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
        />

        <input
          type="date"
          v-model="filterEndDate"
          class="w-full px-4 py-3 text-[14px] rounded-2xl border border-slate-200/80 dark:border-white/5 bg-slate-50/60 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-blue-500/40 dark:focus:ring-blue-400/40 transition-all duration-300 shadow-[inset_0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
        />

        <select
          v-model="filterType"
          class="w-full px-4 py-3 text-[14px] rounded-2xl border border-slate-200/80 dark:border-white/5 bg-slate-50/60 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-blue-500/40 dark:focus:ring-blue-400/40 transition-all duration-300 appearance-none cursor-pointer shadow-[inset_0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
        >
          <option value="all" class="bg-white dark:bg-slate-800">
            Semua Tipe
          </option>
          <option value="income" class="bg-white dark:bg-slate-800">
            Pemasukan (Income)
          </option>
          <option value="expense" class="bg-white dark:bg-slate-800">
            Pengeluaran (Expense)
          </option>
        </select>

        <select
          v-model="filterCategory"
          class="w-full px-4 py-3 text-[14px] rounded-2xl border border-slate-200/80 dark:border-white/5 bg-slate-50/60 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-blue-500/40 dark:focus:ring-blue-400/40 transition-all duration-300 appearance-none cursor-pointer shadow-[inset_0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
        >
          <option value="all" class="bg-white dark:bg-slate-800">
            Semua Kategori
          </option>
          <option
            v-for="cat in categories"
            :key="cat.id"
            :value="cat.id"
            class="bg-white dark:bg-slate-800"
          >
            {{ cat.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- List Section -->
    <div
      class="bg-white/70 dark:bg-black/40 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)] border border-white/80 dark:border-white/10 p-6 sm:p-8 transition-all"
    >
      <!-- Header & Search -->
      <div
        class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-slate-200/60 dark:border-slate-700/30 pb-5"
      >
        <h2
          class="text-[19px] font-bold text-slate-800 dark:text-white tracking-tight"
        >
          Riwayat Transaksi
        </h2>

        <div class="flex items-center gap-3 w-full md:w-auto">
          <!-- Search Bar Kaca -->
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari transaksi..."
            class="w-full md:w-64 px-4 py-2.5 text-[14px] rounded-full border border-slate-200/80 dark:border-white/5 bg-slate-50/60 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-blue-500/40 dark:focus:ring-blue-400/40 transition-all shadow-[inset_0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
          />
          <!-- Item Count Badge -->
          <span
            class="text-[13px] font-medium text-slate-600 dark:text-slate-300 bg-white/60 dark:bg-white/10 border border-slate-200/60 dark:border-white/5 px-3.5 py-2.5 rounded-full whitespace-nowrap shadow-sm backdrop-blur-md"
          >
            {{ filteredTransactions.length }} Item
          </span>
        </div>
      </div>

      <!-- Empty State (No Icon, Super Clean) -->
      <div
        v-if="filteredTransactions.length === 0"
        class="flex flex-col items-center justify-center py-14 border border-dashed border-slate-300/70 dark:border-slate-700/50 rounded-[1.5rem] bg-white/30 dark:bg-white/5 backdrop-blur-sm"
      >
        <p class="text-slate-500 dark:text-slate-400 font-medium text-[14px]">
          Tidak ada transaksi yang sesuai.
        </p>
      </div>

      <!-- List Items -->
      <div class="space-y-2.5">
        <div
          v-for="trx in filteredTransactions"
          :key="trx.id"
          class="flex items-center justify-between gap-4 p-4 pl-5 pr-4 rounded-[1.5rem] bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/5 hover:bg-white/90 dark:hover:bg-white/10 transition-all duration-300 group shadow-[0_2px_10px_rgba(0,0,0,0.02)] dark:shadow-none"
        >
          <!-- Kiri: Dot Indicator + Deskripsi -->
          <div class="flex items-center gap-4 min-w-0 flex-1">
            <!-- Apple-style Glowing Dot (Pengganti Icon Panah) -->
            <div
              :class="[
                'w-2.5 h-2.5 shrink-0 rounded-full shadow-sm',
                trx.type === 'income'
                  ? 'bg-emerald-400 dark:bg-emerald-500 shadow-emerald-400/50'
                  : 'bg-rose-400 dark:bg-rose-500 shadow-rose-400/50',
              ]"
            ></div>

            <div class="min-w-0">
              <p
                class="font-bold text-[15px] text-slate-800 dark:text-slate-100 truncate tracking-tight"
              >
                {{ trx.description }}
              </p>
              <p
                class="text-[12px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate mt-0.5"
              >
                <span
                  class="px-2 py-0.5 bg-slate-200/50 dark:bg-slate-800/50 rounded-md text-slate-600 dark:text-slate-300"
                >
                  {{ trx.category?.name || "Lainnya" }}
                </span>
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

          <!-- Kanan: Nominal + Aksi -->
          <div class="flex items-center gap-4 shrink-0">
            <!-- Nominal -->
            <div
              :class="[
                'font-bold text-right text-[15px] tracking-tight',
                trx.type === 'income'
                  ? 'text-emerald-500 dark:text-emerald-400'
                  : 'text-rose-500 dark:text-rose-400',
              ]"
            >
              {{ trx.type === "income" ? "+" : "-" }}
              {{ formatCurrency(trx.amount) }}
            </div>

            <!-- Tombol Aksi (Icon Tetap Ada Karena CTA) -->
            <div
              class="flex items-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-full shadow-sm overflow-hidden"
            >
              <button
                @click="editTransaction(trx)"
                class="p-2.5 text-slate-400 hover:text-blue-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                title="Edit"
              >
                <Edit :size="14" stroke-width="2.5" />
              </button>
              <div class="w-px h-4 bg-slate-200 dark:bg-slate-700"></div>
              <button
                @click="deleteTransaction(trx.id)"
                class="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
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
