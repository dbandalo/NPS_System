-- =============================================
-- NPS System Database Creation Script
-- SQL Server 2019+
-- =============================================

-- Create Database
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'NPSDatabase')
BEGIN
    CREATE DATABASE NPSDatabase;
END
GO

USE NPSDatabase;
GO

-- =============================================
-- Create Tables
-- =============================================

-- Users Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Users] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [Username] NVARCHAR(50) NOT NULL UNIQUE,
        [Email] NVARCHAR(100) NOT NULL UNIQUE,
        [PasswordHash] NVARCHAR(255) NOT NULL,
        [Role] NVARCHAR(20) NOT NULL DEFAULT 'Votante', -- 'Votante' or 'Admin'
        [IsLocked] BIT NOT NULL DEFAULT 0,
        [FailedLoginAttempts] INT NOT NULL DEFAULT 0,
        [LockedUntil] DATETIME2 NULL,
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [LastLoginAt] DATETIME2 NULL,
        [IsActive] BIT NOT NULL DEFAULT 1,
        
        CONSTRAINT [CK_Users_Role] CHECK ([Role] IN ('Votante', 'Admin'))
    );
    
    CREATE INDEX [IX_Users_Username] ON [dbo].[Users]([Username]);
    CREATE INDEX [IX_Users_Email] ON [dbo].[Users]([Email]);
END
GO

-- Votes Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Votes]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Votes] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [UserId] INT NOT NULL,
        [Score] INT NOT NULL,
        [Comment] NVARCHAR(500) NULL,
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        
        CONSTRAINT [FK_Votes_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([Id]),
        CONSTRAINT [CK_Votes_Score] CHECK ([Score] >= 0 AND [Score] <= 10),
        CONSTRAINT [UQ_Votes_UserId] UNIQUE ([UserId]) -- Each user can vote only once
    );
    
    CREATE INDEX [IX_Votes_UserId] ON [dbo].[Votes]([UserId]);
    CREATE INDEX [IX_Votes_CreatedAt] ON [dbo].[Votes]([CreatedAt] DESC);
END
GO

-- RefreshTokens Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[RefreshTokens]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[RefreshTokens] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [UserId] INT NOT NULL,
        [Token] NVARCHAR(500) NOT NULL,
        [ExpiresAt] DATETIME2 NOT NULL,
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [RevokedAt] DATETIME2 NULL,
        [ReplacedByToken] NVARCHAR(500) NULL,
        
        CONSTRAINT [FK_RefreshTokens_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([Id])
    );
    
    CREATE INDEX [IX_RefreshTokens_Token] ON [dbo].[RefreshTokens]([Token]);
    CREATE INDEX [IX_RefreshTokens_UserId] ON [dbo].[RefreshTokens]([UserId]);
END
GO

-- LoginAttempts Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[LoginAttempts]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[LoginAttempts] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [UserId] INT NULL,
        [Username] NVARCHAR(50) NOT NULL,
        [IpAddress] NVARCHAR(45) NOT NULL,
        [IsSuccessful] BIT NOT NULL,
        [FailureReason] NVARCHAR(255) NULL,
        [AttemptedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        
        CONSTRAINT [FK_LoginAttempts_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([Id])
    );
    
    CREATE INDEX [IX_LoginAttempts_Username] ON [dbo].[LoginAttempts]([Username]);
    CREATE INDEX [IX_LoginAttempts_AttemptedAt] ON [dbo].[LoginAttempts]([AttemptedAt] DESC);
END
GO

PRINT 'Database schema created successfully!';
GO
