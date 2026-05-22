namespace TravelService.DTOs
{
    public class CreateSharedPlanDto
    {
        public string AccessType { get; set; } = "view";
        public DateTime? ExpiresAt { get; set; }
    }
}
