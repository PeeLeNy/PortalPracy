namespace API.Models
{
    public class AppUser
    {
        public int Id { get; set; }
        public required string UserName { get; set; }
        public required string Email { get; set; }
        public required byte[] PasswordHash { get; set; }
        public required byte[] PasswordSalt { get; set; }
        public required bool StudentStatus { get; set; }
        public DateTime Created { get; set; } = DateTime.UtcNow;
        public DateTime LastActive { get; set; } = DateTime.UtcNow;
        public List<Message> MessagesSent { get; set; } = [];
        public List<Message> MessageReceived { get; set; } = [];
    }
}
