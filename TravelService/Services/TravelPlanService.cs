using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System.Fabric.Management.ServiceModel;
using TravelService.Data;
using TravelService.DTOs;
using TravelService.Models;

namespace TravelService.Services
{
    public class TravelPlanService : ITravelService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public TravelPlanService(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<IEnumerable<TravelPlanDto>> GetAllByUserId(int userId)
        {
            var plans = await _context.TravelPlans
                .Where(p => p.UserId == userId)
                .ToListAsync();
            return _mapper.Map<IEnumerable<TravelPlanDto>>(plans);
        }

        public async Task<TravelPlanDto?> GetById(int id)
        {
            var plan = await _context.TravelPlans.FindAsync(id);
            return plan == null ? null : _mapper.Map<TravelPlanDto>(plan);
        }

        public async Task<TravelPlanDto> Create(int userId, CreateTravelPlanDto dto)
        {
            if (dto.EndDate < dto.StartDate)
                throw new ArgumentException("Krajni datum ne moze biti prije pocetnog");

            if (dto.Budget < 0)
                throw new ArgumentException("Budzet ne moze biti negativan.");

            var plan = _mapper.Map<TravelPlan>(dto);
            plan.UserId = userId;
            plan.CreatedAt = DateTime.UtcNow;

            _context.TravelPlans.Add(plan);
            await _context.SaveChangesAsync();

            return _mapper.Map<TravelPlanDto>(plan);
        }

        public async Task<TravelPlanDto?> Update(int id, int userId, CreateTravelPlanDto dto)
        {
            var plan = await _context.TravelPlans.FindAsync(id);
            if (plan == null || plan.UserId != userId)
                return null;

            if (dto.EndDate < dto.StartDate)
                throw new ArgumentException("Krajnji datum ne moze biti prije pocetnog.");
            if (dto.Budget < 0)
                throw new ArgumentException("Budzet ne moze biti negativan.");

            _mapper.Map(dto, plan);
            await _context.SaveChangesAsync();

            return _mapper.Map<TravelPlanDto>(plan);
        }

        public async Task<bool> Delete(int id, int userId)
        {
            var plan = await _context.TravelPlans.FindAsync(id);
            if (plan == null || plan.UserId != userId)
                return false;

            _context.TravelPlans.Remove(plan);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<IEnumerable<DestinationDto>> GetDestinations(int travelPlanId)
        {
            var destinations = await _context.Destinations
                .Where(d => d.TravelPlanId == travelPlanId)
                .ToListAsync();
            return _mapper.Map<IEnumerable<DestinationDto>>(destinations);
        }

        public async Task<DestinationDto> CreateDestination(int travelPlanId, CreateDestinationDto dto)
        {
            var destination = _mapper.Map<Destination>(dto);
            destination.TravelPlanId = travelPlanId;

            _context.Destinations.Add(destination);
            await _context.SaveChangesAsync();

            return _mapper.Map<DestinationDto>(destination);
        }

        public async Task<DestinationDto?> UpdateDestination(int id, CreateDestinationDto dto)
        {
            var destination = await _context.Destinations.FindAsync(id);
            if (destination == null)
                return null;

            _mapper.Map(dto, destination);
            await _context.SaveChangesAsync();

            return _mapper.Map<DestinationDto>(destination);
        }

        public async Task<bool> DeleteDestination(int id)
        {
            var destination = await _context.Destinations.FindAsync(id);
            if (destination == null)
                return false;

            _context.Destinations.Remove(destination);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<IEnumerable<ActivityDto>> GetActivities(int travelPlanId)
        {
            var activities = await _context.Activities.
                Where(a => a.TravelPlanId == travelPlanId)
                .ToListAsync();
            return _mapper.Map<IEnumerable<ActivityDto>>(activities);
        }

        public async Task<ActivityDto> CreateActivity(int travelPlanId, CreateActivityDto dto)
        {
            var activity = _mapper.Map<Activity>(dto);
            activity.TravelPlanId = travelPlanId;

            _context.Activities.Add(activity);
            await _context.SaveChangesAsync();

            return _mapper.Map<ActivityDto>(activity);
        }

        public async Task<ActivityDto?> UpdateActivity(int id, CreateActivityDto dto)
        {
            var activity = await _context.Activities.FindAsync(id);
            if (activity == null)
                return null;

            _mapper.Map(dto, activity);
            await _context.SaveChangesAsync();

            return _mapper.Map<ActivityDto>(activity);
        }

        public async Task<bool> DeleteActivity(int id)
        {
            var activity = await _context.Activities.FindAsync(id);
            if (activity == null)
                return false;

            _context.Activities.Remove(activity);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<ChecklistItemDto>> GetChecklistItems(int travelPlanId)
        {
            var items = await _context.ChecklistItems
                .Where(c => c.TravelPlanId == travelPlanId)
                .ToListAsync();
            return _mapper.Map<IEnumerable<ChecklistItemDto>>(items);
        }

        public async Task<ChecklistItemDto> CreateChecklistItem(int travelPlanId, CreateChecklistItemDto dto)
        {
            var item = _mapper.Map<ChecklistItem>(dto);
            item.TravelPlanId = travelPlanId;

            _context.ChecklistItems.Add(item);
            await _context.SaveChangesAsync();

            return _mapper.Map<ChecklistItemDto>(item);
        }

        public async Task<ChecklistItemDto?> ToggleChecklistItem(int id)
        {
            var item = await _context.ChecklistItems.FindAsync(id);
            if(item == null) return null;

            item.IsCompleted = !item.IsCompleted;
            await _context.SaveChangesAsync();

            return _mapper.Map<ChecklistItemDto>(item);
        }

        public async Task<bool> DeleteChecklistItem(int id)
        {
            var item = await _context.ChecklistItems.FindAsync(id);
            if(item == null) return false;

            _context.ChecklistItems.Remove(item);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<SharedPlanDto> CreateSharedPlan(int travelPlanId, CreateSharedPlanDto dto)
        {
            var sharedPlan = new SharedPlan
            {
                TravelPlanId = travelPlanId,
                Token = Guid.NewGuid().ToString(),
                AccessType = dto.AccessType,
                ExpiresAt = dto.ExpiresAt,
                CreatedAt = DateTime.UtcNow
            };
            _context.SharedPlans.Add(sharedPlan);
            await _context.SaveChangesAsync();

            return _mapper.Map<SharedPlanDto>(sharedPlan);
        }

        public async Task<TravelPlanDto?> GetByToken(string token)
        {
            var sharedPlan = await _context.SharedPlans
                .Include(s => s.TravelPlan)
                .FirstOrDefaultAsync(s => s.Token == token &&
                (s.ExpiresAt == null || s.ExpiresAt > DateTime.UtcNow));

            return sharedPlan == null ? null : _mapper.Map<TravelPlanDto>(sharedPlan.TravelPlan);
        }
    }
}
