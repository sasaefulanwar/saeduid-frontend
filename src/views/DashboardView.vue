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
  Sparkles,
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
    // Pake Promise.all biar fetching barengan, makin kenceng!
    const [resSummary, resUser, resAnalytics, resInsight, resPrediction] =
      await Promise.all([
        api.get("/dashboard/summary"),
        api.get("/auth/profile"),
        api.get("/dashboard/analytics"),
        api.get("/ai/insight"),
        api.get("/ai/predictions"),
      ]);

    // set state
    summary.value = {
      total_income: resSummary.data.total_income || 0,
      total_expense: resSummary.data.total_expense || 0,
      total_balance: resSummary.data.net_balance || 0,
    };
    userName.value = resUser.data.name.split(" ")[0];
    incomeData.value = resAnalytics.data.monthly_income || [];
    expenseData.value = resAnalytics.data.monthly_expense || [];
    categoryData.value = resAnalytics.data.category_distribution || [];
    insight.value = resInsight.data;
    predictions.value = resPrediction.data || [];
  } catch (err) {
    console.error("Gagal load dashboard:", err);
  }
};

const loadPredictions = async () => {
  try {
    const res = await api.get("/ai/predictions");
    predictions.value = res.data || [];
  } catch (err) {
    console.error(err);
  }
};

onMounted(loadDashboardData);
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div
      class="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10"
    >
      <div>
        <h1
          class="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2"
        >
          {{ greetingMsg }}, {{ userName || "Creative" }}
        </h1>
        <p
          class="text-slate-500 dark:text-slate-400 flex items-center gap-2 text-sm font-medium"
        >
          <Calendar :size="16" /> Here's your financial overview.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button
          @click="exportReport('csv')"
          class="flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-2.5 px-6 rounded-full border border-slate-200 dark:border-slate-700 transition-all text-sm"
        >
          <Download :size="16" /> Export CSV
        </button>

        <button
          @click="exportReport('pdf')"
          :disabled="isLoadingReport"
          class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-full transition-all text-sm shadow-md shadow-blue-500/20"
        >
          <FileText :size="16" />
          <span>{{ isLoadingReport ? "Processing..." : "Export PDF" }}</span>
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div
        class="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden"
      >
        <p
          class="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1.5 opacity-80"
        >
          Total Balance
        </p>
        <h3 class="text-2xl sm:text-3xl font-extrabold tracking-tight truncate">
          {{ formatCurrency(summary.total_balance) }}
        </h3>
      </div>
      <div
        class="bg-white dark:bg-slate-800 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-700 shadow-sm"
      >
        <p
          class="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5"
        >
          Total Income
        </p>
        <h3 class="text-2xl font-bold text-slate-900 dark:text-white">
          {{ formatCurrency(summary.total_income) }}
        </h3>
      </div>
      <div
        class="bg-white dark:bg-slate-800 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-700 shadow-sm"
      >
        <p
          class="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5"
        >
          Total Expense
        </p>
        <h3 class="text-2xl font-bold text-slate-900 dark:text-white">
          {{ formatCurrency(summary.total_expense) }}
        </h3>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- 🤖 AI MONTHLY INSIGHT -->
    <!-- ========================================== -->

    <div
      class="mt-8 mb-8 bg-white dark:bg-slate-800/80 rounded-[2rem] border border-slate-100 dark:border-slate-700/60 p-8 shadow-sm backdrop-blur-sm"
    >
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white">
            🤖 AI Monthly Insight
          </h2>

          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Generated automatically from your financial data
          </p>
        </div>

        <button
          @click="loadInsight"
          class="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-semibold transition"
        >
          Refresh
        </button>
      </div>

      <!-- Loading -->

      <div v-if="insightLoading" class="py-10 text-center text-slate-500">
        🤖 Analyzing your finances...
      </div>

      <!-- Data -->

      <div v-else-if="insight" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Summary -->

        <div class="bg-slate-50 dark:bg-slate-700/30 rounded-2xl p-5">
          <h3 class="font-bold mb-2 text-slate-900 dark:text-white">
            📊 Summary
          </h3>

          <p class="text-slate-600 dark:text-slate-300">
            {{ insight.summary }}
          </p>
        </div>

        <!-- Largest Category -->

        <div class="bg-slate-50 dark:bg-slate-700/30 rounded-2xl p-5">
          <h3 class="font-bold mb-2 text-slate-900 dark:text-white">
            🍜 Largest Category
          </h3>

          <p class="text-lg font-semibold text-blue-600">
            {{ insight.largest_category }}
          </p>
        </div>

        <!-- Recommendation -->

        <div class="bg-slate-50 dark:bg-slate-700/30 rounded-2xl p-5">
          <h3 class="font-bold mb-2 text-slate-900 dark:text-white">
            💡 Recommendation
          </h3>

          <p class="text-slate-600 dark:text-slate-300">
            {{ insight.recommendation }}
          </p>
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow mb-6">
      <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-4">
        🔮 Budget Prediction
      </h2>
      <div v-if="predictions.length" class="space-y-5">
        <div v-for="item in predictions" :key="item.category">
          <div class="flex justify-between mb-2">
            <span class="font-semibold text-slate-900 dark:text-white">{{
              item.category
            }}</span>
            <span class="text-sm text-slate-500"
              >{{ item.days_left }} days left</span
            >
          </div>

          <div class="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
            <div
              class="h-full bg-blue-500"
              :style="{ width: (item.spent / item.limit) * 100 + '%' }"
            ></div>
          </div>

          <div class="mt-2 text-sm text-slate-500">
            Spent: {{ formatCurrency(item.spent) }} /
            {{ formatCurrency(item.limit) }} • {{ item.status }}
          </div>
        </div>
      </div>

      <div v-else class="text-slate-500">No prediction available.</div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <div
        class="lg:col-span-2 bg-white dark:bg-slate-800 rounded-[2rem] p-7 border border-slate-100 dark:border-slate-700 shadow-sm"
      >
        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-6">
          Transactions Overview
        </h3>
        <IncomeChart :data="incomeData" />
        <ExpenseChart :data="expenseData" class="mt-4" />
      </div>
      <div
        class="bg-white dark:bg-slate-800 rounded-[2rem] p-7 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col"
      >
        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-6">
          Expense by Category
        </h3>
        <CategoryPieChart :data="categoryData" />
      </div>
    </div>
  </div>
</template>
