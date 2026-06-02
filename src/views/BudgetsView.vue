<script setup>
import { ref, onMounted } from "vue";
import api from "../api/axios";
import { formatCurrency } from "../utils/currency";
import { toast } from "vue3-toastify";
import { ChevronDown } from "lucide-vue-next";
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
const isTipsOpen = ref(false);

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

// Ganti fungsi ini di Budgets.vue
const loadBudgetStatus = async () => {
  try {
    const res = await api.get("/budgets/status");
    // 🔥 TAMBAHAN SAFETY: Kalau res.data null, paksa jadi array kosong []
    statusList.value = res.data || [];
    console.log("Data Budget:", statusList.value);
  } catch (err) {
    console.error("Gagal memuat status budget:", err);
    // Jangan kasih toast error kalau cuma karena data kosong, tapi kasih kalau server mati
    if (err.response?.status !== 404) {
      toast.error("Gagal memuat status budget.");
    }
    statusList.value = []; // Reset ke array kosong biar UI gak zonk
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
    <!--Header Section -->
    <div class="mb-10">
      <div
        class="mb-6 border-l-4 border-slate-800 pl-4 dark:border-slate-300 flex flex-col sm:flex-row sm:items-end justify-between gap-4"
      >
        <div>
          <h1
            class="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl"
          >
            Budget Bulanan
          </h1>
          <p class="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Jangan sampai pas akhir bulan cuma sisa debu.
          </p>
        </div>
      </div>

      <button
        @click="isTipsOpen = !isTipsOpen"
        class="group flex items-center gap-2.5 px-4 py-2.5 bg-white/70 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-300 mb-2"
      >
        <div
          class="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50 group-hover:scale-110 transition-transform"
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
              class="absolute -top-12 -right-12 w-40 h-40 bg-blue-500/15 dark:bg-blue-500/20 rounded-full blur-3xl pointer-events-none transition-transform duration-700 group-hover:scale-110"
            ></div>
            <div class="relative z-10">
              <h3
                class="text-[19px] sm:text-xl font-extrabold text-slate-800 dark:text-white mb-3 tracking-tight"
              >
                Aturan Emas 50/30/20
              </h3>
              <p
                class="text-[14px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium"
              >
                Biar nggak pusing mikirin alokasi, coba pakai rumus ini:
                <strong>50%</strong> buat kebutuhan pokok (makan, kos, tagihan),
                <strong>30%</strong> buat keinginan (nongkrong, hobi, jajan),
                dan <strong>20%</strong> wajib disisihkan buat tabungan atau
                investasi. Sesuaikan sama gaya hidupmu!
              </p>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- Form Action -->
    <!-- Form Section Budget: iOS Glassmorphism (With Icons!) 🪟✨ -->
    <div
      class="bg-white/70 dark:bg-black/40 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)] border border-white/80 dark:border-white/10 p-6 sm:p-8 mb-10 transition-all"
    >
      <!-- Form Header -->
      <div
        class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/60 dark:border-slate-700/30 pb-5 mb-6"
      >
        <h2
          class="text-[19px] sm:text-xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2.5"
        >
          <!-- Icon Title -->
          <component
            :is="isEditing ? Edit : PlusCircle"
            :size="22"
            class="text-blue-500 drop-shadow-sm"
          />
          {{ isEditing ? "Edit Limit Budget" : "Buat Budget Baru" }}
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

        <!-- Input Batas Maksimal -->
        <div class="space-y-1.5">
          <label
            class="block text-[13px] font-semibold text-slate-600 dark:text-slate-300/90 ml-1"
          >
            Batas Maksimal (Rp)
          </label>
          <div class="relative group">
            <div
              class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors"
            >
              <Banknote :size="18" />
            </div>
            <input
              v-model="limitAmount"
              type="number"
              placeholder="Contoh: 1500000"
              class="w-full pl-11 pr-4 py-3.5 text-[15px] rounded-2xl border border-slate-200/80 dark:border-white/5 bg-slate-50/60 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-blue-500/40 dark:focus:ring-blue-400/40 transition-all duration-300 placeholder-slate-400 dark:placeholder-slate-500 shadow-[inset_0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
            />
          </div>
        </div>

        <!-- Input Bulan -->
        <div class="space-y-1.5">
          <label
            class="block text-[13px] font-semibold text-slate-600 dark:text-slate-300/90 ml-1"
          >
            Bulan (1-12)
          </label>
          <div class="relative group">
            <div
              class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors"
            >
              <Calendar :size="18" />
            </div>
            <input
              v-model="month"
              type="number"
              min="1"
              max="12"
              placeholder="Bulan"
              class="w-full pl-11 pr-4 py-3.5 text-[15px] rounded-2xl border border-slate-200/80 dark:border-white/5 bg-slate-50/60 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-blue-500/40 dark:focus:ring-blue-400/40 transition-all duration-300 placeholder-slate-400 dark:placeholder-slate-500 shadow-[inset_0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
            />
          </div>
        </div>

        <!-- Input Tahun -->
        <div class="space-y-1.5">
          <label
            class="block text-[13px] font-semibold text-slate-600 dark:text-slate-300/90 ml-1"
          >
            Tahun
          </label>
          <div class="relative group">
            <div
              class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors"
            >
              <Target :size="18" />
            </div>
            <input
              v-model="year"
              type="number"
              placeholder="Tahun"
              class="w-full pl-11 pr-4 py-3.5 text-[15px] rounded-2xl border border-slate-200/80 dark:border-white/5 bg-slate-50/60 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-blue-500/40 dark:focus:ring-blue-400/40 transition-all duration-300 placeholder-slate-400 dark:placeholder-slate-500 shadow-[inset_0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
            />
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
          @click="saveBudget"
          :disabled="isLoading"
          class="text-[15px] font-medium bg-blue-500 hover:bg-blue-600 text-white py-3 px-8 rounded-full transition-all duration-300 shadow-[0_4px_16px_rgba(59,130,246,0.3)] hover:shadow-[0_4px_20px_rgba(59,130,246,0.5)] active:scale-[0.97] disabled:opacity-70 disabled:hover:scale-100 flex items-center gap-2"
        >
          <span
            v-if="isLoading"
            class="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"
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
        class="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5"
      >
        Monitoring Budget <AlertTriangle :size="20" class="text-amber-500" />
      </h2>
    </div>

    <!-- List -->
    <div>
      <!-- Empty State (Kaca Buram Elegan) -->
      <div
        v-if="statusList.length === 0"
        class="flex flex-col items-center justify-center py-16 border border-dashed border-slate-300/70 dark:border-slate-700/50 rounded-[2rem] bg-white/30 dark:bg-white/5 backdrop-blur-sm transition-all"
      >
        <div
          class="w-14 h-14 bg-white/50 dark:bg-white/10 rounded-full flex items-center justify-center mb-4 shadow-sm border border-white/60 dark:border-white/5"
        >
          <Target :size="24" class="text-slate-400 dark:text-slate-500" />
        </div>
        <p class="text-[14px] text-slate-500 dark:text-slate-400 font-medium">
          Belum ada budget yang diatur bulan ini.
        </p>
      </div>

      <!-- Budget Cards Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
        <div
          v-for="item in statusList"
          :key="item.category"
          :class="[
            'relative overflow-hidden backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)] p-6 sm:p-8 transition-all duration-300 hover:shadow-[0_8px_40px_rgb(0,0,0,0.12)] hover:-translate-y-1 group',
            item.status === 'exceeded'
              ? 'bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/30'
              : 'bg-white/70 dark:bg-black/40 border border-white/80 dark:border-white/10',
          ]"
        >
          <!-- Floating Action Buttons (Muncul pas di-hover) -->
          <div
            class="absolute top-5 right-5 flex items-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 rounded-full overflow-hidden shadow-md z-20 scale-95 lg:group-hover:scale-100"
          >
            <button
              v-if="item.id || item.budget_id"
              @click="editBudget(item)"
              class="p-2.5 px-3 text-slate-400 hover:text-blue-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              title="Edit"
            >
              <Edit :size="14" stroke-width="2.5" />
            </button>
            <div class="w-px h-4 bg-slate-200 dark:bg-slate-700"></div>
            <button
              v-if="item.id || item.budget_id"
              @click="deleteBudget(item.id || item.budget_id)"
              class="p-2.5 px-3 text-slate-400 hover:text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              title="Hapus"
            >
              <Trash2 :size="14" stroke-width="2.5" />
            </button>
          </div>

          <!-- Card Header: Icon, Title & Badge -->
          <div
            class="flex flex-wrap items-center gap-3.5 mb-6 pr-16 relative z-10"
          >
            <!-- Icon Kaca -->
            <div
              class="w-10 h-10 rounded-[1rem] bg-white/60 dark:bg-white/10 flex items-center justify-center border border-white/80 dark:border-white/5 shadow-sm"
            >
              <Layers :size="18" class="text-slate-500 dark:text-slate-400" />
            </div>

            <h3
              class="font-extrabold text-[19px] sm:text-xl text-slate-800 dark:text-white tracking-tight"
            >
              {{ item.category }}
            </h3>

            <!-- Status Badge -->
            <div
              :class="[
                'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border transition-colors',
                item.status === 'exceeded'
                  ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
                  : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
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

          <!-- Progress Section -->
          <div class="mb-6 relative z-10">
            <div
              class="flex justify-between items-end text-[13px] font-bold mb-2.5"
            >
              <span class="text-slate-500 dark:text-slate-400">
                Terpakai:
                <span class="text-slate-800 dark:text-slate-200">{{
                  formatCurrency(item.spent)
                }}</span>
              </span>
              <span
                class="text-[15px] text-slate-900 dark:text-white tracking-tight"
              >
                {{ getProgressPercentage(item.spent, item.limit).toFixed(0) }}%
              </span>
            </div>

            <!-- Progress Bar Background Kaca -->
            <div
              class="w-full bg-slate-200/60 dark:bg-slate-700/40 rounded-full h-2.5 overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]"
            >
              <!-- Math.min mencegah bar bablas keluar kalau persentase > 100% -->
              <div
                :class="[
                  'h-full rounded-full transition-all duration-1000 ease-out',
                  getProgressColor(item.spent, item.limit),
                ]"
                :style="{
                  width: `${Math.min(getProgressPercentage(item.spent, item.limit), 100)}%`,
                }"
              ></div>
            </div>
          </div>

          <!-- Footer Details (Limit & Sisa) -->
          <div
            class="grid grid-cols-2 gap-4 pt-5 border-t border-slate-200/60 dark:border-slate-700/30 relative z-10"
          >
            <div>
              <p
                class="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1"
              >
                Batas Budget
              </p>
              <p
                class="text-[15px] font-extrabold text-slate-800 dark:text-white tracking-tight"
              >
                {{ formatCurrency(item.limit) }}
              </p>
            </div>
            <div class="text-right">
              <p
                class="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1"
              >
                Sisa Budget
              </p>
              <p
                :class="[
                  'text-[15px] font-extrabold tracking-tight',
                  item.status === 'exceeded'
                    ? 'text-rose-500'
                    : 'text-emerald-500 dark:text-emerald-400',
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
  </div>
</template>
