export type ProjectPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type ProjectStatus = 'Planning' | 'In Progress' | 'On Hold' | 'Completed' | 'Closed';

export interface ProjectPersonnel {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

export interface Project {
  id: string;
  projectName: string;
  projectCode: string;
  category: string;
  clientName: string;
  clientContact?: string;
  description: string;
  location: string;
  estimatedBudget: number;
  startDate: string;
  expectedCompletionDate: string;
  priority: ProjectPriority;
  status: ProjectStatus;
projectManagerId: string;
  projectManagerName: string;
  assignedEngineers?: ProjectPersonnel[];
  assignedContractors?: ProjectPersonnel[];
  assignedClients?: ProjectPersonnel[];
  createdAt?: string;
}

export interface ProjectAssignment {
  projectId: string;
  projectName: string;
  engineers: ProjectPersonnel[];
  contractors: ProjectPersonnel[];
  clients: ProjectPersonnel[];
}

export interface AuditLog {
  id: string;
  action: string;
  performedByName?: string;
  description?: string;
  timestamp?: string;
}
