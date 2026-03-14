import { BarChart3, TrendingUp, Users, Download } from 'lucide-react';

export default function ReportsPage() {
  const mockStats = [
    { label: 'Total Revenue', value: '$45,231.89', change: '+20.1%', icon: TrendingUp },
    { label: 'Active Subscriptions', value: '2,350', change: '+180', icon: Users },
    { label: 'Report Downloads', value: '12,234', change: '+19%', icon: Download },
  ];

  return (
    <div className="flex-1 p-8">
      <div className="mx-auto">
        <div className="flex items-center justify-between mb-8 pb-5 border-b border-zinc-200">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Reports & Analytics</h1>
            <p className="mt-2 text-zinc-500">
              Overview of your business metrics (Gated by <code className="px-1.5 py-0.5 rounded bg-[#FF6B4A]/10 text-[#FF6B4A] text-xs font-mono">read:reports</code>).
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#FF6B4A] hover:bg-[#E54D2B] text-white rounded-xl shadow-lg shadow-[#FF6B4A]/20 transition-all font-medium text-sm">
            <Download className="w-4 h-4" />
            Export Data
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {mockStats.map((stat, i) => (
            <div key={i} className="bg-white rounded-3xl p-6 shadow-xl shadow-zinc-200/40 border border-zinc-100 flex items-start justify-between">
              <div>
                <p className="text-zinc-500 text-sm font-medium mb-1">{stat.label}</p>
                <h3 className="text-2xl font-bold text-zinc-900">{stat.value}</h3>
              </div>
              <div className="flex flex-col items-end gap-3">
                <div className="p-2.5 bg-[#FAFBFF] rounded-2xl">
                  <stat.icon className="w-5 h-5 text-[#FF6B4A]" />
                </div>
                <span className="text-emerald-500 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-lg">{stat.change}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-zinc-200/40 border border-zinc-100 min-h-[400px] flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-[#FAFBFF] rounded-full flex items-center justify-center mb-6">
            <BarChart3 className="w-10 h-10 text-[#FF6B4A] opacity-50" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 mb-2">Detailed Charts Coming Soon</h3>
          <p className="text-zinc-500 max-w-md">
            The reporting module is currently under active development. In the future, this space will contain interactive charts and deep-dive analytics for your data.
          </p>
        </div>
      </div>
    </div>
  );
}
