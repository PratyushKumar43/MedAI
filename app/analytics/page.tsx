"use client"

import { useState, useEffect } from "react"
import { BarChart3, TrendingUp, Users, Activity, Calendar, PieChart } from "lucide-react"
import { apiService } from "@/lib/api"

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">("30d")
  const [analytics, setAnalytics] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    emergencyCases: 0,
    patientSatisfaction: 4.8, // These will remain static for now
    averageWaitTime: 12,
    revenueGrowth: 15.3,
    operationalEfficiency: 87,
  });

  const [chartData, setChartData] = useState<{
    patientVisits: { month: string; visits: number }[];
    departmentStats: { department: string; patients: number; revenue: number }[];
  }>({ 
    patientVisits: [], 
    departmentStats: [] 
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      try {
        const summaryRes = await apiService.getAnalyticsSummary();
        if (summaryRes.data) {
          setAnalytics(prev => ({ ...prev, ...summaryRes.data }));
        }

        const visitsRes = await apiService.getPatientVisitsTrend(timeRange);
        const departmentsRes = await apiService.getDepartmentStats();

        const processVisits = (rawData: { created_at: string }[]) => {
            if (!rawData) return [];
            const visitsByPeriod: Map<string, number> = new Map();
            let formatKey: (date: Date) => string;
            
            if (timeRange === '7d' || timeRange === '30d') {
                formatKey = (date) => date.toISOString().split('T')[0];
            } else {
                formatKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            }

            rawData.forEach(item => {
                const date = new Date(item.created_at);
                const key = formatKey(date);
                visitsByPeriod.set(key, (visitsByPeriod.get(key) || 0) + 1);
            });

            let formatLabel: (key: string) => string;
            if (timeRange === '7d' || timeRange === '30d') {
                formatLabel = (key) => new Date(key + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            } else {
                formatLabel = (key) => new Date(key + '-02').toLocaleDateString('en-US', { year: '2-digit', month: 'short' });
            }

            return Array.from(visitsByPeriod.entries()).map(([key, visits]) => ({
                month: formatLabel(key),
                visits,
            }));
        };

        setChartData({
          patientVisits: processVisits(visitsRes.data),
          departmentStats: departmentsRes.data || [],
        });

      } catch (error) {
        console.error("Failed to fetch analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timeRange]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}      <div className="glass-morphism rounded-3xl p-6 sm:p-8 border border-white/30 shadow-2xl">
        {/* Mobile layout - stacked vertically */}
        <div className="md:hidden space-y-5">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl xs:text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent font-poppins">
                Analytics Dashboard
              </h1>
              <p className="text-sm xs:text-base text-gray-600 font-medium">Comprehensive healthcare insights and metrics</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {(["7d", "30d", "90d", "1y"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`py-2 rounded-xl transition-all duration-300 text-sm ${
                  timeRange === range
                    ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg"
                    : "glass-morphism border border-white/30"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
        
        {/* Desktop layout - side by side */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent font-poppins">
                Analytics Dashboard
              </h1>
              <p className="text-base lg:text-lg text-gray-600 font-medium">Comprehensive healthcare insights and metrics</p>
            </div>
          </div>

          <div className="flex space-x-2">
            {(["7d", "30d", "90d", "1y"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-xl transition-all duration-300 ${
                  timeRange === range
                    ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg"
                    : "glass-morphism border border-white/30"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "Total Patients",
            value: analytics.totalPatients,
            icon: Users,
            color: "from-blue-500 to-blue-600",
            change: "+12.5%",
          },
          {
            title: "Active Doctors",
            value: analytics.totalDoctors,
            icon: Activity,
            color: "from-green-500 to-green-600",
            change: "+8.3%",
          },
          {
            title: "Appointments",
            value: analytics.totalAppointments,
            icon: Calendar,
            color: "from-purple-500 to-purple-600",
            change: "+15.7%",
          },
          {
            title: "Emergency Cases",
            value: analytics.emergencyCases,
            icon: BarChart3,
            color: "from-red-500 to-red-600",
            change: "-5.2%",
          },
        ].map((metric, index) => (
          <div
            key={index}
            className="glass-morphism rounded-2xl p-6 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${metric.color} shadow-lg`}>
                <metric.icon className="h-6 w-6 text-white" />
              </div>
              <span
                className={`text-sm font-semibold ${metric.change.startsWith("+") ? "text-green-600" : "text-red-600"}`}
              >
                {metric.change}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">{metric.title}</h3>
            <p className="text-xl xs:text-2xl font-bold text-gray-900">{metric.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Patient Visits Chart */}
        <div className="glass-morphism rounded-3xl shadow-2xl border border-white/30 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg xs:text-xl font-bold text-gray-900 font-poppins">Patient Visits Trend</h3>
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>

          <div className="space-y-4">
            {chartData.patientVisits.map((data, index) => (
              <div key={data.month} className="flex items-center space-x-4">
                <span className="w-8 text-sm font-medium text-gray-600">{data.month}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-3 relative overflow-hidden">
                  <div
                    className="h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-1000"
                    style={{ width: `${(data.visits / 200) * 100}%` }}
                  />
                </div>
                <span className="w-12 text-sm font-semibold text-gray-900">{data.visits}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Department Performance */}
        <div className="glass-morphism rounded-3xl shadow-2xl border border-white/30 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg xs:text-xl font-bold text-gray-900 font-poppins">Department Performance</h3>
            <PieChart className="h-6 w-6 text-purple-600" />
          </div>

          <div className="space-y-4">
            {chartData.departmentStats.map((dept, index) => (
              <div key={dept.department} className="glass-morphism rounded-xl p-4 border border-white/30">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{dept.department}</h4>
                  <span className="text-sm text-green-600 font-semibold">${(dept.revenue / 1000).toFixed(0)}k</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{dept.patients} patients</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full"
                      style={{ width: `${(dept.patients / 300) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "Patient Satisfaction",
            value: `${analytics.patientSatisfaction}/5.0`,
            color: "from-green-500 to-green-600",
          },
          { title: "Avg Wait Time", value: `${analytics.averageWaitTime} min`, color: "from-blue-500 to-blue-600" },
          { title: "Revenue Growth", value: `+${analytics.revenueGrowth}%`, color: "from-purple-500 to-purple-600" },
          {
            title: "Operational Efficiency",
            value: `${analytics.operationalEfficiency}%`,
            color: "from-orange-500 to-orange-600",
          },
        ].map((metric, index) => (
          <div key={index} className="glass-morphism rounded-2xl p-6 border border-white/30 shadow-xl">
            <h3 className="text-sm font-medium text-gray-600 mb-2">{metric.title}</h3>
            <p className={`text-2xl font-bold bg-gradient-to-r ${metric.color} bg-clip-text text-transparent`}>
              {metric.value}
            </p>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div className={`h-2 rounded-full bg-gradient-to-r ${metric.color}`} style={{ width: "75%" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
