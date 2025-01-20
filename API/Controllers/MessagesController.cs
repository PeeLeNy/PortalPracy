using System.Security.Claims;
using API.DTOs;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using API.Models;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize]
    public class MessagesController(IMessageRepository messageRepository
        , IUserRepository userRepository, IMapper mapper, IOfferRepository offerRepository) : BaseApiController
    {
        [HttpPost]
        public async Task<ActionResult<MessageDto>> CreateMessage(CreateMessageDto createMessageDto)
        {
            var userMail = User.getUserMail();

            if (userMail == createMessageDto.RecipientEmail.ToLower()) { 
                return BadRequest("Nie możesz wysyłać wiadomości do siebie");
            }
            var sender = await userRepository.GetUserByEmailAsync(userMail);
            var recipient = await userRepository.GetUserByEmailAsync(createMessageDto.RecipientEmail);
            var offer = await offerRepository.GetOfferByIdAsync(createMessageDto.OfferId);
            if (recipient == null || sender == null) return BadRequest("Nie można wysłać wiadomości");
            var message = new Message
            {
                MessageThreadId = createMessageDto.OfferId,
                MessageThread = offer?.Title ?? "Brak tematu",
                Sender = sender,
                Recipient = recipient,
                SenderMail = sender.Email,
                RecipientMail = recipient.Email,
                Content = createMessageDto.content
            };

            messageRepository.AddMessage(message);
            if (await messageRepository.SaveAllAsync()) return Ok(mapper.Map<MessageDto>(message));

            return BadRequest("Błąd w wysyłaniu wiadomości");
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MessageDto>>> GetMessagesForUser([FromQuery]MessageParams messageParams)
        {
            messageParams.UserMail = User.getUserMail();

            var messages = await messageRepository.GetMessagesForUser(messageParams);

            Response.AddPaginationHeader(messages);

            return messages;
        }
        [HttpGet("thread/{userMail}/{offerId}")]
        public async Task<ActionResult<IEnumerable<MessageDto>>> GetMessageThread(string userMail, int offerId)
        {
            var currentUserMail = User.getUserMail();

            return Ok(await messageRepository.GetMessageThread(currentUserMail, userMail, offerId));
        }
    }
}
