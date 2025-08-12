using FluentValidation.TestHelper;
using OpenCms.Core.Dtos;
using Xunit;

namespace OpenCms.Test.Authentication
{
    public class LoginRequestValidatorTests
    {
        private readonly LoginRequestValidator _validator = new LoginRequestValidator();

        [Fact]
        public void Should_Have_Error_When_Email_Is_Null_Or_Empty_Or_Invalid()
        {
            var model = new LoginRequest { Email = null };
            var result = _validator.TestValidate(model);
            result.ShouldHaveValidationErrorFor(x => x.Email);

            model.Email = "";
            result = _validator.TestValidate(model);
            result.ShouldHaveValidationErrorFor(x => x.Email);

            model.Email = "invalid-email";
            result = _validator.TestValidate(model);
            result.ShouldHaveValidationErrorFor(x => x.Email);
        }

        [Fact]
        public void Should_Have_Error_When_Password_Is_Null_Or_Empty_Or_TooShort()
        {
            var model = new LoginRequest { Password = null };
            var result = _validator.TestValidate(model);
            result.ShouldHaveValidationErrorFor(x => x.Password);

            model.Password = "";
            result = _validator.TestValidate(model);
            result.ShouldHaveValidationErrorFor(x => x.Password);

            model.Password = "123";
            result = _validator.TestValidate(model);
            result.ShouldHaveValidationErrorFor(x => x.Password);
        }

        [Fact]
        public void Should_Not_Have_Error_When_All_Fields_Are_Valid()
        {
            var model = new LoginRequest
            {
                Email = "user@example.com",
                Password = "securePassword123"
            };
            var result = _validator.TestValidate(model);
            result.ShouldNotHaveAnyValidationErrors();
        }
    }
}
