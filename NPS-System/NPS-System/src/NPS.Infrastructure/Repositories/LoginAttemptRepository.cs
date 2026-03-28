using Dapper;
using NPS.Domain.Entities;
using NPS.Domain.Interfaces;
using NPS.Infrastructure.Data;

namespace NPS.Infrastructure.Repositories;

public class LoginAttemptRepository : ILoginAttemptRepository
{
    private readonly DapperContext _context;

    public LoginAttemptRepository(DapperContext context)
    {
        _context = context;
    }

    public async Task<int> CreateAsync(LoginAttempt loginAttempt)
    {
        const string query = @"
            INSERT INTO LoginAttempts (UserId, Username, IpAddress, IsSuccessful, FailureReason, AttemptedAt)
            VALUES (@UserId, @Username, @IpAddress, @IsSuccessful, @FailureReason, @AttemptedAt);
            SELECT CAST(SCOPE_IDENTITY() as int)";
        
        using var connection = _context.CreateConnection();
        return await connection.QuerySingleAsync<int>(query, loginAttempt);
    }

    public async Task<IEnumerable<LoginAttempt>> GetRecentByUsernameAsync(string username, int count = 3)
    {
        const string query = @"
            SELECT TOP (@Count) * FROM LoginAttempts 
            WHERE Username = @Username 
            ORDER BY AttemptedAt DESC";
        
        using var connection = _context.CreateConnection();
        return await connection.QueryAsync<LoginAttempt>(query, new { Username = username, Count = count });
    }

    public async Task<IEnumerable<LoginAttempt>> GetByUserIdAsync(int userId)
    {
        const string query = "SELECT * FROM LoginAttempts WHERE UserId = @UserId ORDER BY AttemptedAt DESC";
        using var connection = _context.CreateConnection();
        return await connection.QueryAsync<LoginAttempt>(query, new { UserId = userId });
    }
}
