using FinanceService.DTOs;


namespace FinanceService.Services
{
    public interface IFinanceService
    {
        Task<IEnumerable<ExpenseDto>> GetExpensesByTravelPlanId(int travelPlanId);
        Task<ExpenseDto?> GetExpenseById(int id);
        Task<ExpenseDto> CreateExpense(int travelPlanId, CreateExpenseDto dto);
        Task<ExpenseDto?> UpdateExpense(int id, CreateExpenseDto dto);
        Task<bool> DeleteExpense(int id);
        Task<BudgetSummaryDto> GetBudgetSummary(int travelPlanId, decimal totalBudget);
    }
}
