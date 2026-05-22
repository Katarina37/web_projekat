namespace TravelService.DTOs
{
    public class SharedPlanDto
    {
        public int Id { get; set; }
        public int TravelPlanId { get; set; }
        public string Token { get; set; } = string.Empty;
        public string AccessType { get; set; } = "view";
        public DateTime? ExpiresAt { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
