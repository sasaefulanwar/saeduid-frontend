<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

import api from "../api/axios";
import { useAuthStore } from "../stores/auth";

const email = ref("");
const password = ref("");

const router = useRouter();

const authStore = useAuthStore();

const login = async () => {
  try {
    const res = await api.post("/auth/login", {
      email: email.value,
      password: password.value,
    });

    authStore.setToken(res.data.token);

    router.push("/dashboard");
  } catch (err) {
    alert(err.response?.data?.error || "Login gagal");
  }
};
</script>

<template>
  <div>
    <h1>Login SAEduid</h1>

    <input v-model="email" placeholder="Email" />

    <input v-model="password" type="password" placeholder="Password" />

    <button @click="login">Login</button>
  </div>
</template>
