using AutoMapper;
using Microsoft.EntityFrameworkCore;
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


    }
}
