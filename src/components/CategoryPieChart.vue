<script setup>
import { computed } from "vue";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "vue-chartjs";

ChartJS.register(ArcElement, Tooltip, Legend);

const props = defineProps({
  data: Array,
});

const chartData = computed(() => ({
  labels: props.data?.map((item) => item.category) || [],

  datasets: [
    {
      data: props.data?.map((item) => item.amount) || [],
    },
  ],
}));
</script>

<template>
  <Pie :data="chartData" />
</template>
