import { useState } from 'react';
import { MOCK_EMPLOYEES, MOCK_ALLOCATIONS, MOCK_PROJECTS } from '../data/mockData';
import { cn } from '../lib/utils';
import { MoreHorizontal, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfYear, endOfYear, eachMonthOfInterval, isWithinInterval, differenceInDays, getDaysInMonth, startOfMonth, endOfMonth, isWeekend, getDate } from 'date-fns';
import { AllocationModal } from '../components/AllocationModal';

export default function CalendarView() {
  const [activeView, setActiveView] = useState('Year');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1));
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 6, 1)); // July 2026
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>();
  const [openEmployeeDetailsId, setOpenEmployeeDetailsId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const months = eachMonthOfInterval({
    start: startOfYear(currentDate),
    end: endOfYear(currentDate),
  });

  const daysInMonth = getDaysInMonth(currentMonth);
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1));

  const handleAllocate = (empId?: string) => {
    setSelectedEmployeeId(empId);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const getProjectColor = (projectId: string) => {
    const project = MOCK_PROJECTS.find(p => p.id === projectId);
    if (!project) return 'bg-slate-300';
    if (project.type === 'External') return 'bg-sky-500';
    return 'bg-amber-500'; // Internal
  };

  const getProjectName = (projectId: string) => {
    const project = MOCK_PROJECTS.find(p => p.id === projectId);
    return project ? `${project.name}${project.customer ? `, ${project.customer}` : ''}` : 'Unknown Project';
  };

  const calculateBarStyles = (startDate: Date, endDate: Date) => {
    let viewStart, viewEnd;
    if (activeView === 'Year') {
      viewStart = startOfYear(currentDate);
      viewEnd = endOfYear(currentDate);
    } else {
      viewStart = startOfMonth(currentMonth);
      viewEnd = endOfMonth(currentMonth);
    }

    const viewStartTime = viewStart.getTime();
    const viewEndTime = viewEnd.getTime() + 24 * 60 * 60 * 1000;
    const totalTime = viewEndTime - viewStartTime;
    
    const startTime = startDate.getTime();
    const endTime = endDate.getTime() + 24 * 60 * 60 * 1000;

    const visibleStartTime = Math.max(viewStartTime, startTime);
    const visibleEndTime = Math.min(viewEndTime, endTime);

    if (visibleStartTime >= viewEndTime || visibleEndTime <= viewStartTime) {
      return { display: 'none' };
    }

    const leftPercent = ((visibleStartTime - viewStartTime) / totalTime) * 100;
    const widthPercent = ((visibleEndTime - visibleStartTime) / totalTime) * 100;

    return {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`,
      visibleStart: new Date(visibleStartTime),
      visibleEnd: new Date(visibleEndTime),
    };
  };

  const getVisibleBarBackground = (visibleStart: Date, visibleEnd: Date, projectId: string) => {
    const project = MOCK_PROJECTS.find(p => p.id === projectId);
    const type = project?.type || 'External';
    
    const color = type === 'External' ? '#0ea5e9' : '#d97706'; // sky-500 or amber-600
    const grey = '#a3a3a3'; // neutral-400
    const today = new Date(2026, 6, 22).getTime();

    const start = visibleStart.getTime();
    const end = visibleEnd.getTime();

    if (end <= today) return color;
    if (start >= today) return grey;

    const visibleDuration = end - start;
    const passedVisibleDuration = today - start;
    const percentage = (passedVisibleDuration / visibleDuration) * 100;

    return `linear-gradient(to right, ${color} ${percentage}%, ${grey} ${percentage}%)`;
  };

  const getTodayPosition = () => {
    const today = new Date(2026, 6, 22).getTime();
    let viewStart, viewEnd;
    if (activeView === 'Year') {
      viewStart = startOfYear(currentDate).getTime();
      viewEnd = endOfYear(currentDate).getTime() + 24 * 60 * 60 * 1000;
    } else {
      viewStart = startOfMonth(currentMonth).getTime();
      viewEnd = endOfMonth(currentMonth).getTime() + 24 * 60 * 60 * 1000;
    }

    if (today < viewStart || today > viewEnd) return null;
    return ((today - viewStart) / (viewEnd - viewStart)) * 100;
  };

  const todayPos = getTodayPosition();

  return (
    <div className="space-y-6">
      <div className="text-sm font-medium text-slate-900">Welcome John</div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-4xl font-light tracking-tight">{format(currentDate, 'yyyy')}</h2>
          {activeView === 'Month' && (
            <div className="flex items-center gap-2 ml-4">
              <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 hover:bg-slate-100 rounded-full transition-colors"><ChevronLeft className="w-6 h-6 text-slate-400" /></button>
              <span className="text-2xl font-semibold">{format(currentMonth, 'MMMM')}</span>
              <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 hover:bg-slate-100 rounded-full transition-colors"><ChevronRight className="w-6 h-6 text-slate-400" /></button>
            </div>
          )}
        </div>
        <button
          onClick={() => handleAllocate()}
          className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors shadow-sm"
        >
          Allocate
        </button>
      </div>

      <div className="flex items-center gap-2">
        {['Week', 'Month', 'Quarter', 'Half year', 'Year'].map((view) => (
          <button
            key={view}
            onClick={() => setActiveView(view)}
            className={cn(
              'px-4 py-1.5 text-sm font-medium rounded-full transition-colors border',
              activeView === view ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            )}
          >
            {view}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-6 pt-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Name (s)</label>
          <select className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
            <option>Select names</option>
            {MOCK_EMPLOYEES.map(e => <option key={e.id}>{e.name}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Project</label>
          <select className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
            <option>Select Projects</option>
            {MOCK_PROJECTS.map(p => <option key={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Start date</label>
          <div className="relative">
            <input type="date" defaultValue="2026-06-02" className="w-full border border-slate-300 rounded-md pl-3 pr-10 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none" />
            <CalendarIcon className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">End date</label>
          <div className="relative">
            <input type="date" defaultValue="2026-06-02" className="w-full border border-slate-300 rounded-md pl-3 pr-10 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none" />
            <CalendarIcon className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl bg-white shadow-sm mt-8">
        {/* Timeline Header */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 rounded-t-xl">
          <div className="w-80 shrink-0 border-r border-slate-200 p-4 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Resource</span>
          </div>
          <div className="flex-1 flex relative">
            {activeView === 'Year' ? (
              months.map((month, i) => (
                <div key={i} className="flex-1 border-r border-slate-200 border-dashed last:border-r-0 py-3 text-center">
                  <span className="text-sm font-medium text-slate-700">{format(month, 'MMM')}</span>
                </div>
              ))
            ) : (
              monthDays.map((day, i) => (
                <div key={i} className={cn("flex-1 border-r border-slate-200 border-dashed last:border-r-0 flex flex-col items-center justify-end pb-2 relative", isWeekend(day) ? "bg-slate-100" : "")}>
                  {isWeekend(day) && <span className="text-[10px] text-slate-500 absolute top-1">{format(day, 'E')}</span>}
                  <span className="text-sm font-medium text-slate-700 mt-4">{getDate(day)}</span>
                </div>
              ))
            )}
            
            {/* Today Indicator Line */}
            {todayPos !== null && (
              <div className="absolute top-0 bottom-0 w-px bg-blue-500 z-20 pointer-events-none" style={{ left: `${todayPos}%` }}>
                <div className="absolute -top-6 -translate-x-1/2 bg-slate-500 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap">
                  Today( {format(new Date(2026, 6, 22), 'MMM d')})
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Timeline Body */}
        <div className="divide-y divide-slate-200">
          {MOCK_EMPLOYEES.slice(0, 3).map((emp, index) => {
            const empAllocations = MOCK_ALLOCATIONS.filter(a => a.employeeId === emp.id);
            const isRowActive = openEmployeeDetailsId === emp.id || openMenuId === emp.id;
            
            return (
              <div key={emp.id} className={cn("flex group relative", isRowActive ? "z-50" : "")}>
                {/* Employee Info Column */}
                <div className={cn("w-80 shrink-0 border-r border-slate-200 p-4 bg-white relative", isRowActive ? "z-20" : "z-10")}>
                  <div className="flex items-start gap-3">
                    <span className="text-sm text-slate-400 mt-0.5">{index + 1}</span>
                    <div className="flex-1">
                      <div 
                        className="flex flex-col cursor-pointer"
                        onClick={() => setOpenEmployeeDetailsId(openEmployeeDetailsId === emp.id ? null : emp.id)}
                      >
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{emp.name}</h3>
                        <span className="text-sm text-slate-600 mt-0.5">{emp.allocation}% Billable, Till Aug 12,</span>
                      </div>
                      <div className="text-sm text-slate-500 mt-0.5">
                        {empAllocations.length} Allocations, Booked till 15 November 2026
                      </div>
                    </div>
                  </div>

                  {/* Click Popover */}
                  {openEmployeeDetailsId === emp.id && (
                    <div className="absolute top-full left-1/2 mt-3 w-[420px] bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-slate-200 p-6 z-50">
                      <div className="absolute -top-[6px] left-8 w-3 h-3 bg-white border-t border-l border-slate-200 transform rotate-45"></div>
                      <h4 className="text-lg font-bold text-slate-900">{emp.name}</h4>
                      <p className="text-sm text-slate-900 mb-5">{emp.role}</p>
                      
                      <div className="space-y-2 text-sm mb-6">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">Total billable allocation:</span>
                          <span className="text-slate-900">545 hrs</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">Cmpleted billabale hrs:</span>
                          <span className="text-slate-900">245 hrs ( 300 hrs remaining)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">Availability:</span>
                          <span className="text-slate-900">50% After 2 Oct, 100% after 2 Dec 2026</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="bg-[#fef3c7] rounded-lg p-4">
                          <h5 className="font-bold text-sm text-slate-900 mb-1">Billable allocations:</h5>
                          <p className="text-sm text-slate-900">Project name 01 :</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-sm text-slate-900">Start date: 1 Mar 2026 .</p>
                            <p className="text-sm text-slate-900">End date: 2 Dec 2026</p>
                          </div>
                        </div>
                        <div className="bg-[#bae6fd] rounded-lg p-4">
                          <h5 className="font-bold text-sm text-slate-900 mb-1">Non-billable allocations:</h5>
                          <p className="text-sm text-slate-900">Project name 01 :</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-sm text-slate-900">Start date: 1 Mar 2026 .</p>
                            <p className="text-sm text-slate-900">End date: 2 Oct 2026</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5">
                        <h5 className="font-bold text-sm text-slate-900 mb-1">Planned leaves</h5>
                        <p className="text-sm text-slate-900">Aug 5, 6,7 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Oct 10,11</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Timeline Grid & Bars */}
                <div className={cn("flex-1 relative bg-slate-50/30 flex flex-col", index === 2 ? "rounded-br-xl" : "")}>
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex pointer-events-none">
                    {activeView === 'Year' ? (
                      months.map((_, i) => (
                        <div key={i} className="flex-1 border-r border-slate-200 border-dashed last:border-r-0" />
                      ))
                    ) : (
                      monthDays.map((day, i) => (
                        <div key={i} className={cn("flex-1 border-r border-slate-200 border-dashed last:border-r-0", isWeekend(day) ? "bg-slate-200/50" : "")} />
                      ))
                    )}
                  </div>

                  {/* Today Line Continuation */}
                  {todayPos !== null && (
                    <div className="absolute top-0 bottom-0 w-px bg-blue-500 z-0 pointer-events-none" style={{ left: `${todayPos}%` }} />
                  )}

                  {/* Stats Row */}
                  <div className="h-10 flex items-center justify-end px-4 gap-6 relative z-10">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-sky-500 rounded-sm"></div>
                      <span className="text-xs font-medium text-slate-700">240 hrs used Till today</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-amber-600 rounded-sm"></div>
                      <span className="text-xs font-medium text-slate-700">350 hrs used Till today</span>
                    </div>
                    
                    {/* Context Menu */}
                    <div className="relative ml-4">
                      <button 
                        onClick={() => setOpenMenuId(openMenuId === emp.id ? null : emp.id)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        <MoreHorizontal className="w-6 h-6" />
                      </button>
                      
                      {openMenuId === emp.id && (
                        <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 w-40 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-slate-200 py-1.5 z-50">
                          <div className="absolute top-1/2 -right-[6px] -translate-y-1/2 w-3 h-3 bg-white border-t border-r border-slate-200 transform rotate-45"></div>
                          <button 
                            onClick={() => handleAllocate(emp.id)}
                            className="w-full text-left px-4 py-2.5 text-sm text-slate-900 hover:bg-slate-50 border-b border-slate-200 last:border-0 relative z-10 bg-white"
                          >
                            Allocate
                          </button>
                          <button 
                            onClick={() => handleAllocate(emp.id)}
                            className="w-full text-left px-4 py-2.5 text-sm text-slate-900 hover:bg-slate-50 border-b border-slate-200 last:border-0 relative z-10 bg-white"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => setOpenMenuId(null)}
                            className="w-full text-left px-4 py-2.5 text-sm text-slate-900 hover:bg-slate-50 border-b border-slate-200 last:border-0 relative z-10 bg-white rounded-b-xl"
                          >
                            De-activate
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Allocation Bars */}
                  <div className="relative pb-4 space-y-1 z-10 flex-1">
                    {empAllocations.map((alloc, i) => {
                      const { left, width, visibleStart, visibleEnd, display } = calculateBarStyles(alloc.startDate, alloc.endDate);
                      if (display === 'none') return null;

                      const projectName = getProjectName(alloc.projectId);
                      const background = getVisibleBarBackground(visibleStart as Date, visibleEnd as Date, alloc.projectId);
                      
                      return (
                        <div key={alloc.id} className="relative h-6 group/bar">
                          <div 
                            className="absolute h-full flex items-center px-3 whitespace-nowrap text-xs text-white font-medium rounded-r-sm transition-opacity hover:opacity-90 cursor-pointer"
                            style={{ left, width, background }}
                          >
                            <span className="truncate">{projectName} ({alloc.allocationPercentage}% allocation)</span>
                            
                            {/* Tooltip on hover */}
                            <div className="absolute hidden group-hover/bar:block bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-3 py-2 rounded shadow-lg whitespace-nowrap z-50">
                              <div className="font-semibold mb-1">{projectName}</div>
                              <div>Start: {format(alloc.startDate, 'd MMM yyyy')}</div>
                              <div>End: {format(alloc.endDate, 'd MMM yyyy')}</div>
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AllocationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        employeeId={selectedEmployeeId}
      />
    </div>
  );
}
