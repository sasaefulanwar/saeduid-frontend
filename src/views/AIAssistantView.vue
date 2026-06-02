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
import { ChevronDown } from "lucide-vue-next";

const text = ref("");
const result = ref(null);
const loading = ref(false);
const isTipsOpen = ref(false);

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
  <div class="max-w-2xl mx-auto space-y-8 pb-10">
    <div class="mb-10">
      <div
        class="mb-6 border-l-4 border-indigo-500 pl-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4"
      >
        <div>
          <h1
            class="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl flex items-center gap-3"
          >
            <div class="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl">
              <Sparkles
                class="text-indigo-600 dark:text-indigo-400"
                :size="28"
              />
            </div>
            AI Assistant
          </h1>
          <p
            class="mt-2 text-sm text-slate-500 dark:text-slate-400 font-medium"
          >
            Ketik transaksimu, biar AI yang mikir kategorinya.
          </p>
        </div>
      </div>

      <button
        @click="isTipsOpen = !isTipsOpen"
        class="group flex items-center gap-2.5 px-4 py-2.5 bg-white/70 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-300 mb-2"
      >
        <div
          class="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/50 group-hover:scale-110 transition-transform"
        ></div>
        <span
          class="text-[13px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 transition-colors group-hover:text-slate-900 dark:group-hover:text-white"
        >
          Cara Pakai AI
        </span>
        <ChevronDown
          :size="16"
          :class="[
            'text-slate-400 transition-transform duration-300 ml-1',
            isTipsOpen ? 'rotate-180' : '',
          ]"
        />
      </button>

      <transition name="expand">
        <div v-if="isTipsOpen" class="overflow-hidden">
          <div
            class="relative bg-white/70 dark:bg-black/40 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)] border border-white/80 dark:border-white/10 p-6 sm:p-8 mt-2 transition-all group"
          >
            <div
              class="absolute -top-12 -right-12 w-40 h-40 bg-indigo-500/15 dark:bg-indigo-500/20 rounded-full blur-3xl pointer-events-none transition-transform duration-700 group-hover:scale-110"
            ></div>

            <div class="relative z-10">
              <h3
                class="text-[19px] sm:text-xl font-extrabold text-slate-800 dark:text-white mb-3 tracking-tight"
              >
                Gunakan Bahasa Natural
              </h3>
              <p
                class="text-[14px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium"
              >
                Nggak perlu format kaku! Cukup ketik kayak kamu lagi nge-chat
                temen. Contoh: <i>"Beli kopi kenangan 25rb"</i> atau
                <i>"Gaji bulan ini cair 5 juta"</i>. AI kita bakal otomatis
                ngebaca nominal, kategori, dan tipenya (pemasukan/pengeluaran).
              </p>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <div
      class="relative bg-white/70 dark:bg-black/40 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)] border border-white/80 dark:border-white/10 p-6 md:p-8 transition-all overflow-hidden group"
    >
      <div
        class="absolute -bottom-16 -left-16 w-48 h-48 bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl pointer-events-none"
      ></div>

      <div class="relative z-10">
        <div class="relative group/input mb-5">
          <textarea
            v-model="text"
            placeholder="Ketik transaksimu di sini... (Cth: Nasi Padang 25000)"
            class="w-full px-6 py-5 text-[15px] font-medium rounded-[1.5rem] border border-slate-200/80 dark:border-white/5 bg-white/50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-indigo-500/40 transition-all duration-300 placeholder-slate-400 shadow-[inset_0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] resize-none"
            rows="4"
          ></textarea>
        </div>

        <button
          @click="analyze"
          :disabled="loading || !text"
          class="w-full text-[15px] font-bold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white py-4 rounded-2xl transition-all duration-300 shadow-[0_4px_16px_rgba(79,70,229,0.3)] hover:shadow-[0_4px_20px_rgba(79,70,229,0.5)] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2.5"
        >
          <Loader2
            v-if="loading"
            class="animate-spin"
            :size="20"
            stroke-width="2.5"
          />
          <Bot v-else :size="20" stroke-width="2.5" />
          {{ loading ? "Sedang Menganalisa..." : "Analisa Transaksi" }}
        </button>
      </div>
    </div>

    <transition name="ios-popup">
      <div
        v-if="result"
        class="relative bg-white/70 dark:bg-black/40 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.3)] border border-indigo-100 dark:border-indigo-500/20 p-6 md:p-8 overflow-hidden mt-6"
      >
        <div
          class="absolute top-0 right-0 p-4 opacity-[0.03] dark:opacity-[0.05] scale-150 -translate-y-4 translate-x-4 pointer-events-none"
        >
          <Bot :size="160" />
        </div>

        <div
          class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-tr from-indigo-500/5 to-emerald-500/5 pointer-events-none"
        ></div>

        <div class="relative z-10">
          <h2
            class="text-[19px] sm:text-xl font-extrabold text-slate-800 dark:text-white mb-6 flex items-center gap-2.5 tracking-tight"
          >
            <div
              class="p-1.5 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg text-emerald-600 dark:text-emerald-400"
            >
              <ClipboardCheck :size="20" stroke-width="2.5" />
            </div>
            Hasil Analisa AI
          </h2>

          <div class="space-y-3.5">
            <div
              class="flex justify-between items-center p-4 bg-white/60 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-2xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] transition-colors"
            >
              <span
                class="text-slate-500 dark:text-slate-400 font-bold text-[13px] uppercase tracking-wider"
                >Kategori</span
              >
              <span
                class="px-3.5 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 font-bold rounded-full text-[13px] shadow-sm"
              >
                {{ result.category }}
              </span>
            </div>

            <div
              class="flex justify-between items-center p-4 bg-white/60 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-2xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] transition-colors"
            >
              <span
                class="text-slate-500 dark:text-slate-400 font-bold text-[13px] uppercase tracking-wider"
                >Tipe</span
              >
              <span
                class="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 font-bold rounded-full text-[13px] shadow-sm capitalize"
              >
                {{ result.type }}
              </span>
            </div>

            <div
              class="flex justify-between items-center p-4 bg-white/60 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-2xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] transition-colors"
            >
              <span
                class="text-slate-500 dark:text-slate-400 font-bold text-[13px] uppercase tracking-wider"
                >Akurasi AI</span
              >
              <div class="flex items-center gap-3.5">
                <div
                  class="w-24 h-2.5 bg-slate-200/80 dark:bg-slate-700/50 rounded-full overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]"
                >
                  <div
                    class="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-1000 ease-out"
                    :style="{ width: result.confidence + '%' }"
                  ></div>
                </div>
                <span
                  class="font-extrabold text-[15px] text-slate-800 dark:text-white"
                >
                  {{ result.confidence }}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
/* Animasi Accordion Smart Tips */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 300px;
  opacity: 1;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
  margin-top: 0;
}

/* Animasi Popup Result ala iOS (Zoom-in tipis + Fade) */
.ios-popup-enter-active,
.ios-popup-leave-active {
  transition:
    opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.ios-popup-enter-from,
.ios-popup-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}
</style>
