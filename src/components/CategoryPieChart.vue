<script setup>
import { computed } from "vue";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
// 🔥 KITA GANTI JADI DOUGHNUT BIAR BISA BOLONG TENGAHNYA!
import { Doughnut } from "vue-chartjs";

ChartJS.register(ArcElement, Tooltip, Legend);

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
});

// Palet warna udah cakep
const pieColors = [
  "#3b82f6", // Blue 500
  "#10b981", // Emerald 500
  "#f59e0b", // Amber 500
  "#ec4899", // Pink 500
  "#8b5cf6", // Violet 500
  "#06b6d4", // Cyan 500
];

const chartData = computed(() => ({
  labels: props.data?.map((item) => item.category) || [],
  datasets: [
    {
      data: props.data?.map((item) => item.amount) || [],
      // 🔥 NAH! WARNANYA DIMASUKIN KE SINI CUY!
      backgroundColor: pieColors,
      hoverOffset: 4, // Bikin efek pop-up dikit pas di-hover
    },
  ],
}));

const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "75%", // Bikin bolong di tengahnya gede, keliatan lebih modern
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        usePointStyle: true, // Legend jadi bulat-bulat kecil
        padding: 20,
        color: "#64748b",
        font: {
          family: "'Inter', sans-serif",
          size: 12,
        },
      },
    },
    tooltip: {
      backgroundColor: "#1e293b",
      padding: 12,
      cornerRadius: 8,
      callbacks: {
        label: function (context) {
          let label = context.label || "";
          if (label) {
            label += ": ";
          }
          if (context.parsed !== null) {
            // Format ke Rupiah di dalam tooltip
            label += new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
            }).format(context.parsed);
          }
          return label;
        },
      },
    },
  },
  elements: {
    arc: {
      borderWidth: 0, // Ilangin garis batas putih yang kaku
      borderRadius: 4, // Bikin ujung potongannya agak tumpul
    },
  },
};
</script>

<template>
  <div style="height: 300px; width: 100%">
    <Doughnut
      v-if="props.data && props.data.length > 0"
      :data="chartData"
      :options="pieChartOptions"
    />

    <div
      v-else
      class="flex h-full items-center justify-center text-slate-400 text-center"
    >
      Belum ada data distribusi pengeluaran
    </div>
  </div>
</template>
