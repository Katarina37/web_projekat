using AutoMapper;
using TravelService.DTOs;
using TravelService.Models;

namespace TravelService.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<TravelPlan, TravelPlanDto>();
            CreateMap<CreateTravelPlanDto, TravelPlan>();

            CreateMap<Destination, DestinationDto>();
            CreateMap<CreateDestinationDto, Destination>();

            CreateMap<Activity, ActivityDto>();
            CreateMap<CreateActivityDto, Activity>();

            CreateMap<ChecklistItem, ChecklistItemDto>();
            CreateMap<CreateChecklistItemDto, ChecklistItem>();

            CreateMap<SharedPlan, SharedPlanDto>();
            CreateMap<CreateSharedPlanDto, SharedPlan>();
        }
    }
}
