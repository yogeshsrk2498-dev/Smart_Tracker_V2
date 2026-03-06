import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { MOCK_EMPLOYEES, MOCK_PROJECTS } from '../data/mockData';
import { cn } from '../lib/utils';
import { Download, Info } from 'lucide-react';

export default function Report() {
  const [activeView, setActiveView] = useState('Year');

  const allocationData = [
    { name: 'Billable', value: 18, color: '#0ea5e9' },
    { name: 'Non billable', value: 6, color: '#eab308' },
  ];

  const billabilityData = [
    { name: '100% Billable', value: 12, color: '#0ea5e9' },
    { name: '50% Billable', value: 2, color: '#eab308' },
    { name: '0% Billable', value: 2, color: '#a855f7' },
  ];

  const internalProjects = MOCK_PROJECTS.filter(p => p.type === 'Internal').length;
  const customerProjects = MOCK_PROJECTS.filter(p => p.type === 'External').length;

  const fullyAvailable = MOCK_EMPLOYEES.filter(e => e.availability === 100).length;
  const partiallyAvailable = MOCK_EMPLOYEES.filter(e => e.availability === 50).length;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Mock utilization data
  const getUtilization = (empId: string, monthIdx: number) => {
    // Just generating some deterministic mock data for the heatmap
    const base = empId === 'U234234' || empId === 'U234237' ? 100 : 50;
    if (empId === 'U234236' && monthIdx === 0) return 0;
    if (monthIdx > 2 && empId !== 'U234234' && empId !== 'U234237') return 0;
    return base;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-light tracking-tight">2026</h2>
          <div className="flex bg-slate-100 rounded-full p-1">
            {['Week', 'Month', 'Quarter', 'Half year', 'Year'].map((view) => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={cn(
                  'px-4 py-1 text-sm rounded-full transition-colors',
                  activeView === view ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                )}
              >
                {view}
              </button>
            ))}
          </div>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">
          Download report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Allocation Overview */}
        <div className="border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Allocation overview</h3>
          <div className="h-48 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold">70%</span>
              <span className="text-xs text-slate-500 text-center leading-tight">Billable allocations<br/>(745 hrs)</span>
            </div>
          </div>
          <div className="mt-6 space-y-2">
            {allocationData.map(item => (
              <div key={item.name} className="flex items-center gap-2 text-sm text-slate-600">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }}></div>
                <span>{item.value} {item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Team Billability */}
        <div className="border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Team billability</h3>
          <div className="h-48 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={billabilityData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {billabilityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-sm text-slate-500">Total</span>
              <span className="text-2xl font-bold">16</span>
            </div>
          </div>
          <div className="mt-6 space-y-2">
            {billabilityData.map(item => (
              <div key={item.name} className="flex items-center gap-2 text-sm text-slate-600">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }}></div>
                <span>{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column Stats */}
        <div className="space-y-6">
          <div className="border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">People availability</h3>
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
                <div className="text-2xl font-bold text-emerald-900">{fullyAvailable}</div>
                <div className="text-sm font-medium text-emerald-800">100% available today</div>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                <div className="text-2xl font-bold text-amber-900">{partiallyAvailable}</div>
                <div className="text-sm font-medium text-amber-800">50% available today</div>
              </div>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="text-3xl font-bold mb-1">$ 235455</div>
            <div className="text-sm font-medium text-slate-600 mb-6">Revenue generated</div>
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-100 rounded-lg p-4">
                <div className="text-2xl font-bold text-orange-900">{internalProjects}</div>
                <div className="text-sm font-medium text-orange-800">Internal projects</div>
              </div>
              <div className="bg-sky-50 border border-sky-100 rounded-lg p-4">
                <div className="text-2xl font-bold text-sky-900">{customerProjects}</div>
                <div className="text-sm font-medium text-sky-800">Customer projects</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Team utilisation table</h3>
          <div className="flex gap-4">
            <select className="border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-white">
              <option>Select names</option>
            </select>
            <select className="border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-white">
              <option>Select Projects</option>
            </select>
            <div className="flex items-center gap-2">
              <input type="date" className="border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-white" defaultValue="2026-06-02" />
              <span className="text-slate-400">-</span>
              <input type="date" className="border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-white" defaultValue="2026-06-02" />
            </div>
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[1000px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="px-4 py-3 sticky left-0 bg-slate-50 z-10">Employee ID</th>
                <th className="px-4 py-3 sticky left-[120px] bg-slate-50 z-10">Name</th>
                <th className="px-4 py-3 sticky left-[250px] bg-slate-50 z-10">Role</th>
                {months.map(m => (
                  <th key={m} className="px-4 py-3 text-center">{m}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {MOCK_EMPLOYEES.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-blue-600 underline cursor-pointer sticky left-0 bg-white group-hover:bg-slate-50">{emp.id}</td>
                  <td className="px-4 py-3 sticky left-[120px] bg-white group-hover:bg-slate-50">{emp.name}</td>
                  <td className="px-4 py-3 sticky left-[250px] bg-white group-hover:bg-slate-50">{emp.role}</td>
                  {months.map((m, idx) => {
                    const util = getUtilization(emp.id, idx);
                    return (
                      <td key={m} className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className={cn(
                            util === 0 ? 'text-rose-500 bg-rose-50 px-2 py-0.5 rounded' : ''
                          )}>
                            {util} %
                          </span>
                          {util === 0 && <Info className="w-3 h-3 text-blue-600" />}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
