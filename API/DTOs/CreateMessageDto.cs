namespace API.DTOs
{
    public class CreateMessageDto
    {
        public required int OfferId { get; set; }
        public required string RecipientEmail { get; set; }
        public required string content { get; set; }
    }
}
