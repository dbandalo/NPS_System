using NPS.Domain.Entities;

namespace NPS.Domain.Interfaces;

public interface ILoginAttemptRepository
{
    Task<int> CreateAsync(LoginAttempt loginAttempt);
    Task<IEnumerable<LoginAttempt>> GetRecentByUsernameAsync(string username, int count = 3);
    Task<IEnumerable<LoginAttempt>> GetByUserIdAsync(int userId);
}
