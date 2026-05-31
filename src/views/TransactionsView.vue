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
  <div>
    <h1>Transactions</h1>

    <h2>Create Transaction</h2>

    <input v-model="description" placeholder="Description" />

    <input v-model="amount" type="number" placeholder="Amount" />

    <select v-model="type">
      <option value="income">Income</option>

      <option value="expense">Expense</option>
    </select>

    <select v-model="categoryId">
      <option value="">Select Category</option>

      <option
        v-for="category in categories"
        :key="category.id"
        :value="category.id"
      >
        {{ category.name }}
      </option>
    </select>

    <button @click="createTransaction">Create</button>

    <hr />

    <div v-for="trx in transactions" :key="trx.id">
      <p>
        {{ trx.description }}
      </p>

      <p>Rp {{ trx.amount }}</p>

      <hr />
    </div>
  </div>
</template>
