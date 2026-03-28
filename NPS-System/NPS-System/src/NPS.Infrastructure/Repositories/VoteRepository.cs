using Dapper;
using NPS.Domain.Entities;
using NPS.Domain.Interfaces;
using NPS.Infrastructure.Data;

namespace NPS.Infrastructure.Repositories;

public class VoteRepository : IVoteRepository
{
    private readonly DapperContext _context;

    public VoteRepository(DapperContext context)
    {
        _context = context;
    }

    public async Task<Vote?> GetByIdAsync(int id)
    {
        const string query = @"
            SELECT v.*, u.* FROM Votes v
            INNER JOIN Users u ON v.UserId = u.Id
            WHERE v.Id = @Id";
        
        using var connection = _context.CreateConnection();
        var result = await connection.QueryAsync<Vote, User, Vote>(
            query,
            (vote, user) =>
            {
                vote.User = user;
                return vote;
            },
            new { Id = id },
            splitOn: "Id"
        );
        return result.FirstOrDefault();
    }

    public async Task<Vote?> GetByUserIdAsync(int userId)
    {
        const string query = "SELECT * FROM Votes WHERE UserId = @UserId";
        using var connection = _context.CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<Vote>(query, new { UserId = userId });
    }

    public async Task<IEnumerable<Vote>> GetAllAsync()
    {
        const string query = @"
            SELECT v.*, u.* FROM Votes v
            INNER JOIN Users u ON v.UserId = u.Id
            ORDER BY v.CreatedAt DESC";
        
        using var connection = _context.CreateConnection();
        return await connection.QueryAsync<Vote, User, Vote>(
            query,
            (vote, user) =>
            {
                vote.User = user;
                return vote;
            },
            splitOn: "Id"
        );
    }

    public async Task<int> CreateAsync(Vote vote)
    {
        const string query = @"
            INSERT INTO Votes (UserId, Score, Comment, CreatedAt)
            VALUES (@UserId, @Score, @Comment, @CreatedAt);
            SELECT CAST(SCOPE_IDENTITY() as int)";
        
        using var connection = _context.CreateConnection();
        return await connection.QuerySingleAsync<int>(query, vote);
    }

    public async Task<bool> HasUserVotedAsync(int userId)
    {
        const string query = "SELECT COUNT(1) FROM Votes WHERE UserId = @UserId";
        using var connection = _context.CreateConnection();
        var count = await connection.ExecuteScalarAsync<int>(query, new { UserId = userId });
        return count > 0;
    }

    public async Task<NpsStatistics> GetNpsStatisticsAsync()
    {
        const string query = @"
            SELECT 
                COUNT(*) as TotalVotes,
                SUM(CASE WHEN Score >= 9 THEN 1 ELSE 0 END) as Promoters,
                SUM(CASE WHEN Score >= 7 AND Score < 9 THEN 1 ELSE 0 END) as Passives,
                SUM(CASE WHEN Score < 7 THEN 1 ELSE 0 END) as Detractors
            FROM Votes";
        
        using var connection = _context.CreateConnection();
        var result = await connection.QueryFirstOrDefaultAsync<NpsStatistics>(query);
        return result ?? new NpsStatistics();
    }
}
