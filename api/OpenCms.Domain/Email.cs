using System.Text.RegularExpressions;
using Vogen;

namespace OpenCms.Domain;

[ValueObject<string>(Conversions.SystemTextJson | Conversions.EfCoreValueConverter)]
public readonly partial record struct Email
{
    private static string NormalizeInput(string input)
    {
        return input.Trim();
    }

    private static Validation Validate(string input)
    {
        bool isValid = !string.IsNullOrEmpty(input) && EmailRegex().IsMatch(input);
        return isValid ? Validation.Ok : Validation.Invalid("Email is invalid.");
    }

    [GeneratedRegex(@"^\S+@\S+\.\S+")]
    private static partial Regex EmailRegex();
}