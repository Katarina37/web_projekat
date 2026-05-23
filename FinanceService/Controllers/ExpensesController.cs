using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FinanceService.DTOs;
using FinanceService.Services;

namespace FinanceService.Controllers
{
    [ApiController]
    [Route("api/expenses")]
    [Authorize]
    public class ExpensesController : ControllerBase
    {
        private readonly IFinanceService _financeService;

        public ExpensesController(IFinanceService financeService)
        {
            _financeService = financeService;
        }

        [HttpGet("travel-plans/{travelPlanId}")]
        public async Task<IActionResult> GetByTravelPlanId(int travelPlanId)
        {
            var expenses = await _financeService.GetExpensesByTravelPlanId(travelPlanId);
            return Ok(expenses);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var expense = await _financeService.GetExpenseById(id);
            if (expense == null) return NotFound(new { message = "Trosak nije pronadjen." });
            return Ok(expense);
        }

        [HttpPost("travel-plans/{travelPlanId}")]
        public async Task<IActionResult> Create(int travelPlanId, [FromBody] CreateExpenseDto dto)
        {
            try
            {
                var expense = await _financeService.CreateExpense(travelPlanId, dto);
                return CreatedAtAction(nameof(GetById), new { id = expense.Id }, expense);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateExpenseDto dto)
        {
            try
            {
                var expense = await _financeService.UpdateExpense(id, dto);
                if (expense == null) return NotFound(new { message = "Trosak nije pronadjen." });
                return Ok(expense);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _financeService.DeleteExpense(id);
            if (!result) return NotFound(new { message = "Trosak nije pronadjen." });
            return NoContent();
        }

        [HttpGet("travel-plans/{travelPlanId}/budget-summary")]
        public async Task<IActionResult> GetBudgetSummary(int travelPlanId, [FromQuery] decimal totalBudget)
        {
            var summary = await _financeService.GetBudgetSummary(travelPlanId, totalBudget);
            return Ok(summary);
        }
    }
}
