using AutoMapper;
using Microsoft.EntityFrameworkCore;
using FinanceService.Data;
using FinanceService.DTOs;
using FinanceService.Models;

namespace FinanceService.Services
{
    public class FinanceServiceImpl : IFinanceService
    {
        private readonly AppDbContext context;
        private readonly IMapper mapper;

        public FinanceServiceImpl(AppDbContext _context, IMapper _mapper)
        {
            context = _context;
            mapper = _mapper;
        }

        public async Task<IEnumerable<ExpenseDto>> GetExpensesByTravelPlanId(int travelPlanId)
        {
            var expenses = await context.Expenses
                .Where(e => e.TravelPlanId == travelPlanId)
                .ToListAsync();
            return mapper.Map<IEnumerable<ExpenseDto>>(expenses);
        }

        public async Task<ExpenseDto?> GetExpenseById(int id)
        {
            var expense = await context.Expenses.FindAsync(id);
            return expense == null ? null : mapper.Map<ExpenseDto>(expense);
        }

        public async Task<ExpenseDto> CreateExpense(int travelPlanId, CreateExpenseDto dto)
        {
            if (dto.Amount < 0)
                throw new ArgumentException("Iznos ne moze biti negativan.");

            var expense = mapper.Map<Expense>(dto);
            expense.TravelPlanId = travelPlanId;

            context.Expenses.Add(expense);
            await context.SaveChangesAsync();

            return mapper.Map<ExpenseDto>(expense);
        }

        public async Task<ExpenseDto?> UpdateExpense(int id, CreateExpenseDto dto)
        {
            var expense = await context.Expenses.FindAsync(id);
            if (expense == null) return null;

            if (dto.Amount < 0)
                throw new ArgumentException("Iznos ne moze biti negativan.");

            mapper.Map(dto, expense);
            await context.SaveChangesAsync();

            return mapper.Map<ExpenseDto>(expense);
        }

        public async Task<bool> DeleteExpense(int id)
        {
            var expense = await context.Expenses.FindAsync(id);
            if (expense == null) return false;

            context.Expenses.Remove(expense);
            await context.SaveChangesAsync();
            return true;
        }

        public async Task<BudgetSummaryDto> GetBudgetSummary(int travelPlanId, decimal totalBudget)
        {
            var totalExpenses = await context.Expenses
                .Where(e => e.TravelPlanId == travelPlanId)
                .SumAsync(e => e.Amount);

            return new BudgetSummaryDto
            {
                TravelPlanId = travelPlanId,
                TotalBudget = totalBudget,
                TotalExpenses = totalExpenses,
                RemainingBudget = totalBudget - totalExpenses
            };
        }
    }
}
