namespace API.Models
{
    public class AppFile
    {
        public int Id { get; set; }
        public required string ThreadId { get; set; }
        public required string PathToFile { get; set; }
        public required string Name { get; set; }
    }
}
