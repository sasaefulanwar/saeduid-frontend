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
  <div>
    <h1>Budget Management 💰</h1>

    <h2>Create Budget</h2>

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

    <input v-model="limitAmount" type="number" placeholder="Limit Amount" />

    <input v-model="month" type="number" placeholder="Month" />

    <input v-model="year" type="number" placeholder="Year" />

    <button @click="createBudget">Create Budget</button>

    <hr />

    <h2>Budget Monitoring 🚨</h2>

    <div
      v-for="item in statusList"
      :key="item.category"
      style="border: 1px solid #ddd; padding: 20px; margin-top: 20px"
    >
      <h3>
        {{ item.category }}
      </h3>

      <p>Limit: Rp {{ item.limit }}</p>

      <p>Spent: Rp {{ item.spent }}</p>

      <p>Remaining: Rp {{ item.remaining }}</p>

      <p>
        Status:

        <span v-if="item.status === 'exceeded'"> 🚨 EXCEEDED </span>

        <span v-else> ✅ SAFE </span>
      </p>
    </div>
  </div>
</template>
