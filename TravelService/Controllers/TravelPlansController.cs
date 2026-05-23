using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TravelService.DTOs;
using TravelService.Services;

namespace TravelService.Controllers
{
    [ApiController]
    [Route("api/travel-plans")]
    [Authorize]
    public class TravelPlansController : ControllerBase
    {
        private readonly ITravelService travelService;

        public TravelPlansController(ITravelService _travelService)
        {
            travelService = _travelService;
        }

        private int GetUserById() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var plans = await travelService.GetAllByUserId(GetUserById());
            return Ok(plans);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var plan = await travelService.GetById(id);
            if (plan == null)
                return NotFound(new {message = "Plan nije pronadjen."});
            return Ok(plan);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateTravelPlanDto dto)
        {
            try
            {
                var plan = await travelService.Create(GetUserById(), dto);
                return CreatedAtAction(nameof(GetById), new { id = plan.Id }, plan);
            }catch(ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateTravelPlanDto dto)
        {
            try
            {
                var plan = await travelService.Update(id, GetUserById(), dto);
                if (plan == null) return NotFound(new { message = "Plan nije pronadjen" });
                return Ok(plan);
            }catch(ArgumentException ex)
            {
                return BadRequest(new {message = ex.Message});
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await travelService.Delete(id, GetUserById());
            if (!result) return NotFound(new { message = "Plan nije pronadjen." });
            return NoContent();
        }

        [HttpGet("{travelPlanId}/destinations")]
        public async Task<IActionResult> GetDestinations(int travelPlanId)
        {
            var destinations = await travelService.GetDestinations(travelPlanId);
            return Ok(destinations);
        }

        [HttpPost("{travelPlanId}/destinations")]
        public async Task<IActionResult> CreateDestination(int travelPlanId, [FromBody]CreateDestinationDto dto)
        {
            var destination = await travelService.CreateDestination(travelPlanId, dto);
            return Ok(destination);
        }

        [HttpPut("destinations/{id}")]
        public async Task<IActionResult> UpdateDestination(int id, [FromBody] CreateDestinationDto dto)
        {
            var destination = await travelService.UpdateDestination(id, dto);
            if (destination == null) return NotFound(new {message = "Destinacija nije pronadjena." });
            return Ok(destination);
        }

        [HttpDelete("destinations/{id}")]
        public async Task<IActionResult> DeleteDestination(int id)
        {
            var result = await travelService.DeleteDestination(id);
            if (!result)
                return NotFound(new {message = "Destinacija nije pronadjena."});
            return NoContent();
        }

        [HttpGet("{travelPlanId}/activities")]
        public async Task<IActionResult> GetActivities(int travelPlanId)
        {
            var activities = await travelService.GetActivities(travelPlanId);
            return Ok(activities);
        }

        [HttpPost("{travelPlanId}/activities")]
        public async Task<IActionResult> CreateActivity(int travelPlanId, [FromBody] CreateActivityDto dto)
        {
            var activity = await travelService.CreateActivity(travelPlanId, dto);
            return Ok(activity);
        }

        [HttpPut("activities/{id}")]
        public async Task<IActionResult> UpdateActivity(int id, [FromBody] CreateActivityDto dto)
        {
            var activity = await travelService.UpdateActivity(id, dto);
            if (activity == null) return NotFound(new { message = "Aktivnost nije pronađena." });
            return Ok(activity);
        }

        [HttpDelete("activities/{id}")]
        public async Task<IActionResult> DeleteActivity(int id)
        {
            var result = await travelService.DeleteActivity(id);
            if (!result) return NotFound(new { message = "Aktivnost nije pronađena." });
            return NoContent();
        }

        [HttpGet("{travelPlanId}/checklist")]
        public async Task<IActionResult> GetChecklistItems(int travelPlanId)
        {
            var items = await travelService.GetChecklistItems(travelPlanId);
            return Ok(items);
        }

        [HttpPost("{travelPlanId}/checklist")]
        public async Task<IActionResult> CreateChecklistItem(int travelPlanId, [FromBody] CreateChecklistItemDto dto)
        {
            var item = await travelService.CreateChecklistItem(travelPlanId, dto);
            return Ok(item);
        }

        [HttpPatch("checklist/{id}/toggle")]
        public async Task<IActionResult> ToggleChecklistItem(int id)
        {
            var item = await travelService.ToggleChecklistItem(id);
            if (item == null) return NotFound(new { message = "Stavka nije pronađena." });
            return Ok(item);
        }

        [HttpDelete("checklist/{id}")]
        public async Task<IActionResult> DeleteChecklistItem(int id)
        {
            var result = await travelService.DeleteChecklistItem(id);
            if (!result) return NotFound(new { message = "Stavka nije pronađena." });
            return NoContent();
        }

        [HttpPost("{travelPlanId}/share")]
        public async Task<IActionResult> CreateSharedPlan(int travelPlanId, [FromBody] CreateSharedPlanDto dto)
        {
            var sharedPlan = await travelService.CreateSharedPlan(travelPlanId, dto);
            return Ok(sharedPlan);
        }

        [HttpGet("shared/{token}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetByToken(string token)
        {
            var plan = await travelService.GetByToken(token);
            if (plan == null) return NotFound(new { message = "Plan nije pronađen ili je token istekao." });
            return Ok(plan);
        }
    }
}
