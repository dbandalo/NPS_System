using Dapper;
using NPS.Domain.Entities;
using NPS.Domain.Interfaces;
using NPS.Infrastructure.Data;

namespace NPS.Infrastructure.Repositories;

public class RefreshTokenRepository : IRefreshTokenRepository
{
    private readonly DapperContext _context;

    public RefreshTokenRepository(DapperContext context)
    {
        _context = context;
    }

    public async Task<RefreshToken?> GetByTokenAsync(string token)
    {
        const string query = "SELECT * FROM RefreshTokens WHERE Token = @Token";
        using var connection = _context.CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<RefreshToken>(query, new { Token = token });
    }

    public async Task<IEnumerable<RefreshToken>> GetByUserIdAsync(int userId)
    {
        const string query = "SELECT * FROM RefreshTokens WHERE UserId = @UserId";
        using var connection = _context.CreateConnection();
        return await connection.QueryAsync<RefreshToken>(query, new { UserId = userId });
    }

    public async Task<int> CreateAsync(RefreshToken refreshToken)
    {
        const string query = @"
            INSERT INTO RefreshTokens (UserId, Token, ExpiresAt, CreatedAt)
            VALUES (@UserId, @Token, @ExpiresAt, @CreatedAt);
            SELECT CAST(SCOPE_IDENTITY() as int)";
        
        using var connection = _context.CreateConnection();
        return await connection.QuerySingleAsync<int>(query, refreshToken);
    }

    public async Task<bool> RevokeAsync(string token, string? replacedByToken = null)
    {
        const string query = @"
            UPDATE RefreshTokens 
            SET RevokedAt = @RevokedAt, ReplacedByToken = @ReplacedByToken 
            WHERE Token = @Token";
        
        using var connection = _context.CreateConnection();
        var affected = await connection.ExecuteAsync(query, new 
        { 
            Token = token, 
            RevokedAt = DateTime.UtcNow, 
            ReplacedByToken = replacedByToken 
        });
        return affected > 0;
    }

    public async Task<bool> RevokeAllByUserIdAsync(int userId)
    {
        const string query = @"
            UPDATE RefreshTokens 
            SET RevokedAt = @RevokedAt 
            WHERE UserId = @UserId AND RevokedAt IS NULL";
        
        using var connection = _context.CreateConnection();
        var affected = await connection.ExecuteAsync(query, new { UserId = userId, RevokedAt = DateTime.UtcNow });
        return affected > 0;
    }
}
