using API.Data;
using API.DTOs;
using API.Extensions;
using API.Interfaces;
using API.Models;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace API.SignalR
{
    [Authorize]
    public class MessageHub(IMessageRepository messageRepository, IUserRepository userRepository, IOfferRepository offerRepository, IMapper mapper) : Hub
    {
        public override async Task OnConnectedAsync() 
        {
            var httpContext = Context.GetHttpContext();
            var otherUser = httpContext?.Request.Query["user"];
            var threadIdString = httpContext?.Request.Query["threadId"];

            if (Context.User == null || string.IsNullOrEmpty(otherUser) || string.IsNullOrEmpty(threadIdString))
                throw new Exception("Nie można dołączyć do grupy");

            if (!int.TryParse(threadIdString, out var threadId))
                throw new Exception("Nieprawidłowy identyfikator wątku");

            var groupName = GetGroupName(Context.User.getUserMail(), otherUser!, threadId);
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            await AddToGroup(groupName);

            var messages = await messageRepository.GetMessageThread(Context.User.getUserMail(), otherUser!, threadId);

            await Clients.Group(groupName).SendAsync("ReceiveMessageThread", messages);
        }
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            await RemoveFromMessageGroup();
            await base.OnDisconnectedAsync(exception);
        }

        public async Task SendMessage(CreateMessageDto createMessageDto) {
            var userMail = Context.User?.getUserMail() ?? throw new Exception("Błąd z pobraniem emailu użytkownika");

            if (userMail == createMessageDto.RecipientEmail.ToLower())
            {
                throw new HubException("Nie możesz wysyłać wiadomości do siebie");
            }
            var sender = await userRepository.GetUserByEmailAsync(userMail);
            var recipient = await userRepository.GetUserByEmailAsync(createMessageDto.RecipientEmail);
            var offer = await offerRepository.GetOfferByIdAsync(createMessageDto.OfferId);
            if (recipient == null || sender == null) throw new HubException("Nie można wysłać wiadomości");
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

            var groupName = GetGroupName(sender.Email, recipient.Email, createMessageDto.OfferId);
            var group = await messageRepository.GetMessageGroup(groupName);

            if (group != null && group.Connections.Any(x => x.UserMail == recipient.Email))
            { 
                message.DateRead = DateTime.UtcNow;
            }

            messageRepository.AddMessage(message);
            if (await messageRepository.SaveAllAsync())
            { 
                await Clients.Group(groupName).SendAsync("NewMessage", mapper.Map<MessageDto>(message));
            }
        }

        private async Task<bool> AddToGroup(string groupName) { 
            var userMail = Context.User?.getUserMail() ?? throw new Exception("Błąd z pobraniem emailu użytkownika");
            var group = await messageRepository.GetMessageGroup(groupName);
            var connection = new Connection { ConnectionId = Context.ConnectionId, UserMail = userMail};

            if (group == null) {
                group = new Group { Name = groupName };
                messageRepository.AddGroup(group);
            }

            group.Connections.Add(connection);

            return await messageRepository.SaveAllAsync();
        }

        private async Task RemoveFromMessageGroup() {
            var connection = await messageRepository.GetConnection(Context.ConnectionId);
            if (connection != null) { 
                messageRepository.RemoveConnection(connection);
                await messageRepository.SaveAllAsync();
            }
        }

        private string GetGroupName(string caller, string other, int threadId) { 
            var stringCompare = string.CompareOrdinal(caller, other) < 0;
            return stringCompare ? $"{caller}-{other}-{threadId}" : $"{other}-{caller}-{threadId}";
        }
    }
}
