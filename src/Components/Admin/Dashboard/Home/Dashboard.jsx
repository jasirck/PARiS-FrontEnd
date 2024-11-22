
function Dashboard() {
    const stats = [
      { title: "Users", value: "68", growth: "+12.5%" },
      { title: "Packages", value: "26", growth: "+12.5%" },
      { title: "Bookings", value: "156", growth: "+12.5%" },
      { title: "Resorts", value: "24", growth: "+12.5%" },
      { title: "Tickets", value: "$24k", growth: "+12.5%" },
      { title: "Visas", value: "42", growth: "+12.5%" },
    ];
    return (
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        <div className="container mx-auto px-6">
          
  
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-6">
            {stats.map((stat, index) => (
              <StatCard
                key={index}
                title={stat.title}
                value={stat.value}
                growth={stat.growth}
              />
            ))}
          </div>
  
          {/* Charts and Resort Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {/* Sales Chart */}
            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-gray-900">
                    Sales Overview
                  </h2>
                  <select className="text-sm border border-gray-200 rounded-md px-3 py-2 bg-[#f8fdff]">
                    <option>Quarterly</option>
                    <option>Monthly</option>
                    <option>Weekly</option>
                  </select>
                </div>
                <div className="h-64 bg-[#f8fdff] rounded-lg"></div>
              </div>
            </div>
  
            {/* Resort Overview */}
            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-gray-900">
                    Resort Overview
                  </h2>
                  <button className="text-sm text-blue-600 hover:text-blue-700">
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="flex items-center p-3 bg-[#f8fdff] rounded-lg"
                    >
                      <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">
                          Resort {item}
                        </p>
                        <p className="text-sm text-gray-500">Location {item}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }
  
  function StatCard({ title, value, growth }) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
        <div className="mt-2 flex items-center text-sm text-green-600">
          <span>{growth}</span>
          <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z"
            />
          </svg>
        </div>
      </div>
    );
  }

  export default Dashboard
  