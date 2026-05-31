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
);

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
});

const chartData = computed(() => ({
  labels: props.data.map((item) => item.month),
  datasets: [
    {
      label: "Income",
      data: props.data.map((item) => item.amount),
    },
  ],
}));
</script>

<template>
  <Line :data="chartData" />
</template>
