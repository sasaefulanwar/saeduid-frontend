<script setup>
import { ref, onMounted } from "vue";
import api from "../api/axios";

const transactions = ref([]);
const description = ref("");
const amount = ref("");
const type = ref("expense");
const categories = ref([]);
const categoryId = ref("");

const createTransaction = async () => {
  try {
    await api.post("/transactions", {
      category_id: categoryId.value,

      amount: Number(amount.value),

      description: description.value,

      type: type.value,
    });

    description.value = "";
    amount.value = "";
    categoryId.value = "";

    await loadTransactions();
  } catch (err) {
    console.error(err);
  }
};

const loadTransactions = async () => {
  try {
    const res = await api.get("/transactions");

    transactions.value = res.data;
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

onMounted(() => {
  loadTransactions();

  loadCategories();
});
</script>

<template>
  <div class="max-w-5xl mx-auto">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-slate-900">Transactions</h1>
      <p class="text-slate-500 mt-1">Catat dan pantau arus kas kamu di sini.</p>
    </div>

    <div
      class="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 mb-8"
    >
      <h2 class="text-lg font-semibold mb-4 border-b pb-2">
        ➕ Tambah Transaksi
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1"
            >Deskripsi</label
          >
          <input
            v-model="description"
            placeholder="Makan siang, Gaji, dll"
            class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1"
            >Jumlah (Rp)</label
          >
          <input
            v-model="amount"
            type="number"
            placeholder="50000"
            class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1"
            >Tipe Transaksi</label
          >
          <select
            v-model="type"
            class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="income">Pemasukan (Income)</option>
            <option value="expense">Pengeluaran (Expense)</option>
          </select>
        </div>

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
      </div>

      <div class="mt-6 flex justify-end">
        <button
          @click="createTransaction"
          class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-xl transition-all"
        >
          Simpan Transaksi
        </button>
      </div>
    </div>

    <div class="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
      <h2 class="text-lg font-semibold mb-4">Riwayat Transaksi</h2>

      <div
        v-if="transactions.length === 0"
        class="text-center py-10 text-slate-400"
      >
        Belum ada data transaksi.
      </div>

      <div class="space-y-3">
        <div
          v-for="trx in transactions"
          :key="trx.id"
          class="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors"
        >
          <div class="flex items-center gap-4">
            <div
              :class="[
                'w-10 h-10 rounded-full flex items-center justify-center',
                trx.type === 'income'
                  ? 'bg-green-100 text-green-600'
                  : 'bg-red-100 text-red-600',
              ]"
            >
              <ArrowUpCircle v-if="trx.type === 'income'" :size="24" />
              <ArrowDownCircle v-else :size="24" />
            </div>
            <div>
              <p class="font-medium text-slate-900">{{ trx.description }}</p>
              <p class="text-xs text-slate-500">
                {{ trx.category?.name || "Tanpa Kategori" }}
              </p>
            </div>
          </div>
          <div
            :class="[
              'font-semibold',
              trx.type === 'income' ? 'text-green-600' : 'text-red-600',
            ]"
          >
            {{ trx.type === "income" ? "+" : "-" }}
            {{ formatCurrency(trx.amount) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
