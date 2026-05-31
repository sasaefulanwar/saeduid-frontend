<script setup>
import { ref, onMounted } from "vue";
import api from "../api/axios";
import { formatCurrency } from "../utils/currency";
import IncomeChart from "../components/IncomeChart.vue";
import ExpenseChart from "../components/ExpenseChart.vue";
import CategoryPieChart from "../components/CategoryPieChart.vue";
import AppSidebar from "../components/AppSidebar.vue";

const summary = ref({
  total_income: 0,
  total_expense: 0,
  balance: 0,
});

const loading = ref(true);

const analytics = ref({
  monthly_income: [],
  monthly_expense: [],
  category_distribution: [],
});

const loadAnalytics = async () => {
  try {
    const res = await api.get("/dashboard/analytics");

    analytics.value = res.data;
  } catch (err) {
    console.error(err);
  }
};

const loadSummary = async () => {
  try {
    loading.value = true;

    const res = await api.get("/dashboard/summary");

    summary.value = res.data;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadSummary();

  loadAnalytics();
});
</script>

<template>
  <div class="flex">
    <div class="flex-1 bg-slate-100 p-8">
      <div class="min-h-screen bg-slate-100 p-8">
        <div class="flex justify-between items-center mb-8">
          <div>
            <div class="mb-8">
              <h1 class="text-4xl font-bold">Welcome back 👋</h1>

              <p class="text-gray-500 mt-2">
                Track your finances and stay on budget.
              </p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <router-link
            to="/transactions"
            class="bg-white rounded-2xl p-4 shadow hover:shadow-lg"
          >
            ➕ Add Transaction
          </router-link>

          <router-link
            to="/categories"
            class="bg-white rounded-2xl p-4 shadow hover:shadow-lg"
          >
            📂 Manage Categories
          </router-link>

          <router-link
            to="/budgets"
            class="bg-white rounded-2xl p-4 shadow hover:shadow-lg"
          >
            💰 Manage Budgets
          </router-link>
        </div>

        <AppLoader v-if="loading" />

        <div v-else>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div
              class="bg-green-50 border-green-200 rounded-3xl shadow-lg p-6 hover:shadow-xl transition"
            >
              <h3 class="text-gray-500">Income</h3>

              <p class="text-3xl font-bold mt-2">
                {{ formatCurrency(summary.total_income) }}
              </p>
            </div>

            <div
              class="bg-red-50 border-red-200 rounded-3xl shadow-lg p-6 hover:shadow-xl transition"
            >
              <h3 class="text-gray-500">Expense</h3>

              <p class="text-3xl font-bold mt-2">
                {{ formatCurrency(summary.total_expense) }}
              </p>
            </div>

            <div
              class="bg-blue-50 border-blue-200 rounded-3xl shadow-lg p-6 hover:shadow-xl transition"
            >
              <h3 class="text-gray-500">Balance</h3>

              <p class="text-3xl font-bold mt-2">
                {{
                  formatCurrency(
                    (summary.total_income || 0) - (summary.total_expense || 0),
                  )
                }}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div class="bg-white rounded-3xl shadow-lg border border-slate-200">
              <h2 class="font-semibold mb-4">Income Trend 📈</h2>

              <IncomeChart :data="analytics.monthly_income" />
            </div>

            <div class="bg-white rounded-3xl shadow-lg border border-slate-200">
              <h2 class="font-semibold mb-4">Expense Trend 📉</h2>

              <ExpenseChart :data="analytics.monthly_expense" />
            </div>
          </div>

          <div class="bg-white p-6 rounded-2xl shadow mt-8">
            <h2 class="font-semibold mb-4">Expense Categories 🥧</h2>

            <CategoryPieChart :data="analytics.category_distribution" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
