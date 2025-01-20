namespace API.Helpers
{
    public class MessageParams: PaginationParams
    {
        public string? UserMail { get; set; }
        public string Container { get; set; } = "Unread";
    }
}
