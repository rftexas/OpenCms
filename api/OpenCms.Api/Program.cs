using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using OpenCms.Persistence.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi()
    .AddAuthentication();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = null; // Preserve property names
        options.JsonSerializerOptions.DictionaryKeyPolicy = null; // Preserve dictionary keys
    });

builder.Services.Scan(scan => scan.FromAssemblies(typeof(OpenCms.Domain.User).Assembly,
        typeof(OpenCms.Persistence.Repositories.IUserRepository).Assembly,
        typeof(OpenCms.Core.Authentication.Commands.Login).Assembly)
    .AddClasses(c => c.AssignableTo(
        typeof(OpenCms.Domain.IQueryHandler<,>)))
    .AsImplementedInterfaces()
    .WithScopedLifetime()
    .AddClasses(c => c.AssignableTo(typeof(IRepository<,>)))
    .AsImplementedInterfaces()
    .WithScopedLifetime());

builder.Services.AddEntityFrameworkNpgsql().AddDbContext<OpenCms.Persistence.DataContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
});
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    app.UseCors(cors =>
    {
        cors.AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
}

if (app.Environment.IsEnvironment("Docker"))
{
    app.UseCors(cors =>
    {
        cors.WithOrigins("http://localhost:3000")
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
}
else
{
    app.UseCors(cors =>
    {
        cors.AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
    app.UseHttpsRedirection();
}

app.MapControllers();

app.Run();