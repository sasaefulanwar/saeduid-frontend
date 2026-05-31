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
  <div>
    <h1>Categories</h1>

    <input v-model="name" placeholder="Category Name" />

    <select v-model="type">
      <option value="income">Income</option>

      <option value="expense">Expense</option>
    </select>

    <button @click="createCategory">Create</button>

    <hr />

    <ul>
      <li v-for="category in categories" :key="category.id">
        {{ category.name }}
        -
        {{ category.type }}
      </li>
    </ul>
  </div>
</template>
