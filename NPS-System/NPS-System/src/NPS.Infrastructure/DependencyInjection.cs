using Microsoft.Extensions.DependencyInjection;
using NPS.Application.Interfaces;
using NPS.Domain.Interfaces;
using NPS.Infrastructure.Data;
using NPS.Infrastructure.Repositories;
using NPS.Infrastructure.Services;

namespace NPS.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        // Data
        services.AddSingleton<DapperContext>();

        // Repositories
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IVoteRepository, VoteRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
        services.AddScoped<ILoginAttemptRepository, LoginAttemptRepository>();

        // Services
        services.AddScoped<IPasswordHasher, PasswordHasher>();
        services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();

        return services;
    }
}
