using NPS.Domain.Entities;

namespace NPS.Domain.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(int id);
    Task<User?> GetByUsernameAsync(string username);
    Task<User?> GetByEmailAsync(string email);
    Task<IEnumerable<User>> GetAllAsync();
    Task<int> CreateAsync(User user);
    Task<bool> UpdateAsync(User user);
    Task<bool> DeleteAsync(int id);
    Task<bool> IncrementFailedLoginAttemptsAsync(int userId);
    Task<bool> ResetFailedLoginAttemptsAsync(int userId);
    Task<bool> LockUserAsync(int userId, DateTime lockedUntil);
    Task<bool> UnlockUserAsync(int userId);
}
