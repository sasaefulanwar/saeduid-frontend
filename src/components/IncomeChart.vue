<script setup>
import { computed } from "vue";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler, // 🔥 Jangan lupa import Filler biar warna bawah garisnya muncul!
} from "chart.js";
import { Line } from "vue-chartjs";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
});

// 🔥 UDAH DITAMBAHIN WARNA & EFEK GLOWING
const chartData = computed(() => ({
  labels: props.data.map((item) => item.month), // Pastiin API ngirim key 'month'
  datasets: [
    {
      label: "Income",
      data: props.data.map((item) => item.amount), // Pastiin API ngirim key 'amount'
      borderColor: "#10b981", // Warna Emerald buat Income
      backgroundColor: "rgba(16, 185, 129, 0.1)",
      borderWidth: 3,
      fill: true, // Wajib di-true biar warnanya turun ke bawah
    },
  ],
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: "index",
    intersect: false,
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#1e293b",
      titleColor: "#f8fafc",
      bodyColor: "#cbd5e1",
      padding: 12,
      cornerRadius: 8,
      displayColors: true,
      usePointStyle: true,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      border: { display: false },
      grid: {
        color: "#f1f5f9",
        drawTicks: false,
      },
      ticks: {
        color: "#94a3b8",
        font: { family: "'Inter', sans-serif" },
      },
    },
    x: {
      border: { display: false },
      grid: { display: false },
      ticks: {
        color: "#94a3b8",
        font: { family: "'Inter', sans-serif" },
      },
    },
  },
  elements: {
    line: {
      tension: 0.4,
      borderWidth: 3,
    },
    point: {
      radius: 0,
      hitRadius: 10,
      hoverRadius: 6,
      hoverBorderWidth: 3,
    },
  },
};
</script>

<template>
  <div style="height: 300px; width: 100%">
    <Line
      v-if="props.data.length > 0"
      :data="chartData"
      :options="chartOptions"
    />

    <div v-else class="flex h-full items-center justify-center text-slate-400">
      Belum ada data pemasukan
    </div>
  </div>
</template>
