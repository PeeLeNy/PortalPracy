using API.DTOs;
using API.Interfaces;
using API.Models;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class OfferRepository(DataContext context) : IOfferRepository
    {
        public async Task<AppOffer?> GetOfferByIdAsync(int id)
        {
            return await context.Offers.FindAsync(id);
        }
        public async Task<IEnumerable<AppOffer>> GetOffersByUserIdAsync(string email)
        {
            return await context.Offers.Where(offer => offer.UserEmail == email).ToListAsync();
        }
        public async Task<IEnumerable<AppOffer>> GetOffersAsync()
        {
            return await context.Offers.Where(o => !o.IsDeleted).ToListAsync();
        }
        public async Task<bool> SaveAllAsync()
        {
            return await context.SaveChangesAsync() > 0;
        }
        public void Update(AppOffer offer)
        {
            context.Entry(offer).State = EntityState.Modified;

        }
        public async Task<bool> CreateOffer(AppOffer offer)
        {
            context.Offers.Add(offer);
            return await context.SaveChangesAsync() > 0;
        }
    }
}