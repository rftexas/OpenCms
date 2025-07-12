using Microsoft.AspNetCore.Mvc;
using OpenCms.Core.Authentication.Commands;
using OpenCms.Domain;

namespace OpenCms.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthenticationController : ControllerBase
    {
        // Inject your authentication service here (constructor omitted for brevity)

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request, [FromServices] IQueryHandler<Login, User?> loginHandler)
        {

            if (request == null || string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest(new { message = "Invalid login request" });
            }

            var query = new Login(Email.From(request.Email), request.Password);
            var user = await loginHandler.Handle(query);


            if (user == null)
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }

            return Ok(new
            {
                userId = user.UserId.Value,
                email = user.Email.Value,
                firstName = user.FirstName,
                lastName = user.LastName
            });
        }
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            // TODO: Generate reset token, send email
            return Ok(new { message = "Forgot password endpoint (implement logic)" });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            // TODO: Validate token, update password
            return Ok(new { message = "Reset password endpoint (implement logic)" });
        }
    }

    // DTOs for requests
    public class LoginRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class RegisterRequest
    {
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class ForgotPasswordRequest
    {
        public string Email { get; set; }
    }

    public class ResetPasswordRequest
    {
        public string Email { get; set; }
        public string Token { get; set; }
        public string NewPassword { get; set; }
    }
}