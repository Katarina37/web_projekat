namespace TravelService.Models
{
    public class SharedPlan
    {
        public int Id { get; set; }
        public int TravelPlanId { get; set; }
        public string Token { get; set; } = string.Empty;
        public string AccessType { get; set; } = "view";
        public DateTime? ExpiresAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public TravelPlan TravelPlan { get; set; } = null!;
    }
}
