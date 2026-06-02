<script setup>
import { ref } from "vue";
import api from "../api/axios";
import {
  Sparkles,
  Bot,
  Loader2,
  ClipboardCheck,
  ArrowRight,
} from "lucide-vue-next";

const text = ref("");
const result = ref(null);
const loading = ref(false);

const analyze = async () => {
  if (!text.value) return;
  try {
    loading.value = true;
    result.value = null; // Reset result pas lagi loading
    const res = await api.post("/ai/categorize", { text: text.value });
    result.value = res.data;
  } catch (err) {
    console.error("AI Error:", err);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-8">
    <!-- Header -->
    <div class="text-center md:text-left">
      <h1
        class="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3 justify-center md:justify-start"
      >
        <Sparkles class="text-indigo-500" /> AI Assistant
      </h1>
      <p class="text-slate-500 dark:text-slate-400 mt-2">
        Analyze your transaction text automatically.
      </p>
    </div>

    <!-- Input Card -->
    <div
      class="bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 p-6 md:p-8"
    >
      <textarea
        v-model="text"
        placeholder="Contoh: Nasi Padang 25000"
        class="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 transition-all outline-none resize-none"
        rows="4"
      />

      <button
        @click="analyze"
        :disabled="loading || !text"
        class="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Loader2 v-if="loading" class="animate-spin" :size="20" />
        <Bot v-else :size="20" />
        {{ loading ? "Analyzing..." : "Analyze Transaction" }}
      </button>
    </div>

    <!-- Result Card -->
    <transition name="fade">
      <div
        v-if="result"
        class="bg-white dark:bg-slate-800 rounded-[2rem] shadow-lg border border-indigo-100 dark:border-indigo-900/50 p-6 md:p-8 relative overflow-hidden"
      >
        <!-- Decoration -->
        <div class="absolute top-0 right-0 p-4 opacity-5">
          <Bot :size="100" />
        </div>

        <h2
          class="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2"
        >
          <ClipboardCheck class="text-emerald-500" /> Result Analysis
        </h2>

        <div class="space-y-4">
          <div
            class="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900 rounded-xl"
          >
            <span class="text-slate-500 font-medium text-sm">Category</span>
            <span
              class="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold rounded-full text-sm"
              >{{ result.category }}</span
            >
          </div>

          <div
            class="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900 rounded-xl"
          >
            <span class="text-slate-500 font-medium text-sm">Type</span>
            <span
              class="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold rounded-full text-sm capitalize"
              >{{ result.type }}</span
            >
          </div>

          <div
            class="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900 rounded-xl"
          >
            <span class="text-slate-500 font-medium text-sm">Confidence</span>
            <div class="flex items-center gap-3">
              <div
                class="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"
              >
                <div
                  class="h-full bg-indigo-500"
                  :style="{ width: result.confidence + '%' }"
                ></div>
              </div>
              <span class="font-bold text-slate-800 dark:text-slate-200"
                >{{ result.confidence }}%</span
              >
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
