using System.ComponentModel.DataAnnotations;

namespace API.DTOs
{
    public class RegisterDto
    {
        [Required]
        public required string UserName {  get; set; }
        [Required]
        public required string Email { get; set; }

        [Required]
        public required string Password { get; set; }

        [Required]
        public required bool StudentStatus { get; set; }
    }
}
