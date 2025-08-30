using System.Security.Claims;
using API.Controllers;
using API.DTOs;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using FakeItEasy;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Messages.Tests
{
    public class MessagesControllerTests
    {
        [Fact]
        public async Task GetMessagesForUser_Returns_The_Correct_Messages()
        {
            // Arrange
            var email = "janektest@email.com";

            var msgParams = new MessageParams();

            var items = A.CollectionOfDummy<MessageDto>(5).ToList();
            var paged = new PagedList<MessageDto>(
                items, count: items.Count, pageNumber: 1, pageSize: items.Count);

            var mr = A.Fake<IMessageRepository>();
            var ur = A.Fake<IUserRepository>();
            var mapper = A.Fake<IMapper>();
            var or = A.Fake<IOfferRepository>();

            A.CallTo(() => mr.GetMessagesForUser(
                A<MessageParams>.That.Matches(p => p.UserMail == email)))
             .Returns(Task.FromResult(paged));

            var controller = new MessagesController(mr, ur, mapper, or);

            var httpCtx = new DefaultHttpContext();
            httpCtx.User = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
            new Claim(ClaimTypes.Email, email),
            new Claim("email", email),
            new Claim(ClaimTypes.NameIdentifier, email)
            }, "TestAuth"));
            controller.ControllerContext = new ControllerContext { HttpContext = httpCtx };

            // Act
            var action = await controller.GetMessagesForUser(msgParams);

            // Assert
            Assert.Null(action.Result);
            Assert.NotNull(action.Value);
            Assert.Equal(items, action.Value);

            A.CallTo(() => mr.GetMessagesForUser(
                    A<MessageParams>.That.Matches(p => p.UserMail == email)))
             .MustHaveHappenedOnceExactly();

            Assert.True(controller.Response.Headers.ContainsKey("Pagination"));
        }
    }
}