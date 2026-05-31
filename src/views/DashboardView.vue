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

// State baru buat nyimpen nama user
const userName = ref("");

// ==========================================
// 🔥 FUNGSI DYNAMIC GREETING
// ==========================================
const greetingMsg = computed(() => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Selamat Pagi";
  if (hour >= 12 && hour < 15) return "Selamat Siang";
  if (hour >= 15 && hour < 18) return "Selamat Sore";
  return "Selamat Malam";
});

const greetingIcon = computed(() => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "🌅"; // Pagi
  if (hour >= 12 && hour < 15) return "☀️"; // Siang
  if (hour >= 15 && hour < 18) return "🌇"; // Sore
  return "🌙"; // Malam
});

// ==========================================
// DATA FETCHING
// ==========================================
const loadSummary = async () => {
  try {
    const res = await api.get("/dashboard/summary");

    // 🔥 KITA MAPPING DATANYA DI SINI BIAR COCOK SAMA TEMPLATE
    summary.value = {
      total_income: res.data.total_income || 0,
      total_expense: res.data.total_expense || 0,
      // INI KUNCINYA: Ambil net_balance dari backend, masukin ke total_balance
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

onMounted(() => {
  loadSummary();
  loadUserProfile(); // Load nama user pas dashboard dibuka
});
</script>


<!-- ASSALAMUALAIKUM -->
 
<template>
  <div class="max-w-7xl mx-auto">
    <!-- Header Dashboard dengan Dynamic Greeting -->
    <div
      class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
    >
      <div>
        <h1
          class="text-4xl font-bold text-slate-900 dark:text-white tracking-tight"
        >
          {{ greetingMsg }}, {{ userName || "User" }} {{ greetingIcon }}
        </h1>
        <p
          class="text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-2"
        >
          <Calendar :size="16" /> Pantau arus kas dan kendalikan anggaran
          keuanganmu.
        </p>
      </div>

      <!-- Tombol Aksi Laporan -->
      <div class="flex items-center gap-3">
        <button
          @click="exportReport('csv')"
          :disabled="isLoadingReport"
          class="flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-2.5 px-5 rounded-xl border border-slate-200 dark:border-slate-700 transition-all shadow-sm hover:shadow active:scale-95 disabled:opacity-50"
        >
          <Download :size="18" class="text-slate-500 dark:text-slate-400" />
          <span>Export CSV</span>
        </button>

        <button
          @click="exportReport('pdf')"
          :disabled="isLoadingReport"
          class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50"
        >
          <FileText :size="18" />
          <span>{{ isLoadingReport ? "Mengunduh..." : "Cetak PDF" }}</span>
        </button>
      </div>
    </div>

    <!-- Ringkasan Statistik Card Utama (Quick Stats) -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <!-- Card Saldo -->
      <div
        class="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-slate-800 dark:border-slate-700/50 flex flex-col justify-between transition-colors"
      >
        <div
          class="absolute -right-4 -bottom-4 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"
        ></div>
        <div class="flex justify-between items-start mb-4 relative z-10">
          <div
            class="p-3 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/5"
          >
            <Wallet :size="24" class="text-blue-400" />
          </div>
        </div>
        <div class="relative z-10">
          <p
            class="text-sm font-medium text-slate-400 uppercase tracking-wider mb-1"
          >
            Total Saldo Saat Ini
          </p>
          <h3 class="text-4xl font-extrabold tracking-tight">
            {{ formatCurrency(summary.total_balance) }}
          </h3>
        </div>
      </div>

      <!-- Card Pemasukan -->
      <div
        class="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between transition-colors hover:shadow-md"
      >
        <div class="flex justify-between items-start mb-4">
          <div
            class="p-3 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-800/30"
          >
            <TrendingUp :size="24" class="text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div>
          <p
            class="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1"
          >
            Pemasukan
          </p>
          <h3
            class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight"
          >
            {{ formatCurrency(summary.total_income) }}
          </h3>
        </div>
      </div>

      <!-- Card Pengeluaran -->
      <div
        class="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between transition-colors hover:shadow-md"
      >
        <div class="flex justify-between items-start mb-4">
          <div
            class="p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-800/30"
          >
            <TrendingDown :size="24" class="text-red-600 dark:text-red-400" />
          </div>
        </div>
        <div>
          <p
            class="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1"
          >
            Pengeluaran
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
      <div
        class="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm transition-colors"
      >
        <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-4">
          Grafik Transaksi
        </h3>
        <div class="space-y-6">
          <IncomeChart />
          <ExpenseChart />
        </div>
      </div>
      <div
        class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm flex flex-col justify-between transition-colors"
      >
        <div>
          <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-2">
            Distribusi Pengeluaran
          </h3>
          <CategoryPieChart />
        </div>
      </div>
    </div>
  </div>
</template>
