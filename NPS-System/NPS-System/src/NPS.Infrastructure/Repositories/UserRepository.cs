using Dapper;
using NPS.Domain.Entities;
using NPS.Domain.Interfaces;
using NPS.Infrastructure.Data;

namespace NPS.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly DapperContext _context;

    public UserRepository(DapperContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByIdAsync(int id)
    {
        const string query = "SELECT * FROM Users WHERE Id = @Id AND IsActive = 1";
        using var connection = _context.CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<User>(query, new { Id = id });
    }

    public async Task<User?> GetByUsernameAsync(string username)
    {
        const string query = "SELECT * FROM Users WHERE Username = @Username AND IsActive = 1";
        using var connection = _context.CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<User>(query, new { Username = username });
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        const string query = "SELECT * FROM Users WHERE Email = @Email AND IsActive = 1";
        using var connection = _context.CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<User>(query, new { Email = email });
    }

    public async Task<IEnumerable<User>> GetAllAsync()
    {
        const string query = "SELECT * FROM Users WHERE IsActive = 1";
        using var connection = _context.CreateConnection();
        return await connection.QueryAsync<User>(query);
    }

    public async Task<int> CreateAsync(User user)
    {
        const string query = @"
            INSERT INTO Users (Username, Email, PasswordHash, Role, IsLocked, FailedLoginAttempts, CreatedAt, IsActive)
            VALUES (@Username, @Email, @PasswordHash, @Role, @IsLocked, @FailedLoginAttempts, @CreatedAt, @IsActive);
            SELECT CAST(SCOPE_IDENTITY() as int)";
        
        using var connection = _context.CreateConnection();
        return await connection.QuerySingleAsync<int>(query, user);
    }

    public async Task<bool> UpdateAsync(User user)
    {
        const string query = @"
            UPDATE Users 
            SET Email = @Email, 
                PasswordHash = @PasswordHash, 
                Role = @Role,
                IsLocked = @IsLocked,
                FailedLoginAttempts = @FailedLoginAttempts,
                LockedUntil = @LockedUntil,
                LastLoginAt = @LastLoginAt
            WHERE Id = @Id";
        
        using var connection = _context.CreateConnection();
        var affected = await connection.ExecuteAsync(query, user);
        return affected > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        const string query = "UPDATE Users SET IsActive = 0 WHERE Id = @Id";
        using var connection = _context.CreateConnection();
        var affected = await connection.ExecuteAsync(query, new { Id = id });
        return affected > 0;
    }

    public async Task<bool> IncrementFailedLoginAttemptsAsync(int userId)
    {
        const string query = "UPDATE Users SET FailedLoginAttempts = FailedLoginAttempts + 1 WHERE Id = @UserId";
        using var connection = _context.CreateConnection();
        var affected = await connection.ExecuteAsync(query, new { UserId = userId });
        return affected > 0;
    }

    public async Task<bool> ResetFailedLoginAttemptsAsync(int userId)
    {
        const string query = "UPDATE Users SET FailedLoginAttempts = 0, IsLocked = 0, LockedUntil = NULL WHERE Id = @UserId";
        using var connection = _context.CreateConnection();
        var affected = await connection.ExecuteAsync(query, new { UserId = userId });
        return affected > 0;
    }

    public async Task<bool> LockUserAsync(int userId, DateTime lockedUntil)
    {
        const string query = "UPDATE Users SET IsLocked = 1, LockedUntil = @LockedUntil WHERE Id = @UserId";
        using var connection = _context.CreateConnection();
        var affected = await connection.ExecuteAsync(query, new { UserId = userId, LockedUntil = lockedUntil });
        return affected > 0;
    }

    public async Task<bool> UnlockUserAsync(int userId)
    {
        const string query = "UPDATE Users SET IsLocked = 0, LockedUntil = NULL, FailedLoginAttempts = 0 WHERE Id = @UserId";
        using var connection = _context.CreateConnection();
        var affected = await connection.ExecuteAsync(query, new { UserId = userId });
        return affected > 0;
    }
}
