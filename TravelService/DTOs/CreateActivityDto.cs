namespace TravelService.DTOs
{
    public class CreateActivityDto
    {
        public string Name { get; set; } = string.Empty;
        public DateTime ActivityDate { get; set; }
        public TimeSpan? ActivityTime { get; set; }
        public string? Location { get; set; }
        public string? Description { get; set; }
        public decimal EstimatedCost { get; set; }
        public string Status { get; set; } = "planned";
    }
}
