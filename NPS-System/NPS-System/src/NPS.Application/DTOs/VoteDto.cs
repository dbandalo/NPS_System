namespace NPS.Application.DTOs;

public class VoteDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public int Score { get; set; }
    public string Category { get; set; } = string.Empty;
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateVoteDto
{
    public int Score { get; set; }
    public string? Comment { get; set; }
}

public class NpsResultDto
{
    public int TotalVotes { get; set; }
    public int Promoters { get; set; }
    public int Passives { get; set; }
    public int Detractors { get; set; }
    public decimal NpsScore { get; set; }
    public decimal PromoterPercentage { get; set; }
    public decimal PassivePercentage { get; set; }
    public decimal DetractorPercentage { get; set; }
    public List<VoteDto> RecentVotes { get; set; } = new();
}
