using NPS.Domain.Entities;

namespace NPS.Domain.Interfaces;

public interface IVoteRepository
{
    Task<Vote?> GetByIdAsync(int id);
    Task<Vote?> GetByUserIdAsync(int userId);
    Task<IEnumerable<Vote>> GetAllAsync();
    Task<int> CreateAsync(Vote vote);
    Task<bool> HasUserVotedAsync(int userId);
    Task<NpsStatistics> GetNpsStatisticsAsync();
}

public class NpsStatistics
{
    public int TotalVotes { get; set; }
    public int Promoters { get; set; }  // 9-10
    public int Passives { get; set; }   // 7-8
    public int Detractors { get; set; } // 0-6
    public decimal NpsScore => TotalVotes > 0 
        ? Math.Round(((decimal)(Promoters - Detractors) / TotalVotes) * 100, 2) 
        : 0;
    public decimal PromoterPercentage => TotalVotes > 0 
        ? Math.Round((decimal)Promoters / TotalVotes * 100, 2) 
        : 0;
    public decimal PassivePercentage => TotalVotes > 0 
        ? Math.Round((decimal)Passives / TotalVotes * 100, 2) 
        : 0;
    public decimal DetractorPercentage => TotalVotes > 0 
        ? Math.Round((decimal)Detractors / TotalVotes * 100, 2) 
        : 0;
}
