<script setup>
import { ref, onMounted } from "vue";
import api from "../api/axios";
import { formatCurrency } from "../utils/currency";
import { toast } from "vue3-toastify";
import {
  AlertCircle,
  CheckCircle,
  Edit,
  Trash2,
  Layers,
  Banknote,
  Calendar,
  Target,
  PlusCircle,
  XCircle,
  AlertTriangle,
} from "lucide-vue-next";

const categories = ref([]);
const statusList = ref([]);
const isLoading = ref(false);

const categoryId = ref("");
const limitAmount = ref("");
const month = ref(new Date().getMonth() + 1);
const year = ref(new Date().getFullYear());

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

const saveBudget = async () => {
  if (!categoryId.value || !limitAmount.value || !month.value || !year.value) {
    toast.warning("Harap lengkapi semua data budget!");
    return;
  }

  try {
    isLoading.value = true;
    const payload = {
      category_id: categoryId.value,
      limit_amount: Number(limitAmount.value), // 🔥 AMAN CUY, INI UDAH BENER
      month: Number(month.value),
      year: Number(year.value),
    };

    if (isEditing.value) {
      await api.put(`/budgets/${editId.value}`, payload);
      toast.success("Budget berhasil diupdate!");
    } else {
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
  editId.value = item.id || item.budget_id;
  categoryId.value = item.category_id;
  limitAmount.value = item.limit;
  month.value = item.month || new Date().getMonth() + 1;
  year.value = item.year || new Date().getFullYear();

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

// 🔥 FUNGSI BARU BUAT PROGRESS BAR
const getProgressPercentage = (spent, limit) => {
  if (!limit || limit === 0) return 0;
  return Math.min((spent / limit) * 100, 100);
};

const getProgressColor = (spent, limit) => {
  const perc = getProgressPercentage(spent, limit);
  if (perc >= 100) return "bg-rose-500"; // Merah (Bocor)
  if (perc >= 80) return "bg-amber-500"; // Kuning (Warning)
  return "bg-emerald-500"; // Hijau (Aman)
};

onMounted(() => {
  loadCategories();
  loadBudgetStatus();
});
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
    <div class="mb-10">
      <h1
        class="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight"
      >
        Manajemen Budget 🎯
      </h1>
      <p class="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">
        Atur batas pengeluaran biar kantong nggak jebol di akhir bulan.
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
          {{ isEditing ? "Edit Limit Budget" : "Buat Budget Baru" }}
        </h2>
        <button
          v-if="isEditing"
          @click="cancelEdit"
          class="flex items-center gap-1 text-sm font-semibold text-rose-500 hover:text-rose-600 transition-colors"
        >
          <XCircle :size="16" /> Batal Edit
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
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

        <div class="space-y-1.5">
          <label
            class="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
            >Batas Maksimal (Rp)</label
          >
          <div class="relative group">
            <div
              class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors"
            >
              <Banknote :size="16" />
            </div>
            <input
              v-model="limitAmount"
              type="number"
              placeholder="Contoh: 1500000"
              class="w-full pl-11 pr-4 py-3 text-sm rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-slate-400"
            />
          </div>
        </div>

        <div class="space-y-1.5">
          <label
            class="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
            >Bulan (1-12)</label
          >
          <div class="relative group">
            <div
              class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors"
            >
              <Calendar :size="16" />
            </div>
            <input
              v-model="month"
              type="number"
              min="1"
              max="12"
              class="w-full pl-11 pr-4 py-3 text-sm rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <div class="space-y-1.5">
          <label
            class="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
            >Tahun</label
          >
          <div class="relative group">
            <div
              class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors"
            >
              <Target :size="16" />
            </div>
            <input
              v-model="year"
              type="number"
              class="w-full pl-11 pr-4 py-3 text-sm rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
      </div>

      <div class="mt-8 flex justify-end gap-3">
        <button
          v-if="isEditing"
          @click="cancelEdit"
          class="text-sm font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 py-3 px-6 rounded-full transition-all duration-300"
        >
          Batal
        </button>
        <button
          @click="saveBudget"
          :disabled="isLoading"
          class="text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-8 rounded-full transition-all duration-300 shadow-md shadow-blue-500/30 active:scale-95 disabled:opacity-70 flex items-center gap-2"
        >
          <span
            v-if="isLoading"
            class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
          ></span>
          {{
            isLoading
              ? "Processing..."
              : isEditing
                ? "Update Budget"
                : "Simpan Budget"
          }}
        </button>
      </div>
    </div>

    <div class="flex items-center justify-between mb-6">
      <h2
        class="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2"
      >
        Monitoring Budget <AlertTriangle :size="20" class="text-amber-500" />
      </h2>
    </div>

    <div
      v-if="statusList.length === 0"
      class="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2rem] bg-white/50 dark:bg-slate-800/50"
    >
      <div
        class="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3"
      >
        <Target :size="24" class="text-slate-300 dark:text-slate-500" />
      </div>
      <p class="text-slate-400 dark:text-slate-500 font-medium text-sm">
        Belum ada budget yang diatur bulan ini.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
      <div
        v-for="item in statusList"
        :key="item.category"
        :class="[
          'bg-white dark:bg-slate-800/90 rounded-[2rem] p-7 border shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group relative backdrop-blur-sm',
          item.status === 'exceeded'
            ? 'border-rose-200 dark:border-rose-900/50'
            : 'border-slate-100 dark:border-slate-700/60',
        ]"
      >
        <div
          class="absolute top-5 right-5 flex items-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full overflow-hidden shadow-sm z-10"
        >
          <button
            v-if="item.id || item.budget_id"
            @click="editBudget(item)"
            class="p-2.5 text-slate-400 hover:text-blue-500 hover:bg-white dark:hover:bg-slate-700 transition-colors"
            title="Edit"
          >
            <Edit :size="14" stroke-width="2.5" />
          </button>
          <div class="w-px h-4 bg-slate-200 dark:bg-slate-700"></div>
          <button
            v-if="item.id || item.budget_id"
            @click="deleteBudget(item.id || item.budget_id)"
            class="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-700 transition-colors"
            title="Hapus"
          >
            <Trash2 :size="14" stroke-width="2.5" />
          </button>
        </div>

        <div class="flex justify-between items-start mb-5 pr-20">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center border border-slate-100 dark:border-slate-600"
            >
              <Layers :size="18" class="text-slate-500 dark:text-slate-400" />
            </div>
            <h3
              class="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight"
            >
              {{ item.category }}
            </h3>
          </div>

          <div
            :class="[
              'absolute right-6 top-6 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
              item.status === 'exceeded'
                ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
            ]"
          >
            <AlertCircle
              v-if="item.status === 'exceeded'"
              :size="12"
              stroke-width="3"
            />
            <CheckCircle v-else :size="12" stroke-width="3" />
            {{ item.status === "exceeded" ? "Bocor" : "Aman" }}
          </div>
        </div>

        <div class="mb-6">
          <div class="flex justify-between text-xs font-bold mb-2">
            <span class="text-slate-500 dark:text-slate-400"
              >Terpakai: {{ formatCurrency(item.spent) }}</span
            >
            <span class="text-slate-900 dark:text-white"
              >{{
                getProgressPercentage(item.spent, item.limit).toFixed(0)
              }}%</span
            >
          </div>
          <div
            class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden"
          >
            <div
              :class="[
                'h-2.5 rounded-full transition-all duration-1000 ease-out',
                getProgressColor(item.spent, item.limit),
              ]"
              :style="{
                width: `${getProgressPercentage(item.spent, item.limit)}%`,
              }"
            ></div>
          </div>
        </div>

        <div
          class="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-700/60"
        >
          <div>
            <p
              class="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5"
            >
              Batas Budget
            </p>
            <p class="text-sm font-bold text-slate-900 dark:text-white">
              {{ formatCurrency(item.limit) }}
            </p>
          </div>
          <div class="text-right">
            <p
              class="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5"
            >
              Sisa Budget
            </p>
            <p
              :class="[
                'text-sm font-extrabold',
                item.status === 'exceeded'
                  ? 'text-rose-500'
                  : 'text-emerald-500',
              ]"
            >
              {{ item.status === "exceeded" ? "-" : ""
              }}{{ formatCurrency(Math.abs(item.remaining)) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
