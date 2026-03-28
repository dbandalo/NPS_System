using NPS.Domain.Entities;

namespace NPS.Application.Interfaces;

public interface IJwtTokenGenerator
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
    int? ValidateAccessToken(string token);
}
