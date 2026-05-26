namespace TravelService.DTOs
{
    public class SharedPlanResponseDto
    {
        public TravelPlanDto Plan { get; set; } = null!;
        public string AccessType { get; set; } = "view";
    }
}
