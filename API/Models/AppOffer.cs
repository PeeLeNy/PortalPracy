namespace API.Models
{
    public class AppOffer
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public required string Description { get; set; }
        public required double SalaryFrom { get; set; }
        public required double SalaryTo { get; set; }
        public required string UserEmail { get; set; }
        public required bool IsDeleted { get; set; }
        public DateTime Created { get; set; } = DateTime.UtcNow;

    }
}
