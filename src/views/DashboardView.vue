<script setup>
import { ref, onMounted, computed } from "vue";
import api from "../api/axios";
import { formatCurrency } from "../utils/currency";
import IncomeChart from "../components/IncomeChart.vue";
import ExpenseChart from "../components/ExpenseChart.vue";
import CategoryPieChart from "../components/CategoryPieChart.vue";
import {
  FileText,
  Download,
  Calendar,
  Wallet,
  TrendingUp,
  TrendingDown,
} from "lucide-vue-next";

const isLoadingReport = ref(false);
const summary = ref({
  total_balance: 0,
  total_income: 0,
  total_expense: 0,
});

const userName = ref("");
const incomeData = ref([]);
const expenseData = ref([]);
const categoryData = ref([]);

// ==========================================
// 🔥 FUNGSI DYNAMIC GREETING
// ==========================================
const greetingMsg = computed(() => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 15) return "Good Afternoon";
  if (hour >= 15 && hour < 18) return "Good Evening";
  return "Good Night";
});

const greetingIcon = computed(() => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "🌅";
  if (hour >= 12 && hour < 15) return "☀️";
  if (hour >= 15 && hour < 18) return "🌇";
  return "🌙";
});

// ==========================================
// DATA FETCHING
// ==========================================
const loadSummary = async () => {
  try {
    const res = await api.get("/dashboard/summary");
    summary.value = {
      total_income: res.data.total_income || 0,
      total_expense: res.data.total_expense || 0,
      total_balance: res.data.net_balance || 0,
    };
  } catch (err) {
    console.error("Gagal memuat summary:", err);
  }
};

const loadUserProfile = async () => {
  try {
    const res = await api.get("/auth/profile");
    userName.value = res.data.name.split(" ")[0];
  } catch (err) {
    console.error("Gagal memuat profil:", err);
  }
};

const exportReport = async (type) => {
  try {
    isLoadingReport.value = true;
    const response = await api.get(`/reports/${type}`, {
      responseType: "blob",
    });

    const blob = new Blob([response.data], {
      type: type === "pdf" ? "application/pdf" : "text/csv",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    const dateStr = new Date().toISOString().split("T")[0];
    link.setAttribute(
      "download",
      `Laporan_Keuangan_SAEduid_${dateStr}.${type}`,
    );

    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error(`Gagal mengekspor ${type.toUpperCase()}:`, err);
    alert(`Gagal mendownload laporan ${type.toUpperCase()}.`);
  } finally {
    isLoadingReport.value = false;
  }
};

const loadAnalytics = async () => {
  try {
    const res = await api.get("/dashboard/analytics");
    incomeData.value = res.data.monthly_income || [];
    expenseData.value = res.data.monthly_expense || [];
    categoryData.value = res.data.category_distribution || [];
  } catch (err) {
    console.error("Gagal memuat data analytics:", err);
  }
};

onMounted(() => {
  loadSummary();
  loadUserProfile();
  loadAnalytics();
});
</script>

<template>
  <!-- Wrapper dengan padding yang pas -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
    <!-- Header Dashboard -->
    <div
      class="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10"
    >
      <div>
        <h1
          class="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2"
        >
          {{ greetingMsg }}, {{ userName || "Creative" }} {{ greetingIcon }}
        </h1>
        <p
          class="text-slate-500 dark:text-slate-400 flex items-center gap-2 text-sm font-medium"
        >
          <Calendar :size="16" /> Overview of your financial status today.
        </p>
      </div>

      <!-- Tombol Aksi Laporan (Pill Shaped) -->
      <div class="flex items-center gap-3">
        <button
          @click="exportReport('csv')"
          :disabled="isLoadingReport"
          class="flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-2.5 px-6 rounded-full border border-slate-200 dark:border-slate-700 transition-all duration-300 shadow-sm hover:shadow active:scale-95 disabled:opacity-50 text-sm"
        >
          <Download :size="16" class="text-slate-500 dark:text-slate-400" />
          <span>Export CSV</span>
        </button>

        <button
          @click="exportReport('pdf')"
          :disabled="isLoadingReport"
          class="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 px-6 rounded-full transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 disabled:opacity-50 text-sm"
        >
          <FileText :size="16" />
          <span>{{ isLoadingReport ? "Processing..." : "Export PDF" }}</span>
        </button>
      </div>
    </div>

    <!-- Ringkasan Statistik Card Utama (Quick Stats) -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <!-- Card Saldo (Premium Gradient) -->
      <div
        class="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 dark:from-slate-800 dark:via-slate-900 dark:to-blue-950 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden border border-slate-800 dark:border-slate-700/50 flex flex-col justify-between transition-all hover:-translate-y-1 duration-300 group"
      >
        <!-- Abstract Glow Background -->
        <div
          class="absolute -right-8 -top-8 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-400/30 transition-all duration-500"
        ></div>
        <div
          class="absolute -left-8 -bottom-8 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl"
        ></div>

        <div class="flex justify-between items-start mb-6 relative z-10">
          <div
            class="p-3.5 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 shadow-inner"
          >
            <Wallet :size="24" class="text-blue-300" />
          </div>
        </div>
        <div class="relative z-10">
          <p
            class="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1.5 opacity-80"
          >
            Total Balance
          </p>
          <!-- Ganti bagian h3 ini di Card Saldo -->
          <h3
            class="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight truncate w-full"
          >
            {{ formatCurrency(summary.total_balance) }}
          </h3>
        </div>
      </div>

      <!-- Card Pemasukan (Clean Modern) -->
      <div
        class="bg-white dark:bg-slate-800/80 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-700/60 shadow-sm flex flex-col justify-between transition-all hover:shadow-lg hover:-translate-y-1 duration-300 backdrop-blur-sm"
      >
        <div class="flex justify-between items-start mb-6">
          <div
            class="p-3.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100/50 dark:border-emerald-500/20"
          >
            <TrendingUp :size="24" class="text-emerald-500" />
          </div>
        </div>
        <div>
          <p
            class="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5"
          >
            Total Income
          </p>
          <h3
            class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight"
          >
            {{ formatCurrency(summary.total_income) }}
          </h3>
        </div>
      </div>

      <!-- Card Pengeluaran (Clean Modern) -->
      <div
        class="bg-white dark:bg-slate-800/80 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-700/60 shadow-sm flex flex-col justify-between transition-all hover:shadow-lg hover:-translate-y-1 duration-300 backdrop-blur-sm"
      >
        <div class="flex justify-between items-start mb-6">
          <div
            class="p-3.5 bg-rose-50 dark:bg-rose-500/10 rounded-2xl border border-rose-100/50 dark:border-rose-500/20"
          >
            <TrendingDown :size="24" class="text-rose-500" />
          </div>
        </div>
        <div>
          <p
            class="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5"
          >
            Total Expense
          </p>
          <h3
            class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight"
          >
            {{ formatCurrency(summary.total_expense) }}
          </h3>
        </div>
      </div>
    </div>

    <!-- Area Visualisasi Chart -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Line Charts Container -->
      <div
        class="lg:col-span-2 bg-white dark:bg-slate-800/80 rounded-[2rem] border border-slate-100 dark:border-slate-700/60 p-7 shadow-sm transition-colors backdrop-blur-sm"
      >
        <div class="flex items-center justify-between mb-6">
          <h3
            class="text-xl font-bold text-slate-900 dark:text-white tracking-tight"
          >
            Transactions Overview
          </h3>
        </div>
        <div class="space-y-8">
          <IncomeChart :data="incomeData" />
          <ExpenseChart :data="expenseData" />
        </div>
      </div>

      <!-- Pie Chart Container -->
      <div
        class="bg-white dark:bg-slate-800/80 rounded-[2rem] border border-slate-100 dark:border-slate-700/60 p-7 shadow-sm flex flex-col justify-between transition-colors backdrop-blur-sm"
      >
        <div class="h-full flex flex-col">
          <h3
            class="text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-6"
          >
            Expense by Category
          </h3>
          <div class="flex-grow flex items-center justify-center">
            <CategoryPieChart :data="categoryData" class="w-full" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
