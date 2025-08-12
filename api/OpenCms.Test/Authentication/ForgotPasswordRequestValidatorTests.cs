using FluentValidation.TestHelper;
using OpenCms.Core.Dtos;
using Xunit;

namespace OpenCms.Test.Authentication
{
    public class ForgotPasswordRequestValidatorTests
    {
        private readonly ForgotPasswordRequestValidator _validator = new ForgotPasswordRequestValidator();

        [Fact]
        public void Should_Have_Error_When_Email_Is_Null_Or_Empty_Or_Invalid()
        {
            var model = new ForgotPasswordRequest { Email = null };
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
        public void Should_Not_Have_Error_When_Email_Is_Valid()
        {
            var model = new ForgotPasswordRequest { Email = "user@example.com" };
            var result = _validator.TestValidate(model);
            result.ShouldNotHaveAnyValidationErrors();
        }
    }
}
