<script setup>
import { ref, onMounted } from "vue";
import api from "../api/axios";
import DashboardView from "../views/DashboardView.vue";

const categories = ref([]);

const name = ref("");
const type = ref("expense");

const loadCategories = async () => {
  try {
    const res = await api.get("/categories");

    categories.value = res.data;
  } catch (err) {
    console.error(err);
  }
};

const createCategory = async () => {
  try {
    await api.post("/categories", {
      name: name.value,
      type: type.value,
    });

    name.value = "";

    await loadCategories();
  } catch (err) {
    console.error(err);
  }
};

onMounted(() => {
  loadCategories();
});
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-slate-900">Kategori Transaksi 📂</h1>
      <p class="text-slate-500 mt-1">
        Kelola kategori untuk merapikan pencatatan keuanganmu.
      </p>
    </div>

    <div
      class="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 mb-8 flex flex-col md:flex-row items-end gap-4"
    >
      <div class="flex-1 w-full">
        <label class="block text-sm font-medium text-slate-700 mb-1"
          >Nama Kategori</label
        >
        <input
          v-model="name"
          placeholder="Cth: Makanan, Transport, Gaji"
          class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          @keyup.enter="createCategory"
        />
      </div>

      <div class="w-full md:w-64">
        <label class="block text-sm font-medium text-slate-700 mb-1"
          >Tipe</label
        >
        <select
          v-model="type"
          class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="income">Pemasukan (Income)</option>
          <option value="expense">Pengeluaran (Expense)</option>
        </select>
      </div>

      <button
        @click="createCategory"
        :disabled="isLoading || !name"
        class="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-xl transition-all disabled:opacity-50"
      >
        Tambah
      </button>
    </div>

    <div
      class="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden"
    >
      <div class="px-6 py-4 border-b border-slate-100 bg-slate-50">
        <h2 class="font-semibold text-slate-800">Daftar Kategori Tersimpan</h2>
      </div>

      <div
        v-if="categories.length === 0"
        class="text-center py-10 text-slate-400"
      >
        Belum ada kategori yang dibuat.
      </div>

      <ul class="divide-y divide-slate-100">
        <li
          v-for="category in categories"
          :key="category.id"
          class="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
        >
          <span class="font-medium text-slate-700">{{ category.name }}</span>
          <span
            :class="[
              'px-3 py-1 rounded-full text-xs font-semibold',
              category.type === 'income'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700',
            ]"
          >
            {{ category.type === "income" ? "Income" : "Expense" }}
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>
