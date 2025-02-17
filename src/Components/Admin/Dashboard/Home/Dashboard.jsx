import React, { useEffect, useState, useRef } from "react";
import axios from "../../../../utils/Api";
import { Chart, registerables } from 'chart.js/auto';

Chart.register(...registerables);

function Dashboard() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const revenueChartRef = useRef(null);
  const bookingsChartRef = useRef(null);
  const revenueChartInstance = useRef(null);
  const bookingsChartInstance = useRef(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await axios.get("api/admin/dashboard/");
        setStats(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  useEffect(() => {
    if (revenueChartRef.current && stats.total_revenue) {
      if (revenueChartInstance.current) {
        revenueChartInstance.current.destroy();
      }

      const ctx = revenueChartRef.current.getContext('2d');
      revenueChartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Package Revenue', 'Resort Revenue', 'Total Revenue'],
          datasets: [{
            label: 'Revenue Breakdown',
            data: [
              stats.total_package_revenue || 0, 
              stats.total_resort_revenue || 0, 
              stats.total_revenue || 0
            ],
            backgroundColor: [
              'rgba(75, 192, 192, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)'
            ],
            borderColor: [
              'rgb(75, 192, 192)',
              'rgb(54, 162, 235)',
              'rgb(255, 206, 86)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Revenue ($)'
              }
            }
          }
        }
      });
    }

    if (bookingsChartRef.current) {
      if (bookingsChartInstance.current) {
        bookingsChartInstance.current.destroy();
      }

      const ctx = bookingsChartRef.current.getContext('2d');
      bookingsChartInstance.current = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['Package Bookings', 'Resort Bookings', 'Flight Bookings', 'Visa Bookings'],
          datasets: [{
            data: [
              stats.total_booked_packages || 0,
              stats.total_booked_resorts || 0,
              stats.flights || 0,
              stats.visas || 0
            ],
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)'
            ]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Bookings Distribution'
            }
          }
        }
      });
    }
  }, [stats]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <main className="container mx-auto px-6 py-8" style={{ overflow: 'hidden' }}>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Analytics</h1>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <KPICard 
          title="Total Users" 
          value={stats.users} 
          change={"+5.2%"} 
          positive={true} 
        />
        <KPICard 
          title="Total Packages" 
          value={stats.packages} 
          change={"+3.1%"} 
          positive={true} 
        />
        <KPICard 
          title="Total Revenue" 
          value={`$${stats.total_revenue?.toLocaleString() || 0}`} 
          change={"+8.7%"} 
          positive={true} 
        />
        <KPICard 
          title="Total Bookings" 
          value={stats.total_booked_packages + stats.total_booked_resorts} 
          change={"-2.3%"} 
          positive={false} 
        />
      </div>

      {/* Detailed Analytics */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Revenue Breakdown */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Revenue Breakdown</h2>
          <canvas ref={revenueChartRef}></canvas>
        </div>

        {/* Bookings Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Bookings Distribution</h2>
          <canvas ref={bookingsChartRef}></canvas>
        </div>
      </div>

      {/* Popular Items */}
      <div className="grid md:grid-cols-2 gap-8 mt-8">
        <PopularItemCard 
          title="Most Popular Package"
          name={stats.most_popular_package?.name}
          bookings={stats.most_popular_package?.bookings}
        />
        <PopularItemCard 
          title="Most Popular Resort"
          name={stats.most_popular_resort?.name}
          bookings={stats.most_popular_resort?.bookings}
        />
      </div>
    </main>
  );
}

function KPICard({ title, value, change, positive }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <p className="text-sm text-gray-500 mb-2">{title}</p>
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold">{value}</span>
        <span className={`text-sm ${positive ? 'text-green-500' : 'text-red-500'}`}>
          {change}
        </span>
      </div>
    </div>
  );
}

function PopularItemCard({ title, name, bookings }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="space-y-2">
        <p className="text-gray-600">Name: <span className="font-medium">{name || 'N/A'}</span></p>
        <p className="text-gray-600">Bookings: <span className="font-medium">{bookings || 0}</span></p>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-pulse text-xl text-gray-600">
        Loading Dashboard...
      </div>
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="flex justify-center items-center min-h-screen bg-red-50">
      <div className="text-center">
        <h2 className="text-2xl text-red-600 font-bold mb-4">
          Dashboard Error
        </h2>
        <p className="text-red-500">{message}</p>
      </div>
    </div>
  );
}

export default Dashboard;