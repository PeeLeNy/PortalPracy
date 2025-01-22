using System.Security.Claims;
using System.Threading;
using API.DTOs;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using API.Models;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
                Content = createMessageDto.Content
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


        [HttpPost("upload-file")]
        public async Task<IActionResult> UploadFile([FromForm] IFormFile file, [FromForm] string userEmail, [FromForm] int threadId)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Nie można zapisać pliku");
            var userMail = User.getUserMail();


            var sender = await userRepository.GetUserByEmailAsync(userMail);
            var recipient = await userRepository.GetUserByEmailAsync(userEmail);
            if (recipient == null || sender == null) return BadRequest("Nie można zapisać pliku");
            var stringCompare = string.CompareOrdinal(sender.Email, recipient.Email) < 0;
            var threadKey = stringCompare ? $"{sender.Email}-{recipient.Email}-{threadId}" : $"{recipient.Email}-{sender.Email}-{threadId}";

            var uploadsFolder = "uploads";
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var fileName = file.FileName;
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }
            var fileToSave = new AppFile
            {
                ThreadId = threadKey,
                PathToFile = filePath,
                Name = fileName,
            };

            messageRepository.AddFile(fileToSave);
            if (await messageRepository.SaveAllAsync()) return Ok();

            return BadRequest("Błąd w wysyłaniu wiadomości");
        }
        [HttpGet("get-file/{ThreadId}")]
        public async Task<IActionResult> GetFile(string ThreadId)
        {
            var fileRecord = messageRepository.GetFileByThreadId(ThreadId)?.Result;
            if (fileRecord == null)
                return NotFound("Plik nie istnieje w bazie.");

            var fileBytes = await System.IO.File.ReadAllBytesAsync(fileRecord.PathToFile);

            var fileName = fileRecord.Name;
            if (string.IsNullOrWhiteSpace(fileName))
                fileName = "plik.pdf";

            return File(fileBytes, "application/octet-stream", fileName);
        }
    }
}
