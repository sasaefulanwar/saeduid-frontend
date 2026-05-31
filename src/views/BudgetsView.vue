<script setup>
import { ref, onMounted } from "vue";
import api from "../api/axios";

const budgets = ref([]);
const categories = ref([]);
const statusList = ref([]);

const categoryId = ref("");
const limitAmount = ref("");
const month = ref(new Date().getMonth() + 1);
const year = ref(new Date().getFullYear());

const loadBudgets = async () => {
  try {
    const res = await api.get("/budgets");

    budgets.value = res.data;
  } catch (err) {
    console.error(err);
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

const loadStatus = async () => {
  try {
    const res = await api.get("/budgets/status");

    statusList.value = res.data;
  } catch (err) {
    console.error(err);
  }
};

const createBudget = async () => {
  try {
    await api.post("/budgets", {
      category_id: categoryId.value,

      limit_amount: Number(limitAmount.value),

      month: Number(month.value),

      year: Number(year.value),
    });

    limitAmount.value = "";

    await loadBudgets();
  } catch (err) {
    console.error(err);
  }
};

onMounted(() => {
  loadBudgets();

  loadCategories();

  loadStatus();
});
</script>

<template>
  <div class="max-w-5xl mx-auto">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-slate-900">Manajemen Budget 💰</h1>
      <p class="text-slate-500 mt-1">
        Atur batas pengeluaran biar kantong nggak jebol.
      </p>
    </div>

    <div
      class="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 mb-8"
    >
      <h2 class="text-lg font-semibold mb-4 border-b pb-2">
        ➕ Buat Budget Baru
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1"
            >Kategori</label
          >
          <select
            v-model="categoryId"
            class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1"
            >Batas Maksimal (Rp)</label
          >
          <input
            v-model="limitAmount"
            type="number"
            placeholder="Contoh: 1500000"
            class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1"
            >Bulan (1-12)</label
          >
          <input
            v-model="month"
            type="number"
            min="1"
            max="12"
            class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1"
            >Tahun</label
          >
          <input
            v-model="year"
            type="number"
            class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div class="mt-6 flex justify-end">
        <button
          @click="createBudget"
          :disabled="isLoading"
          class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-xl transition-all disabled:opacity-70"
        >
          {{ isLoading ? "Menyimpan..." : "Simpan Budget" }}
        </button>
      </div>
    </div>

    <h2 class="text-xl font-bold mb-4 text-slate-900">Monitoring Budget 🚨</h2>

    <div
      v-if="statusList.length === 0"
      class="text-center py-10 bg-white rounded-3xl border border-slate-200 text-slate-400"
    >
      Belum ada budget yang diatur bulan ini.
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        v-for="item in statusList"
        :key="item.category"
        :class="[
          'rounded-3xl p-6 border shadow-sm transition-all',
          item.status === 'exceeded'
            ? 'bg-red-50 border-red-200'
            : 'bg-white border-slate-200',
        ]"
      >
        <div class="flex justify-between items-start mb-4">
          <h3 class="font-bold text-lg text-slate-800">{{ item.category }}</h3>
          <div
            :class="[
              'flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold',
              item.status === 'exceeded'
                ? 'bg-red-100 text-red-700'
                : 'bg-green-100 text-green-700',
            ]"
          >
            <AlertCircle v-if="item.status === 'exceeded'" :size="14" />
            <CheckCircle v-else :size="14" />
            {{ item.status === "exceeded" ? "EXCEEDED" : "SAFE" }}
          </div>
        </div>

        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-slate-500">Batas Budget:</span>
            <span class="font-semibold">{{ formatCurrency(item.limit) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Terpakai:</span>
            <span class="font-semibold text-red-500">{{
              formatCurrency(item.spent)
            }}</span>
          </div>
          <div
            class="flex justify-between pt-2 border-t border-slate-200/60 mt-2"
          >
            <span class="text-slate-500 font-medium">Sisa Budget:</span>
            <span
              :class="[
                'font-bold',
                item.status === 'exceeded' ? 'text-red-600' : 'text-green-600',
              ]"
            >
              {{ formatCurrency(item.remaining) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
