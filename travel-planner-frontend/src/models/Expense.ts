export interface Expense{
    id: number;
    travelPlanId: number;
    name: string;
    category: string;
    amount: number;
    expenseDate: string;
    description?: string;
}

export interface CreateExpenseDto{
    name: string;
    category: string;
    amount: number;
    expenseDate: string;
    description?: string;
}

export interface BudgetSummary{
    travelPlanId: number;
    totalBudget: number;
    totalExpenses: number;
    remainingBudget: number;
}