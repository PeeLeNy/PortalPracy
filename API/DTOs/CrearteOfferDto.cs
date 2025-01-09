namespace API.DTOs
{
    public class CrearteOfferDto
    {
        public required string Title { get; set; }
        public required string Description { get; set; }
        public required double SalaryFrom { get; set; }
        public required double SalaryTo { get; set; }
        public required string UserEmail { get; set; }
    }
}
