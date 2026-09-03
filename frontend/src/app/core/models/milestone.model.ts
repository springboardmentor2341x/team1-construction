export type MilestoneStatus = 'Pending' | 'In Progress' | 'Completed' | 'Delayed';

export interface Milestone {
  id: string;
  projectId: string;
  milestoneName: string;
  description: string;
  plannedDate: string;
  actualCompletionDate?: string;
  completionPercentage: number;
  status: MilestoneStatus;
}
