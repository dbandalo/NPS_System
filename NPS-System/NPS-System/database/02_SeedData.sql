-- =============================================
-- NPS System Seed Data Script
-- SQL Server
-- =============================================
-- Password for all users: "Password123!"
-- BCrypt hash generated with cost factor 12
-- =============================================

USE NPSDatabase;
GO

-- Clear existing data (optional - comment out in production)
-- DELETE FROM [dbo].[LoginAttempts];
-- DELETE FROM [dbo].[RefreshTokens];
-- DELETE FROM [dbo].[Votes];
-- DELETE FROM [dbo].[Users];
-- GO

-- Insert Admin User
IF NOT EXISTS (SELECT 1 FROM [dbo].[Users] WHERE [Username] = 'admin')
BEGIN
    INSERT INTO [dbo].[Users] ([Username], [Email], [PasswordHash], [Role], [IsActive])
    VALUES ('admin', 'admin@nps-system.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.ySxPBl1NwRnZ.y', 'Admin', 1);
    
    PRINT 'Admin user created successfully!';
END
GO

-- Insert Sample Votante Users
IF NOT EXISTS (SELECT 1 FROM [dbo].[Users] WHERE [Username] = 'votante1')
BEGIN
    INSERT INTO [dbo].[Users] ([Username], [Email], [PasswordHash], [Role], [IsActive])
    VALUES 
        ('votante1', 'votante1@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.ySxPBl1NwRnZ.y', 'Votante', 1),
        ('votante2', 'votante2@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.ySxPBl1NwRnZ.y', 'Votante', 1),
        ('votante3', 'votante3@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.ySxPBl1NwRnZ.y', 'Votante', 1),
        ('votante4', 'votante4@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.ySxPBl1NwRnZ.y', 'Votante', 1),
        ('votante5', 'votante5@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.ySxPBl1NwRnZ.y', 'Votante', 1);
    
    PRINT 'Sample votante users created successfully!';
END
GO

-- Insert Sample Votes (for demonstration)
DECLARE @UserId2 INT, @UserId3 INT, @UserId4 INT;

SELECT @UserId2 = [Id] FROM [dbo].[Users] WHERE [Username] = 'votante2';
SELECT @UserId3 = [Id] FROM [dbo].[Users] WHERE [Username] = 'votante3';
SELECT @UserId4 = [Id] FROM [dbo].[Users] WHERE [Username] = 'votante4';

IF NOT EXISTS (SELECT 1 FROM [dbo].[Votes] WHERE [UserId] = @UserId2) AND @UserId2 IS NOT NULL
BEGIN
    INSERT INTO [dbo].[Votes] ([UserId], [Score], [Comment])
    VALUES 
        (@UserId2, 9, 'Excelente servicio, muy recomendado!'),
        (@UserId3, 7, 'Buen servicio, pero puede mejorar en tiempos de respuesta.'),
        (@UserId4, 10, 'Increible experiencia, superaron mis expectativas!');
    
    PRINT 'Sample votes created successfully!';
END
GO

-- =============================================
-- Test Credentials Summary
-- =============================================
-- | Username  | Password      | Role    |
-- |-----------|---------------|---------|
-- | admin     | Password123!  | Admin   |
-- | votante1  | Password123!  | Votante |
-- | votante2  | Password123!  | Votante | (has voted)
-- | votante3  | Password123!  | Votante | (has voted)
-- | votante4  | Password123!  | Votante | (has voted)
-- | votante5  | Password123!  | Votante |
-- =============================================

PRINT 'Seed data inserted successfully!';
GO
