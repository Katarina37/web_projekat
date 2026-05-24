import axios from "axios";
import type { Expense, CreateExpenseDto, BudgetSummary } from "../models/Expense";

const BASE_URL = import.meta.env.VITE_FINANCE_SERVICE_URL;

const authHeader = (token: string) => ({
    headers: {Authorization: `Bearer ${token}`},
});

export const financeService = {
    getExpenses: async (travelPlanId: number, token: string): Promise<Expense[]> => {
        const response = await axios.get(`${BASE_URL}/api/expenses/travel-plans/${travelPlanId}`, authHeader(token));
        return response.data;
    },
    createExpense: async (travelPlanId: number, dto: CreateExpenseDto, token: string): Promise<Expense> => {
        const response = await axios.post(`${BASE_URL}/api/expenses/travel-plans/${travelPlanId}`, dto, authHeader(token));
        return response.data;
    },
    updateExpense: async (id: number, dto: CreateExpenseDto, token: string): Promise<Expense> => {
        const response = await axios.put(`${BASE_URL}/api/expenses/${id}`, dto, authHeader(token));
        return response.data;
    },

    deleteExpense: async (id: number, token: string): Promise<void> => {
        await axios.delete(`${BASE_URL}/api/expenses/${id}`, authHeader(token));
    },

    getBudgetSummary: async (travelPlanId: number, totalBudget: number, token: string): Promise<BudgetSummary> => {
        const response = await axios.get(
        `${BASE_URL}/api/expenses/travel-plans/${travelPlanId}/budget-summary?totalBudget=${totalBudget}`,
        authHeader(token)
        );
        return response.data;
    },
};