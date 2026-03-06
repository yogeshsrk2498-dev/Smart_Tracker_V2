import { useState, useMemo } from 'react';
import { MOCK_EMPLOYEES, MOCK_PROJECTS, Employee, Project } from '../data/mockData';
import { cn } from '../lib/utils';
import { EmployeeModal } from '../components/EmployeeModal';
import { ProjectModal } from '../components/ProjectModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { Search, ArrowUpDown, Trash2 } from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'team' | 'projects'>('team');
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  
  // Employee Modal states
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  // Project Modal states
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // Employee Search and Sort states
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');
  const [employeeSortConfig, setEmployeeSortConfig] = useState<{ key: keyof Employee; direction: 'asc' | 'desc' } | null>(null);

  // Project Search and Sort states
  const [projectSearchQuery, setProjectSearchQuery] = useState('');
  const [projectSortConfig, setProjectSortConfig] = useState<{ key: keyof Project; direction: 'asc' | 'desc' } | null>(null);

  const handleEmployeeSort = (key: keyof Employee) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (employeeSortConfig && employeeSortConfig.key === key && employeeSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setEmployeeSortConfig({ key, direction });
  };

  const handleProjectSort = (key: keyof Project) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (projectSortConfig && projectSortConfig.key === key && projectSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setProjectSortConfig({ key, direction });
  };

  const filteredAndSortedEmployees = useMemo(() => {
    let result = [...employees];

    if (employeeSearchQuery) {
      const query = employeeSearchQuery.toLowerCase();
      result = result.filter(
        (emp) =>
          emp.name.toLowerCase().includes(query) ||
          emp.id.toLowerCase().includes(query)
      );
    }

    if (employeeSortConfig !== null) {
      result.sort((a, b) => {
        if (a[employeeSortConfig.key] < b[employeeSortConfig.key]) {
          return employeeSortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[employeeSortConfig.key] > b[employeeSortConfig.key]) {
          return employeeSortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [employees, employeeSearchQuery, employeeSortConfig]);

  const filteredAndSortedProjects = useMemo(() => {
    let result = [...projects];

    if (projectSearchQuery) {
      const query = projectSearchQuery.toLowerCase();
      result = result.filter(
        (proj) =>
          proj.name.toLowerCase().includes(query) ||
          proj.id.toLowerCase().includes(query)
      );
    }

    if (projectSortConfig !== null) {
      result.sort((a, b) => {
        const aVal = a[projectSortConfig.key] ?? '';
        const bVal = b[projectSortConfig.key] ?? '';
        if (aVal < bVal) {
          return projectSortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
          return projectSortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [projects, projectSearchQuery, projectSortConfig]);

  const handleSaveEmployee = (employee: Employee) => {
    if (editingEmployee) {
      setEmployees(employees.map(e => e.id === employee.id ? employee : e));
    } else {
      setEmployees([...employees, employee]);
    }
  };

  const handleDeleteEmployee = () => {
    if (employeeToDelete) {
      setEmployees(employees.filter(e => e.id !== employeeToDelete.id));
      setEmployeeToDelete(null);
    }
  };

  const openAddEmployeeModal = () => {
    setEditingEmployee(null);
    setIsEmployeeModalOpen(true);
  };

  const openEditEmployeeModal = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsEmployeeModalOpen(true);
  };

  const handleSaveProject = (project: Project) => {
    if (editingProject) {
      setProjects(projects.map(p => p.id === project.id ? project : p));
    } else {
      setProjects([...projects, project]);
    }
  };

  const handleDeleteProject = () => {
    if (projectToDelete) {
      setProjects(projects.filter(p => p.id !== projectToDelete.id));
      setProjectToDelete(null);
    }
  };

  const openAddProjectModal = () => {
    setEditingProject(null);
    setIsProjectModalOpen(true);
  };

  const openEditProjectModal = (project: Project) => {
    setEditingProject(project);
    setIsProjectModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-8 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('team')}
          className={cn(
            'pb-4 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'team' ? 'border-blue-600 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'
          )}
        >
          Team members
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={cn(
            'pb-4 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'projects' ? 'border-blue-600 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'
          )}
        >
          Projects
        </button>
      </div>

      {activeTab === 'team' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={openAddEmployeeModal}
              className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
            >
              Add team member
            </button>
            
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search by ID or Name..."
                value={employeeSearchQuery}
                onChange={(e) => setEmployeeSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            </div>
          </div>
          
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                <tr>
                  <th className="px-4 py-3 cursor-pointer hover:bg-slate-100" onClick={() => handleEmployeeSort('id')}>
                    <div className="flex items-center gap-1">Employee ID <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="px-4 py-3 cursor-pointer hover:bg-slate-100" onClick={() => handleEmployeeSort('name')}>
                    <div className="flex items-center gap-1">Name <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="px-4 py-3 cursor-pointer hover:bg-slate-100" onClick={() => handleEmployeeSort('role')}>
                    <div className="flex items-center gap-1">Role <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="px-4 py-3 cursor-pointer hover:bg-slate-100" onClick={() => handleEmployeeSort('hourlyRate')}>
                    <div className="flex items-center gap-1">Hourly Rate ($) <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="px-4 py-3 cursor-pointer hover:bg-slate-100" onClick={() => handleEmployeeSort('allocation')}>
                    <div className="flex items-center gap-1">Allocation (%) <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="px-4 py-3 cursor-pointer hover:bg-slate-100" onClick={() => handleEmployeeSort('billability')}>
                    <div className="flex items-center gap-1">Billability (Yes/No) <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredAndSortedEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50">
                    <td 
                      className="px-4 py-3 text-blue-600 underline cursor-pointer"
                      onClick={() => openEditEmployeeModal(emp)}
                    >
                      {emp.id}
                    </td>
                    <td className="px-4 py-3">{emp.name}</td>
                    <td className="px-4 py-3">{emp.role}</td>
                    <td className="px-4 py-3">{emp.hourlyRate}</td>
                    <td className="px-4 py-3">{emp.allocation}%</td>
                    <td className="px-4 py-3">{emp.billability}</td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => setEmployeeToDelete(emp)}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete employee"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredAndSortedEmployees.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      No team members found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <EmployeeModal 
            isOpen={isEmployeeModalOpen}
            onClose={() => setIsEmployeeModalOpen(false)}
            employee={editingEmployee}
            onSave={handleSaveEmployee}
          />

          <ConfirmModal
            isOpen={!!employeeToDelete}
            onClose={() => setEmployeeToDelete(null)}
            onConfirm={handleDeleteEmployee}
            title="Delete Team Member"
            message={`Are you sure you want to delete ${employeeToDelete?.name}? This action cannot be undone.`}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={openAddProjectModal}
              className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
            >
              Add project
            </button>
            
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search by ID or Name..."
                value={projectSearchQuery}
                onChange={(e) => setProjectSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                <tr>
                  <th className="px-4 py-3 cursor-pointer hover:bg-slate-100" onClick={() => handleProjectSort('id')}>
                    <div className="flex items-center gap-1">Project ID <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="px-4 py-3 cursor-pointer hover:bg-slate-100" onClick={() => handleProjectSort('name')}>
                    <div className="flex items-center gap-1">Project Name <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="px-4 py-3 cursor-pointer hover:bg-slate-100" onClick={() => handleProjectSort('owner')}>
                    <div className="flex items-center gap-1">Owner/Delivery Manager <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="px-4 py-3 cursor-pointer hover:bg-slate-100" onClick={() => handleProjectSort('hourlyRate')}>
                    <div className="flex items-center gap-1">Hourly Rate ($) <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="px-4 py-3 cursor-pointer hover:bg-slate-100" onClick={() => handleProjectSort('allocation')}>
                    <div className="flex items-center gap-1">Allocation (%) <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="px-4 py-3 cursor-pointer hover:bg-slate-100" onClick={() => handleProjectSort('billability')}>
                    <div className="flex items-center gap-1">Billability <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredAndSortedProjects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-slate-50">
                    <td 
                      className="px-4 py-3 text-blue-600 underline cursor-pointer"
                      onClick={() => openEditProjectModal(proj)}
                    >
                      {proj.id}
                    </td>
                    <td className="px-4 py-3">{proj.name}</td>
                    <td className="px-4 py-3">{proj.owner}</td>
                    <td className="px-4 py-3">{proj.hourlyRate}</td>
                    <td className="px-4 py-3">{proj.allocation}%</td>
                    <td className="px-4 py-3">{proj.billability}</td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => setProjectToDelete(proj)}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredAndSortedProjects.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      No projects found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <ProjectModal 
            isOpen={isProjectModalOpen}
            onClose={() => setIsProjectModalOpen(false)}
            project={editingProject}
            onSave={handleSaveProject}
          />

          <ConfirmModal
            isOpen={!!projectToDelete}
            onClose={() => setProjectToDelete(null)}
            onConfirm={handleDeleteProject}
            title="Delete Project"
            message={`Are you sure you want to delete ${projectToDelete?.name}? This action cannot be undone.`}
          />
        </div>
      )}
    </div>
  );
}
