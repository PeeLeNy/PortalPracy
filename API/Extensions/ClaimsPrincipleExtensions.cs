using System.Security.Claims;

namespace API.Extensions
{
    public static class ClaimsPrincipleExtensions
    {
        public static string getUserMail(this ClaimsPrincipal user) 
        {
            var userMail = user.FindFirstValue(ClaimTypes.NameIdentifier) 
                ?? throw new Exception("Cannot get user Mail from Token");

            return userMail;
        }
    }
}
