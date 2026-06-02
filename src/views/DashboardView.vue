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
  Sun,
  CloudSun,
  Moon,
  RefreshCw,
} from "lucide-vue-next";

const isLoadingReport = ref(false);
const summary = ref({ total_balance: 0, total_income: 0, total_expense: 0 });
const userName = ref("");
const incomeData = ref([]);
const expenseData = ref([]);
const categoryData = ref([]);
const insight = ref(null);
const insightLoading = ref(false);
const predictions = ref([]);

const greetingMsg = computed(() => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 15) return "Good Afternoon";
  if (hour >= 15 && hour < 18) return "Good Evening";
  return "Good Night";
});

const loadDashboardData = async () => {
  try {
    const [resSummary, resUser, resAnalytics, resInsight, resPredictions] =
      await Promise.all([
        api.get("/dashboard/summary"),
        api.get("/auth/profile"),
        api.get("/dashboard/analytics"),
        api.get("/ai/insight"),
        api.get("/ai/predictions"),
      ]);

    summary.value = {
      total_balance: resSummary.data.net_balance || 0,
      total_income: resSummary.data.total_income || 0,
      total_expense: resSummary.data.total_expense || 0,
    };

    userName.value = resUser.data.name.split(" ")[0];
    incomeData.value = resAnalytics.data.monthly_income || [];
    expenseData.value = resAnalytics.data.monthly_expense || [];
    categoryData.value = resAnalytics.data.category_distribution || [];
    insight.value = resInsight.data;
    predictions.value = resPredictions.data || [];
  } catch (err) {
    console.error("Failed to load dashboard data:", err);
  }
};

const loadInsight = async () => {
  insightLoading.value = true;
  try {
    const res = await api.get("/ai/insight");
    insight.value = res.data;
  } catch (err) {
    console.error(err);
  } finally {
    insightLoading.value = false;
  }
};

const exportReport = (type) => {
  console.log(`Exporting ${type} report...`);
};

// 1. Hitung persentase dasar
const getProgressPercentage = (spent, limit) => {
  if (!limit || limit === 0) return 0;
  return (spent / limit) * 100;
};

// 2. Warna untuk isi (fill) Progress Bar (+ efek glow tipis)
const getProgressColor = (spent, limit) => {
  const perc = getProgressPercentage(spent, limit);
  if (perc >= 100)
    return "bg-rose-500 dark:bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]"; // Merah (Bocor)
  if (perc >= 80)
    return "bg-amber-500 dark:bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]"; // Kuning (Warning)
  return "bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]"; // Hijau (Aman)
};

// 3. Warna untuk titik indikator (Dot di sela judul)
const getDotColor = (spent, limit) => {
  const perc = getProgressPercentage(spent, limit);
  if (perc >= 100) return "bg-rose-500 shadow-rose-500/50";
  if (perc >= 80) return "bg-amber-500 shadow-amber-500/50";
  return "bg-emerald-500 shadow-emerald-500/50";
};

const getStatusBadgeStyle = (spent, limit) => {
  const perc = getProgressPercentage(spent, limit);
  if (perc >= 100)
    return "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20"; // Style Bocor
  if (perc >= 80)
    return "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20"; // Style Warning
  return "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"; // Style Aman
};

// 5. Teks otomatis untuk statusnya
const getStatusText = (spent, limit) => {
  const perc = getProgressPercentage(spent, limit);
  if (perc >= 100) return "Over";
  if (perc >= 80) return "Warning";
  return "Safe";
};

onMounted(loadDashboardData);
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div
      class="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10"
    >
      <!-- Greeting Section -->
      <div>
        <h1
          class="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight mb-2 flex items-center gap-3"
        >
          <span class="inline-flex drop-shadow-sm">
            <Sun
              v-if="
                greetingMsg === 'Good Morning' ||
                greetingMsg === 'Good Afternoon'
              "
              :size="32"
              stroke-width="2.5"
              class="text-amber-500 dark:text-amber-400"
            />
            <CloudSun
              v-else-if="greetingMsg === 'Good Evening'"
              :size="32"
              stroke-width="2.5"
              class="text-orange-500 dark:text-orange-400"
            />
            <Moon
              v-else
              :size="32"
              stroke-width="2.5"
              class="text-indigo-500 dark:text-indigo-400"
            />
          </span>

          {{ greetingMsg }}, {{ userName || "Creative" }}
        </h1>

        <!-- Subtitle (Clean, No Icon) -->
        <p
          class="text-slate-500 dark:text-slate-400 text-[15px] font-medium ml-1"
        >
          Here's your financial overview.
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-3">
        <!-- Secondary Button (CSV) -->
        <button
          @click="exportReport('csv')"
          class="flex items-center gap-2 bg-white/70 dark:bg-white/10 hover:bg-white/90 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 text-[14px] font-semibold py-2.5 px-6 rounded-full border border-slate-200/60 dark:border-white/5 backdrop-blur-md shadow-sm transition-all duration-300 active:scale-95"
        >
          <Download :size="16" stroke-width="2.5" />
          Export CSV
        </button>

        <!-- Primary Button (PDF) -->
        <button
          @click="exportReport('pdf')"
          :disabled="isLoadingReport"
          class="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-[14px] font-semibold py-2.5 px-6 rounded-full transition-all duration-300 shadow-[0_4px_16px_rgba(59,130,246,0.3)] hover:shadow-[0_4px_20px_rgba(59,130,246,0.5)] active:scale-[0.97] disabled:opacity-70 disabled:hover:scale-100"
        >
          <FileText v-if="!isLoadingReport" :size="16" stroke-width="2.5" />
          <span
            v-else
            class="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"
          ></span>
          <span>{{ isLoadingReport ? "Processing..." : "Export PDF" }}</span>
        </button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
      <div
        class="relative overflow-hidden bg-white/70 dark:bg-black/40 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)] border border-white/80 dark:border-white/10 p-7 transition-all hover:shadow-[0_8px_40px_rgb(0,0,0,0.12)] group"
      >
        <div
          class="absolute -top-12 -right-12 w-40 h-40 bg-blue-500/20 dark:bg-blue-500/30 rounded-full blur-3xl pointer-events-none transition-transform group-hover:scale-110"
        ></div>

        <div class="flex items-center gap-2.5 mb-3 relative z-10">
          <div
            class="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"
          ></div>
          <p
            class="text-[12px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400"
          >
            Total Balance
          </p>
        </div>

        <h3
          class="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight truncate relative z-10"
        >
          {{ formatCurrency(summary.total_balance) }}
        </h3>
      </div>

      <div
        class="bg-white/70 dark:bg-black/40 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)] border border-white/80 dark:border-white/10 p-7 transition-all hover:shadow-[0_8px_40px_rgb(0,0,0,0.12)]"
      >
        <div class="flex items-center gap-2.5 mb-3">
          <div
            class="w-2.5 h-2.5 rounded-full bg-emerald-400 dark:bg-emerald-500 shadow-sm shadow-emerald-400/50"
          ></div>
          <p
            class="text-[12px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400"
          >
            Total Income
          </p>
        </div>

        <h3
          class="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white tracking-tight truncate"
        >
          {{ formatCurrency(summary.total_income) }}
        </h3>
      </div>

      <div
        class="bg-white/70 dark:bg-black/40 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)] border border-white/80 dark:border-white/10 p-7 transition-all hover:shadow-[0_8px_40px_rgb(0,0,0,0.12)]"
      >
        <div class="flex items-center gap-2.5 mb-3">
          <div
            class="w-2.5 h-2.5 rounded-full bg-rose-400 dark:bg-rose-500 shadow-sm shadow-rose-400/50"
          ></div>
          <p
            class="text-[12px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400"
          >
            Total Expense
          </p>
        </div>

        <h3
          class="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white tracking-tight truncate"
        >
          {{ formatCurrency(summary.total_expense) }}
        </h3>
      </div>
    </div>

    <!-- AI Insight -->
    <div
      class="mt-8 mb-8 bg-white/70 dark:bg-black/40 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)] border border-white/80 dark:border-white/10 p-6 sm:p-8 transition-all"
    >
      <!-- Header Section -->
      <div
        class="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 border-b border-slate-200/60 dark:border-slate-700/30 pb-5"
      >
        <div>
          <h2 class="text-[19px] sm:text-xl font-extrabold tracking-tight">
            <!-- Teks Gradasi ala AI Apple -->
            <span
              class="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400"
            >
              AI Monthly Insight
            </span>
          </h2>
          <p
            class="text-[13px] text-slate-500 dark:text-slate-400 mt-1 font-medium ml-0.5"
          >
            Generated automatically from your financial data.
          </p>
        </div>

        <!-- Refresh Button -->
        <button
          @click="loadInsight"
          class="group flex items-center gap-2 text-[14px] font-medium bg-white/70 dark:bg-white/10 hover:bg-white/90 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 py-2.5 px-5 rounded-full border border-slate-200/60 dark:border-white/5 backdrop-blur-md shadow-sm transition-all duration-300 active:scale-95"
        >
          <RefreshCw
            :size="14"
            class="transition-transform duration-500 group-hover:rotate-180 text-indigo-500 dark:text-indigo-400"
          />
          Refresh
        </button>
      </div>

      <!-- Loading State Estetik -->
      <div
        v-if="insightLoading"
        class="flex flex-col items-center justify-center py-16"
      >
        <div
          class="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4"
        ></div>
        <p
          class="text-[14px] text-slate-500 dark:text-slate-400 font-medium animate-pulse"
        >
          Analyzing your finances...
        </p>
      </div>

      <!-- Cards Grid -->
      <div v-else-if="insight" class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <!-- Summary Card -->
        <div
          class="bg-white/50 dark:bg-white/5 rounded-[1.5rem] p-6 border border-white/60 dark:border-white/5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)] dark:shadow-none hover:bg-white/80 dark:hover:bg-white/10 transition-colors"
        >
          <div class="flex items-center gap-2.5 mb-3">
            <div
              class="w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"
            ></div>
            <h3
              class="text-[12px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400"
            >
              Summary
            </h3>
          </div>
          <p
            class="text-[14px] text-slate-800 dark:text-slate-200 leading-relaxed font-medium"
          >
            {{ insight.summary }}
          </p>
        </div>

        <!-- Largest Category Card -->
        <div
          class="bg-white/50 dark:bg-white/5 rounded-[1.5rem] p-6 border border-white/60 dark:border-white/5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)] dark:shadow-none hover:bg-white/80 dark:hover:bg-white/10 transition-colors"
        >
          <div class="flex items-center gap-2.5 mb-3">
            <div
              class="w-2 h-2 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50"
            ></div>
            <h3
              class="text-[12px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400"
            >
              Largest Category
            </h3>
          </div>
          <p
            class="text-2xl font-bold text-slate-800 dark:text-white tracking-tight mt-1"
          >
            {{ insight.largest_category || "No data" }}
          </p>
        </div>

        <!-- Recommendation Card (With subtle glow effect) -->
        <div
          class="relative overflow-hidden bg-white/50 dark:bg-white/5 rounded-[1.5rem] p-6 border border-white/60 dark:border-white/5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)] dark:shadow-none hover:bg-white/80 dark:hover:bg-white/10 transition-colors group"
        >
          <!-- Subtle Purple Glow -->
          <div
            class="absolute -top-8 -right-8 w-24 h-24 bg-purple-500/15 dark:bg-purple-500/20 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500"
          ></div>

          <div class="flex items-center gap-2.5 mb-3 relative z-10">
            <div
              class="w-2 h-2 rounded-full bg-purple-500 shadow-sm shadow-purple-500/50"
            ></div>
            <h3
              class="text-[12px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400"
            >
              Recommendation
            </h3>
          </div>
          <p
            class="text-[14px] text-slate-800 dark:text-slate-200 leading-relaxed font-medium relative z-10"
          >
            {{ insight.recommendation || "No recommendation yet" }}
          </p>
        </div>
      </div>
    </div>

    <!-- Budget Predictions -->
    <div
      class="bg-white/70 dark:bg-black/40 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)] border border-white/80 dark:border-white/10 p-6 sm:p-8 mb-8 transition-all"
    >
      <div
        class="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/30 pb-5 mb-6"
      >
        <div>
          <h2 class="text-[19px] sm:text-xl font-extrabold tracking-tight">
            <span
              class="bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-emerald-500 dark:from-teal-400 dark:to-emerald-400"
            >
              Budget Prediction
            </span>
          </h2>
          <p
            class="text-[13px] text-slate-500 dark:text-slate-400 mt-1 font-medium ml-0.5"
          >
            Pantauan sisa limit pengeluaran kamu
          </p>
        </div>
      </div>

      <div v-if="predictions.length" class="space-y-6">
        <div v-for="item in predictions" :key="item.category" class="group">
          <div class="flex justify-between items-end mb-2.5">
            <div class="flex items-center gap-2">
              <div
                :class="[
                  'w-2 h-2 rounded-full shadow-sm transition-colors duration-500',
                  getDotColor(item.spent, item.limit),
                ]"
              ></div>
              <span
                class="font-bold text-[15px] text-slate-800 dark:text-slate-100 tracking-tight"
              >
                {{ item.category }}
              </span>
            </div>
            <span
              class="text-[12px] font-bold tracking-wide uppercase text-slate-400 dark:text-slate-500"
            >
              {{ item.days_left }} days left
            </span>
          </div>

          <div
            class="w-full h-3 bg-slate-200/60 dark:bg-slate-700/40 rounded-full overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]"
          >
            <div
              :class="[
                'h-full transition-all duration-1000 ease-out',
                getProgressColor(item.spent, item.limit),
              ]"
              :style="{
                width: Math.min((item.spent / item.limit) * 100, 100) + '%',
              }"
            ></div>
          </div>

          <div class="mt-3 flex items-center justify-between">
            <div
              class="text-[13px] font-medium text-slate-500 dark:text-slate-400"
            >
              <span class="text-slate-800 dark:text-slate-200 font-bold">{{
                formatCurrency(item.spent)
              }}</span>
              <span class="mx-1">/</span>
              {{ formatCurrency(item.limit) }}
            </div>

            <span
              :class="[
                'text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border transition-colors duration-500',
                getStatusBadgeStyle(item.spent, item.limit),
              ]"
            >
              {{ getStatusText(item.spent, item.limit) }}
            </span>
          </div>
        </div>
      </div>

      <div
        v-else
        class="flex flex-col items-center justify-center py-10 border border-dashed border-slate-300/70 dark:border-slate-700/50 rounded-[1.5rem] bg-white/30 dark:bg-white/5 backdrop-blur-sm"
      >
        <p class="text-[14px] text-slate-500 dark:text-slate-400 font-medium">
          No prediction available.
        </p>
      </div>
    </div>

    <!-- Transactions Overview & Category Pie -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-10">
      <div
        class="lg:col-span-2 bg-white/70 dark:bg-black/40 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)] border border-white/80 dark:border-white/10 p-6 sm:p-8 transition-all"
      >
        <div
          class="flex items-center gap-2.5 mb-6 border-b border-slate-200/60 dark:border-slate-700/30 pb-4"
        >
          <div
            class="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"
          ></div>
          <h3
            class="text-[19px] sm:text-xl font-extrabold text-slate-800 dark:text-white tracking-tight"
          >
            Transactions Overview
          </h3>
        </div>

        <div class="flex flex-col">
          <IncomeChart :data="incomeData" />

          <div
            class="w-full h-px bg-gradient-to-r from-transparent via-slate-200/80 dark:via-slate-700/80 to-transparent my-6"
          ></div>

          <ExpenseChart :data="expenseData" />
        </div>
      </div>

      <div
        class="relative overflow-hidden bg-white/70 dark:bg-black/40 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)] border border-white/80 dark:border-white/10 p-6 sm:p-8 flex flex-col transition-all group"
      >
        <div
          class="absolute -top-12 -right-12 w-40 h-40 bg-purple-500/15 dark:bg-purple-500/20 rounded-full blur-3xl pointer-events-none transition-transform duration-700 group-hover:scale-110"
        ></div>

        <div
          class="flex items-center gap-2.5 mb-6 border-b border-slate-200/60 dark:border-slate-700/30 pb-4 relative z-10"
        >
          <div
            class="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm shadow-purple-500/50"
          ></div>
          <h3
            class="text-[19px] sm:text-xl font-extrabold text-slate-800 dark:text-white tracking-tight"
          >
            Expense by Category
          </h3>
        </div>

        <div
          class="flex-1 flex items-center justify-center relative z-10 w-full min-h-[250px]"
        >
          <CategoryPieChart :data="categoryData" class="w-full h-full" />
        </div>
      </div>
    </div>
  </div>
</template>
