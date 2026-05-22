using TravelService.DTOs;

namespace TravelService.Services
{
    public interface ITravelService
    {
        //travel plans
        Task<IEnumerable<TravelPlanDto>> GetAllByUserId(int userId);
        Task<TravelPlanDto?> GetById(int id);
        Task<TravelPlanDto> Create(int userId, CreateTravelPlanDto dto);
        Task<TravelPlanDto?> Update(int id, int userId, CreateTravelPlanDto dto);
        Task<bool> Delete(int id, int userId);

        //destinations
        Task<IEnumerable<DestinationDto>> GetDestinations(int travelPlanId);
        Task<DestinationDto> CreateDestination(int travelPlanId, CreateDestinationDto dto);
        Task<DestinationDto?> UpdateDestination(int id, CreateDestinationDto dto);
        Task<bool> DeleteDestination(int id);

        //activities
        Task<IEnumerable<ActivityDto>> GetActivities(int travelPlanId);
        Task<ActivityDto> CreateActivity(int travelPlanId, CreateActivityDto dto);
        Task<ActivityDto?> UpdateActivity(int id, CreateActivityDto dto);
        Task<bool> DeleteActivity(int id);

        //checklist
        Task<IEnumerable<ChecklistItemDto>> GetChecklistItems(int travelPlanId);
        Task<ChecklistItemDto> CreateChecklistItem(int travelPlanId, CreateChecklistItemDto dto);
        Task<ChecklistItemDto?> ToggleChecklistItem(int id);
        Task<bool> DeleteChecklistItem(int id);

        //sharing
        Task<SharedPlanDto> CreateSharedPlan(int travelPlanId, CreateSharedPlanDto dto);
        Task<TravelPlanDto?> GetByToken(string token);

    }
}
