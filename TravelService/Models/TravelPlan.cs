namespace TravelService.Models
{
    public class TravelPlan
    {
        public int Id {  get; set; }
        public int UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description {  get; set; }
        public DateTime StartDate {  get; set; }
        public DateTime EndDate { get; set; }
        public decimal Budget { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<Destination> Destinations { get; set; } = new List<Destination>();
        public ICollection<Activity> Activities { get; set; } = new List<Activity>();
        public ICollection<ChecklistItem> ChecklistItems { get; set; } = new List<ChecklistItem>();
        public ICollection<SharedPlan> SharedPlans { get; set; } = new List<SharedPlan>();

    }
}
