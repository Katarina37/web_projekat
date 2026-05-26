USE TravelPlannerDB;

-- Tabela korisnika
CREATE TABLE Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(200) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(500) NOT NULL,
    Role NVARCHAR(20) NOT NULL DEFAULT 'user',
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Tabela planova putovanja
CREATE TABLE TravelPlans (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(1000),
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    Budget DECIMAL(18,2) NOT NULL DEFAULT 0,
    Notes NVARCHAR(2000),
    CreatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_TravelPlans_Users FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    CONSTRAINT CHK_Dates CHECK (EndDate >= StartDate),
    CONSTRAINT CHK_Budget CHECK (Budget >= 0)
);

-- Tabela destinacija
CREATE TABLE Destinations (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    TravelPlanId INT NOT NULL,
    Name NVARCHAR(200) NOT NULL,
    Location NVARCHAR(300),
    ArrivalDate DATE NOT NULL,
    DepartureDate DATE NOT NULL,
    Description NVARCHAR(1000),
    CONSTRAINT FK_Destinations_TravelPlans FOREIGN KEY (TravelPlanId) REFERENCES TravelPlans(Id) ON DELETE CASCADE
);

-- Tabela aktivnosti
CREATE TABLE Activities (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    TravelPlanId INT NOT NULL,
    Name NVARCHAR(200) NOT NULL,
    ActivityDate DATE NOT NULL,
    ActivityTime TIME,
    Location NVARCHAR(300),
    Description NVARCHAR(1000),
    EstimatedCost DECIMAL(18,2) DEFAULT 0,
    Status NVARCHAR(20) NOT NULL DEFAULT 'planned',
    CONSTRAINT FK_Activities_TravelPlans FOREIGN KEY (TravelPlanId) REFERENCES TravelPlans(Id) ON DELETE CASCADE,
    CONSTRAINT CHK_ActivityStatus CHECK (Status IN ('planned', 'reserved', 'completed', 'cancelled'))
);

-- Tabela troskova
CREATE TABLE Expenses (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    TravelPlanId INT NOT NULL,
    Name NVARCHAR(200) NOT NULL,
    Category NVARCHAR(50) NOT NULL,
    Amount DECIMAL(18,2) NOT NULL,
    ExpenseDate DATE NOT NULL,
    Description NVARCHAR(1000),
    CONSTRAINT FK_Expenses_TravelPlans FOREIGN KEY (TravelPlanId) REFERENCES TravelPlans(Id) ON DELETE CASCADE,
    CONSTRAINT CHK_Amount CHECK (Amount >= 0),
    CONSTRAINT CHK_Category CHECK (Category IN ('transport', 'accommodation', 'food', 'tickets', 'shopping', 'other'))
);

-- Tabela checkliste
CREATE TABLE ChecklistItems (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    TravelPlanId INT NOT NULL,
    Name NVARCHAR(200) NOT NULL,
    IsCompleted BIT NOT NULL DEFAULT 0,
    CONSTRAINT FK_ChecklistItems_TravelPlans FOREIGN KEY (TravelPlanId) REFERENCES TravelPlans(Id) ON DELETE CASCADE
);

-- Tabela dijeljenja planova
CREATE TABLE SharedPlans (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    TravelPlanId INT NOT NULL,
    Token NVARCHAR(500) NOT NULL UNIQUE,
    AccessType NVARCHAR(10) NOT NULL DEFAULT 'view',
    ExpiresAt DATETIME,
    CreatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_SharedPlans_TravelPlans FOREIGN KEY (TravelPlanId) REFERENCES TravelPlans(Id) ON DELETE CASCADE,
    CONSTRAINT CHK_AccessType CHECK (AccessType IN ('view', 'edit'))
);

-- ovo samo kad se dodaje admin, inace ne pokretati
USE TravelPlannerDB;

UPDATE Users SET Role = 'admin' WHERE Email = 'admin@email.com';

USE TravelPlannerDB;
SELECT * FROM Users;

USE TravelPlannerDB;
UPDATE Users SET Role = 'admin' WHERE Email = 'admin@gmail.com';

SELECT * FROM Users;