using NPS.Domain.Entities;

namespace NPS.Domain.Interfaces;

public interface IRefreshTokenRepository
{
    Task<RefreshToken?> GetByTokenAsync(string token);
    Task<IEnumerable<RefreshToken>> GetByUserIdAsync(int userId);
    Task<int> CreateAsync(RefreshToken refreshToken);
    Task<bool> RevokeAsync(string token, string? replacedByToken = null);
    Task<bool> RevokeAllByUserIdAsync(int userId);
}
