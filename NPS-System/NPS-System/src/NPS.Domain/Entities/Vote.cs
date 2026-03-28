namespace NPS.Domain.Entities;

public class Vote
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int Score { get; set; } // 0-10
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    public User? User { get; set; }
    
    // Calculated property for NPS category
    public string Category => Score switch
    {
        >= 9 => "Promotor",
        >= 7 => "Neutro",
        _ => "Detractor"
    };
}
