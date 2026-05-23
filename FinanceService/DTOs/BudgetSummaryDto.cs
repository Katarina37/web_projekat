namespace FinanceService.DTOs
{
    public class BudgetSummaryDto
    {
        public int TravelPlanId { get; set; }
        public decimal TotalBudget { get; set; }
        public decimal TotalExpenses { get; set; }
        public decimal RemainingBudget { get; set; }
    }
}
