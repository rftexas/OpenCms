using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using OpenCms.Domain;

namespace OpenCms.Core.Notifications;

public record SendEmail(Email To, string Subject, string HtmlBody) : ICommand;

public class SendEmailHandler : ICommandHandler<SendEmail>
{
    private readonly IConfiguration _config;

    public SendEmailHandler(IConfiguration config)
    {
        _config = config;
    }

    public async Task Handle(SendEmail command, CancellationToken cancellationToken = default)
    {
        var smtpHost = _config["Smtp:Host"] ?? "smtp4dev";
        var smtpPort = int.TryParse(_config["Smtp:Port"], out var port) ? port : 25;
        var from = _config["Smtp:From"] ?? "no-reply@opencms.local";

        using var client = new SmtpClient(smtpHost, smtpPort);
        var mail = new MailMessage(from, command.To.Value)
        {
            Subject = command.Subject,
            Body = command.HtmlBody,
            IsBodyHtml = true
        };

        await client.SendMailAsync(mail, cancellationToken);
    }
}