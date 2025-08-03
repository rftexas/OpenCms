using Microsoft.AspNetCore.Mvc;
using OpenCms.Core.Authentication.Commands;
using OpenCms.Domain;
using OpenCms.Domain.Authentication;

namespace OpenCms.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthenticationController : ControllerBase
    {
        private readonly IConfiguration _config;

        public AuthenticationController(IConfiguration config)
        {
            _config = config;
        }

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

            var jwtToken = GenerateJwtToken(user);

            return Ok(new
            {
                userId = user.UserId.Value,
                email = user.Email.Value,
                firstName = user.FirstName,
                lastName = user.LastName,
                primaryRole = user.GetPrimaryRoleName(),
                tenants = user.UserTenants.Select(ut => new
                {
                    tenantId = ut.TenantId.Value,
                    tenantName = ut.Tenant?.Name ?? "",
                    roleName = ut.Role?.Name ?? ""
                }).ToArray(),
                token = jwtToken
            });
        }

        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
            var secret = _config["Jwt:Secret"] ?? throw new InvalidOperationException("JWT secret not configured");
            var key = System.Text.Encoding.ASCII.GetBytes(secret);

            var claims = new List<System.Security.Claims.Claim>
            {
                new System.Security.Claims.Claim("userId", user.UserId.Value.ToString()),
                new System.Security.Claims.Claim("email", user.Email.Value),
                new System.Security.Claims.Claim("firstName", user.FirstName ?? ""),
                new System.Security.Claims.Claim("lastName", user.LastName ?? ""),
                new System.Security.Claims.Claim("primaryRole", user.GetPrimaryRoleName())
            };

            // Add role claims for each tenant
            foreach (var userTenant in user.UserTenants)
            {
                claims.Add(new System.Security.Claims.Claim("role", userTenant.Role?.Name ?? ""));
                claims.Add(new System.Security.Claims.Claim("tenant", userTenant.TenantId.Value.ToString()));
            }

            var tokenDescriptor = new Microsoft.IdentityModel.Tokens.SecurityTokenDescriptor
            {
                Subject = new System.Security.Claims.ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(30),
                SigningCredentials = new Microsoft.IdentityModel.Tokens.SigningCredentials(
                    new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(key),
                    Microsoft.IdentityModel.Tokens.SecurityAlgorithms.HmacSha256Signature)
            };
            var securityToken = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(securityToken);
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request, [FromServices] ICommandHandler<PasswordForgot, PasswordResetToken?> handler)
        {
            if (request == null || string.IsNullOrEmpty(request.Email))
            {
                return BadRequest(new { message = "Invalid request" });
            }

            var query = new PasswordForgot(Email.From(request.Email));
            var token = await handler.Handle(query);

            if (token == null)
            {
                return NotFound(new { message = "User not found" });
            }

            return Ok();
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request, [FromServices] ICommandHandler<UpdatePassword.WithResetToken, bool> handler)
        {
            if (request == null || string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Token) || string.IsNullOrEmpty(request.NewPassword))
            {
                return BadRequest(new { message = "Invalid request" });
            }

            var command = new UpdatePassword.WithResetToken(request.Token, request.NewPassword);

            var result = await handler.Handle(command);
            if (!result)
            {
                return BadRequest(new { message = "Invalid or used reset token." });
            }
            return Ok(new { message = "Password reset successfully." });
        }
    }

    // DTOs for requests
    public class LoginRequest
    {
        public string? Email { get; set; }
        public string? Password { get; set; }
    }

    public class RegisterRequest
    {
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? Password { get; set; }
    }

    public class ForgotPasswordRequest
    {
        public string? Email { get; set; }
    }

    public class ResetPasswordRequest
    {
        public string? Email { get; set; }
        public string? Token { get; set; }
        public string? NewPassword { get; set; }
    }
}