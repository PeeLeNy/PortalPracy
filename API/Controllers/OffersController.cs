using System.Security.Claims;
using API.DTOs;
using API.Interfaces;
using API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize]
    public class OffersController(IOfferRepository offerRepository) : BaseApiController
    {
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AppOffer>>> GetOffers()
        {
            var user = User.FindFirst(ClaimTypes.NameIdentifier);
            var offers = await offerRepository.GetOffersAsync();
            var sortedOffers = offers.OrderByDescending(o => o.Created);

            return Ok(sortedOffers);
        }
        [HttpGet("{id}")]
        public async Task<ActionResult<AppOffer>> GetOfferById(int id)
        {
            var offer = await offerRepository.GetOfferByIdAsync(id) ?? null;

            if (offer == null)
                return NotFound();
            return offer;
        }
        [HttpPost("create")]
        public async Task<ActionResult<bool>> CreateOffer([FromBody] CrearteOfferDto newOffer)
        {
            if (newOffer == null)
                return BadRequest("Invalid offer data.");

            var offer = new AppOffer
            {
                Title = newOffer.Title,
                Description = newOffer.Description,
                SalaryFrom = newOffer.SalaryFrom,
                SalaryTo = newOffer.SalaryTo,
                UserEmail = newOffer.UserEmail,
                IsDeleted = false
            };
            return await offerRepository.CreateOffer(offer);
        }
    }
}
