import { addDays, subDays, startOfMonth, endOfMonth } from 'date-fns';

export type Project = {
  id: string;
  name: string;
  owner: string;
  hourlyRate: number;
  allocation: number;
  billability: 'Yes' | 'No';
  type: 'External' | 'Internal';
  customer?: string;
};

export type Employee = {
  id: string;
  name: string;
  role: string;
  hourlyRate: number;
  allocation: number;
  billability: 'Yes' | 'No';
  availability: number;
};

export type Allocation = {
  id: string;
  employeeId: string;
  projectId: string;
  startDate: Date;
  endDate: Date;
  allocationPercentage: number;
  type: 'Billable' | 'Non-billable';
};

export const MOCK_PROJECTS: Project[] = [
  { id: '23545656', name: 'Design system', owner: 'Name 01', hourlyRate: 450, allocation: 100, billability: 'Yes', type: 'External', customer: 'HP, Australia' },
  { id: '23545657', name: 'Internal project 01', owner: 'Name 01', hourlyRate: 450, allocation: 50, billability: 'No', type: 'Internal' },
  { id: '23545658', name: 'Internal project 02', owner: 'Name 01', hourlyRate: 340, allocation: 50, billability: 'No', type: 'Internal' },
  { id: '134567', name: 'Compliance management', owner: 'Name 02', hourlyRate: 350, allocation: 100, billability: 'Yes', type: 'External', customer: 'HSBC' },
];

export const MOCK_EMPLOYEES: Employee[] = [
  { id: 'U234234', name: 'Rajesh Kumar', role: 'Lead designer', hourlyRate: 450, allocation: 100, billability: 'Yes', availability: 0 },
  { id: 'U234235', name: 'Joseph Jacob', role: 'Lead UX architect', hourlyRate: 450, allocation: 50, billability: 'Yes', availability: 50 },
  { id: 'U234236', name: 'Anu Sree', role: 'UX designer', hourlyRate: 340, allocation: 50, billability: 'Yes', availability: 100 },
  { id: 'U234237', name: 'Satish Jain', role: 'Lead UI designer', hourlyRate: 350, allocation: 100, billability: 'No', availability: 100 },
  { id: 'U234238', name: 'Agnus John', role: 'Associate UX designer', hourlyRate: 250, allocation: 50, billability: 'No', availability: 50 },
];

const today = new Date(2026, 6, 22); // July 22, 2026

export const MOCK_ALLOCATIONS: Allocation[] = [
  {
    id: 'a1',
    employeeId: 'U234234',
    projectId: '23545656',
    startDate: new Date(2026, 0, 1),
    endDate: new Date(2026, 7, 12),
    allocationPercentage: 50,
    type: 'Billable',
  },
  {
    id: 'a2',
    employeeId: 'U234234',
    projectId: '23545657',
    startDate: new Date(2026, 0, 1),
    endDate: new Date(2026, 10, 15),
    allocationPercentage: 25,
    type: 'Non-billable',
  },
  {
    id: 'a3',
    employeeId: 'U234234',
    projectId: '23545658',
    startDate: new Date(2026, 0, 1),
    endDate: new Date(2026, 11, 31),
    allocationPercentage: 25,
    type: 'Non-billable',
  },
  {
    id: 'a4',
    employeeId: 'U234235',
    projectId: '23545656',
    startDate: new Date(2026, 0, 1),
    endDate: new Date(2026, 7, 12),
    allocationPercentage: 50,
    type: 'Billable',
  },
  {
    id: 'a5',
    employeeId: 'U234235',
    projectId: '23545657',
    startDate: new Date(2026, 0, 1),
    endDate: new Date(2026, 5, 30),
    allocationPercentage: 50,
    type: 'Non-billable',
  },
  {
    id: 'a6',
    employeeId: 'U234236',
    projectId: '23545656',
    startDate: new Date(2026, 0, 1),
    endDate: new Date(2026, 7, 31),
    allocationPercentage: 50,
    type: 'Billable',
  },
];
