using API.DTOs;
using API.Models;

namespace API.Interfaces
{
    public interface IOfferRepository
    {
        void Update(AppOffer offer);
        Task<bool> CreateOffer(AppOffer offer);
        Task<bool> SaveAllAsync();
        Task<IEnumerable<AppOffer>> GetOffersAsync();
        Task<IEnumerable<AppOffer>> GetOffersByUserIdAsync(string email);
        Task<AppOffer?> GetOfferByIdAsync(int id);
    }
}
