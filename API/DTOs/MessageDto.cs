using API.Models;

namespace API.DTOs
{
    public class MessageDto
    {
        public int Id { get; set; }
        public required int MessageThreadId { get; set; }
        public required string MessageThread { get; set; }
        public int SenderId { get; set; }
        public required string SenderMail { get; set; }
        public int RecipientId { get; set; }
        public required string RecipientMail { get; set; }
        public required string Content { get; set; }
        public DateTime? DateRead { get; set; }
        public DateTime MessageSent { get; set; } = DateTime.UtcNow;
    }
}