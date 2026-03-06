import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { MOCK_EMPLOYEES, MOCK_PROJECTS } from '../data/mockData';
import { cn } from '../lib/utils';
import { differenceInBusinessDays } from 'date-fns';

type AllocationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  employeeId?: string;
  allocationId?: string;
};

export function AllocationModal({ isOpen, onClose, employeeId, allocationId }: AllocationModalProps) {
  const [selectedEmp, setSelectedEmp] = useState(employeeId || '');
  const [selectedProj, setSelectedProj] = useState('');
  const [startDate, setStartDate] = useState('2026-01-02');
  const [endDate, setEndDate] = useState('2026-06-02');
  const [type, setType] = useState<'Billable' | 'Non-billable'>('Billable');

  const emp = MOCK_EMPLOYEES.find(e => e.id === selectedEmp);
  const proj = MOCK_PROJECTS.find(p => p.id === selectedProj);

  const workingDays = differenceInBusinessDays(new Date(endDate), new Date(startDate));
  const totalHours = workingDays > 0 ? workingDays * 8 : 0; // Assuming 8 hours a day

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-xl font-semibold text-slate-900">
            {employeeId ? `Allocate to < ${emp?.name || 'selected name'} >` : 'Add allocation'}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {employeeId && (
            <div className="bg-slate-100 p-4 rounded-lg text-sm space-y-2">
              <h3 className="font-semibold text-slate-900">Current allocation details:</h3>
              <p><span className="font-medium text-slate-900">Billable :</span> 50% from 2 jan 2026 to 4 Jun 2026</p>
              <p><span className="font-medium text-slate-900">Non billable: :</span> 50% from 3 jan 2026 to 28 May 2026</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            {!employeeId && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900">Name</label>
                <select
                  value={selectedEmp}
                  onChange={(e) => setSelectedEmp(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select name</option>
                  {MOCK_EMPLOYEES.map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900">Role</label>
              <div className="text-sm text-slate-700 py-2">{emp?.role || 'Select a name first'}</div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900">Select project</label>
              <select
                value={selectedProj}
                onChange={(e) => setSelectedProj(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select project</option>
                {MOCK_PROJECTS.map(p => (
                  <option key={p.id} value={p.id}>{p.id} - {p.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900">Customer</label>
              <div className="text-sm text-slate-700 py-2">{proj?.customer || 'N/A'}</div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900">Allocation starts</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900">Allocation ends</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-8 text-sm font-medium text-slate-900">
            <div>{workingDays > 0 ? workingDays : 0} working days</div>
            <div>{totalHours > 0 ? totalHours : 0} hrs</div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-900">Type</label>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="Billable"
                  checked={type === 'Billable'}
                  onChange={() => setType('Billable')}
                  className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Billable</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="Non-billable"
                  checked={type === 'Non-billable'}
                  onChange={() => setType('Non-billable')}
                  className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Non billable</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            Allocate
          </button>
        </div>
      </div>
    </div>
  );
}
