export interface CostCategory {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
}

export interface BudgetAllocation {
  id: string;
  projectBudgetId: string;
  costCategory: CostCategory;
  allocatedAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectBudget {
  id: string;
  projectId: string;
  totalBudget: number;
  currency: string;
  status: string;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  allocations: BudgetAllocation[];
}

export interface CostEstimate {
  id: string;
  projectId: string;
  costCategory: CostCategory;
  estimateTitle: string;
  estimatedAmount: number;
  estimateDate: string;
  remarks?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectExpense {
  id: string;
  projectId: string;
  costCategory: CostCategory;
  expenseTitle: string;
  amount: number;
  expenseDate: string;
  vendorOrPayee?: string;
  referenceNo?: string;
  notes?: string;
  status: string;
  sourceType: string;
  sourceId?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryFinancialSummary {
  categoryId: string;
  categoryName: string;
  budgetAllocated: number;
  estimatedCost: number;
  actualExpense: number;
  remainingBudget: number;
  utilizationPercentage?: number;
}

export interface FinancialSummary {
  projectId: string;
  totalBudget: number;
  totalEstimatedCost: number;
  actualAmountSpent: number;
  remainingBudget: number;
  budgetUtilizationPercentage?: number;
  categoryBreakdown: CategoryFinancialSummary[];
}

// Request DTOs
export interface BudgetCreate {
  projectId: string;
  totalBudget: number;
  currency: string;
  status: string;
  notes?: string;
}

export interface BudgetUpdate {
  totalBudget?: number;
  currency?: string;
  status?: string;
  notes?: string;
}

export interface BudgetAllocationCreate {
  costCategoryId: string;
  allocatedAmount: number;
  notes?: string;
}

export interface BudgetAllocationUpdate {
  allocatedAmount?: number;
  notes?: string;
}

export interface CostEstimateCreate {
  projectId: string;
  costCategoryId: string;
  estimateTitle: string;
  estimatedAmount: number;
  estimateDate: string;
  remarks?: string;
}

export interface CostEstimateUpdate {
  estimateTitle?: string;
  estimatedAmount?: number;
  estimateDate?: string;
  remarks?: string;
}

export interface ExpenseCreate {
  projectId: string;
  costCategoryId: string;
  expenseTitle: string;
  amount: number;
  expenseDate: string;
  vendorOrPayee?: string;
  referenceNo?: string;
  notes?: string;
  status: string;
  sourceType: string;
  sourceId?: string;
}

export interface ExpenseUpdate {
  expenseTitle?: string;
  amount?: number;
  expenseDate?: string;
  vendorOrPayee?: string;
  referenceNo?: string;
  notes?: string;
  status?: string;
}
