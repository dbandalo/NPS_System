namespace NPS.Domain.Entities;

public class LoginAttempt
{
    public int Id { get; set; }
    public int? UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
    public bool IsSuccessful { get; set; }
    public string? FailureReason { get; set; }
    public DateTime AttemptedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    public User? User { get; set; }
}
