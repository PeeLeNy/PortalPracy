using API.DTOs;
using API.Helpers;
using API.Interfaces;
using API.Models;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class MessageRepository(DataContext context, IMapper mapper) : IMessageRepository
    {
        public void AddMessage(Message message)
        {
            context.Messages.Add(message);
        }

        public void DeleteMessage(Message message)
        {
            context.Messages.Remove(message);
        }

        public async Task<Message?> GetMessage(int id)
        {
            return await context.Messages.FindAsync(id);
        }

        public async Task<PagedList<MessageDto>> GetMessagesForUser(MessageParams messageParams)
        {
            var query = context.Messages
                .OrderByDescending(x => x.MessageSent)
                .AsQueryable();
            query = messageParams.Container switch
            {
                "Inbox" => query.Where(x => x.Recipient.Email == messageParams.UserMail),
                "Outbox" => query.Where(x => x.Sender.Email == messageParams.UserMail),
                _ => query.Where(x => x.Recipient.Email == messageParams.UserMail && x.DateRead == null),
            };
            var messages = query.ProjectTo<MessageDto>(mapper.ConfigurationProvider);

            return await PagedList<MessageDto>.CreateAsync(messages, messageParams.PageNumber, messageParams.PageSize);
        }

        public async Task<IEnumerable<MessageDto>> GetMessageThread(string currentEmail, string recipientEmail, int offerId)
        {
            var messages = await context.Messages
                .Include(x => x.Sender)
                .Include(x => x.Recipient)
                .Where(x => 
                (x.RecipientMail == currentEmail && x.SenderMail == recipientEmail ||
                x.SenderMail == currentEmail && x.RecipientMail == recipientEmail) &&
                x.MessageThreadId == offerId)
                .OrderBy(x => x.MessageSent)
                .ToListAsync();
            var unreadMessages = messages.Where(x => x.DateRead == null &&
                x.RecipientMail == currentEmail);

            if (unreadMessages.Count() != 0) {
                foreach (var message in unreadMessages)
                {
                    message.DateRead = DateTime.UtcNow;
                }
                await context.SaveChangesAsync();
            }

            return mapper.Map<IEnumerable<MessageDto>>(messages);
        }

        public async Task<bool> SaveAllAsync()
        {
            return await context.SaveChangesAsync() > 0;
        }
    }
}
