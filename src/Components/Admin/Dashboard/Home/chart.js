import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register the necessary components
ChartJS.register(LinearScale, BarElement, Title, Tooltip, Legend);

const data = {
  labels: [0, 1, 2, 3, 4, 5],  // Numeric labels for the x-axis
  datasets: [
    {
      label: 'Revenue',
      data: [12000, 19000, 3000, 5000, 20000, 3000],
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    },
  ],
};

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Monthly Revenue',
    },
  },
  scales: {
    x: {
      type: 'linear', // Use linear scale for the x-axis (numeric)
    },
    y: {
      type: 'linear', // Use linear scale for the y-axis
    },
  },
};

const MyChart = () => <Bar data={data} options={options} />;

export default MyChart;
