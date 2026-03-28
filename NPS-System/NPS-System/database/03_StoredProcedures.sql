-- =============================================
-- NPS System Stored Procedures (Optional)
-- SQL Server
-- =============================================

USE NPSDatabase;
GO

-- =============================================
-- Procedure: Get NPS Statistics
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetNpsStatistics')
    DROP PROCEDURE sp_GetNpsStatistics;
GO

CREATE PROCEDURE sp_GetNpsStatistics
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        COUNT(*) as TotalVotes,
        SUM(CASE WHEN Score >= 9 THEN 1 ELSE 0 END) as Promoters,
        SUM(CASE WHEN Score >= 7 AND Score < 9 THEN 1 ELSE 0 END) as Passives,
        SUM(CASE WHEN Score < 7 THEN 1 ELSE 0 END) as Detractors,
        CAST(
            CASE 
                WHEN COUNT(*) > 0 THEN
                    ROUND(
                        (CAST(SUM(CASE WHEN Score >= 9 THEN 1 ELSE 0 END) AS DECIMAL(10,2)) - 
                         CAST(SUM(CASE WHEN Score < 7 THEN 1 ELSE 0 END) AS DECIMAL(10,2))) / 
                        CAST(COUNT(*) AS DECIMAL(10,2)) * 100, 2
                    )
                ELSE 0
            END AS DECIMAL(10,2)
        ) as NpsScore
    FROM [dbo].[Votes];
END
GO

-- =============================================
-- Procedure: Get Recent Votes
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetRecentVotes')
    DROP PROCEDURE sp_GetRecentVotes;
GO

CREATE PROCEDURE sp_GetRecentVotes
    @TopCount INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT TOP (@TopCount)
        v.Id,
        v.UserId,
        u.Username,
        v.Score,
        CASE 
            WHEN v.Score >= 9 THEN 'Promotor'
            WHEN v.Score >= 7 THEN 'Neutro'
            ELSE 'Detractor'
        END as Category,
        v.Comment,
        v.CreatedAt
    FROM [dbo].[Votes] v
    INNER JOIN [dbo].[Users] u ON v.UserId = u.Id
    ORDER BY v.CreatedAt DESC;
END
GO

-- =============================================
-- Procedure: Check User Lock Status
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_CheckAndUnlockUser')
    DROP PROCEDURE sp_CheckAndUnlockUser;
GO

CREATE PROCEDURE sp_CheckAndUnlockUser
    @Username NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Unlock users whose lock period has expired
    UPDATE [dbo].[Users]
    SET IsLocked = 0, 
        LockedUntil = NULL, 
        FailedLoginAttempts = 0
    WHERE Username = @Username 
      AND IsLocked = 1 
      AND LockedUntil IS NOT NULL 
      AND LockedUntil <= GETUTCDATE();
    
    -- Return user info
    SELECT 
        Id,
        Username,
        Email,
        PasswordHash,
        Role,
        IsLocked,
        FailedLoginAttempts,
        LockedUntil,
        IsActive
    FROM [dbo].[Users]
    WHERE Username = @Username AND IsActive = 1;
END
GO

-- =============================================
-- Procedure: Clean Expired Refresh Tokens
-- =============================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_CleanExpiredTokens')
    DROP PROCEDURE sp_CleanExpiredTokens;
GO

CREATE PROCEDURE sp_CleanExpiredTokens
AS
BEGIN
    SET NOCOUNT ON;
    
    DELETE FROM [dbo].[RefreshTokens]
    WHERE ExpiresAt < GETUTCDATE() 
       OR RevokedAt IS NOT NULL;
    
    SELECT @@ROWCOUNT as DeletedTokens;
END
GO

PRINT 'Stored procedures created successfully!';
GO
