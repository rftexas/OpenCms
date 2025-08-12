using FluentValidation.TestHelper;
using OpenCms.Core.Dtos;

namespace OpenCms.Test.Authentication
{
    public class ResetPasswordRequestValidatorTests
    {
        private readonly ResetPasswordRequestValidator _validator = new ResetPasswordRequestValidator();

        [Fact]
        public void Should_Have_Error_When_Email_Is_Null_Or_Empty()
        {
            var model = new ResetPasswordRequest { Email = null };
            var result = _validator.TestValidate(model);
            result.ShouldHaveValidationErrorFor(x => x.Email);

            model.Email = "";
            result = _validator.TestValidate(model);
            result.ShouldHaveValidationErrorFor(x => x.Email);
        }

        [Fact]
        public void Should_Have_Error_When_Email_Is_Invalid()
        {
            var model = new ResetPasswordRequest { Email = "invalid-email" };
            var result = _validator.TestValidate(model);
            result.ShouldHaveValidationErrorFor(x => x.Email);
        }

        [Fact]
        public void Should_Have_Error_When_Token_Is_Null_Or_Empty()
        {
            var model = new ResetPasswordRequest { Token = null };
            var result = _validator.TestValidate(model);
            result.ShouldHaveValidationErrorFor(x => x.Token);

            model.Token = "";
            result = _validator.TestValidate(model);
            result.ShouldHaveValidationErrorFor(x => x.Token);
        }

        [Fact]
        public void Should_Have_Error_When_NewPassword_Is_Null_Or_Empty_Or_TooShort()
        {
            var model = new ResetPasswordRequest { NewPassword = null };
            var result = _validator.TestValidate(model);
            result.ShouldHaveValidationErrorFor(x => x.NewPassword);

            model.NewPassword = "";
            result = _validator.TestValidate(model);
            result.ShouldHaveValidationErrorFor(x => x.NewPassword);

            model.NewPassword = "123";
            result = _validator.TestValidate(model);
            result.ShouldHaveValidationErrorFor(x => x.NewPassword);
        }

        [Fact]
        public void Should_Not_Have_Error_When_All_Fields_Are_Valid()
        {
            var model = new ResetPasswordRequest
            {
                Email = "user@example.com",
                Token = "valid-token",
                NewPassword = "securePassword123"
            };
            var result = _validator.TestValidate(model);
            result.ShouldNotHaveAnyValidationErrors();
        }
    }
}
