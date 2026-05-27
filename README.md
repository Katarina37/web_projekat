# TravelPlanner — Web aplikacija za planiranje putovanja

---

## Arhitektura sistema

Sistem je organizovan kao mikroservisna arhitektura na Microsoft Service Fabric platformi:

```
React Frontend (Vite + TypeScript)
        |
        | HTTP/REST
        |
┌───────────────────────────────────────────────┐
│           Microsoft Service Fabric            │
│                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌───────────────┐ │
│  │ UserService │  │TravelService│  │FinanceService │ │
│  │ (Stateless) │  │ (Stateless) │  │  (Stateful)   │ │
│  │             │  │             │  │               │ │
│  │ Registracija│  │ Planovi     │  │ Troškovi      │ │
│  │ Prijava     │  │ Destinacije │  │ Budžet        │ │
│  │ JWT tokeni  │  │ Aktivnosti  │  │               │ │
│  │ Korisnici   │  │ Checklist   │  │               │ │
│  │             │  │ Dijeljenje  │  │               │ │
│  └──────┬──────┘  └──────┬──────┘  └───────┬───────┘ │
└─────────┼────────────────┼─────────────────┼─────────┘
          └────────────────┼─────────────────┘
                           │
                  SQL Server baza podataka
                     (TravelPlannerDB)
```

### Mikroservisi

| Servis | Tip | Port | Odgovornost |
|--------|-----|------|-------------|
| UserService | Stateless ASP.NET Core | 8081 | Registracija, prijava, JWT autentikacija, upravljanje korisnicima |
| TravelService | Stateless ASP.NET Core | 8082 | Planovi putovanja, destinacije, aktivnosti, checklist, dijeljenje |
| FinanceService | Stateful ASP.NET Core | 8083 | Troškovi, upravljanje budžetom |

### Frontend

- **Tehnologija:** React + TypeScript (Vite)
- **State management:** Context API
- **HTTP klijent:** Axios (u servisima)
- **Port:** 5173

---

## Preduslovi

Prije pokretanja projekta, potrebno je instalirati:

- **Windows 10/11** (64-bit)
- **Visual Studio 2022** sa Azure development workload-om
- **Service Fabric Runtime** (v11.4.205.1)
- **Service Fabric SDK** (v8.4.205)
- **SQL Server 2022 Developer**
- **SQL Server Management Studio (SSMS)**
- **Node.js** (v20 LTS ili noviji)
- **Git**

---

## Pokretanje sistema

### 1. Kloniranje repozitorijuma

```bash
git clone https://github.com/Katarina37/web_projekat.git
cd web_projekat/TravelPlannerSF
```

### 2. Pokretanje SQL Servera i kreiranje baze

Otvoriti **SQL Server Management Studio** i povezati se na `localhost` sa Windows autentikacijom.

Pokrenuti SQL skriptu za kreiranje baze i tabela:

```sql
USE master;
CREATE DATABASE TravelPlannerDB;
GO
USE TravelPlannerDB;

CREATE TABLE Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(200) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(500) NOT NULL,
    Role NVARCHAR(20) NOT NULL DEFAULT 'user',
    CreatedAt DATETIME DEFAULT GETDATE()
);

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

CREATE TABLE ChecklistItems (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    TravelPlanId INT NOT NULL,
    Name NVARCHAR(200) NOT NULL,
    IsCompleted BIT NOT NULL DEFAULT 0,
    CONSTRAINT FK_ChecklistItems_TravelPlans FOREIGN KEY (TravelPlanId) REFERENCES TravelPlans(Id) ON DELETE CASCADE
);

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
```

### 3. Pokretanje Service Fabric lokalnog klastera

Pronaći **Service Fabric Local Cluster Manager** u system tray-u (donji desni ugao ekrana).

Desni klik → **Setup Local Cluster** → **Windows 1 Node**

Sačekati par minuta da se klaster podigne.

### 4. Pokretanje backend servisa

Otvoriti `TravelPlannerSF.sln` u **Visual Studio 2022**.

Pokrenuti svaki servis odvojeno:

- Desni klik na **UserService** → **Debug → Start New Instance**
- Desni klik na **TravelService** → **Debug → Start New Instance**
- Desni klik na **FinanceService** → **Debug → Start New Instance**

Provjeriti da servisi rade na:
- UserService: http://localhost:8081/swagger
- TravelService: http://localhost:8082/swagger
- FinanceService: http://localhost:8083/swagger

### 5. Pokretanje frontend aplikacije

```bash
cd TravelPlannerSF/travel-planner-frontend
npm install
npm run dev
```

Aplikacija je dostupna na: **http://localhost:5173**

---

## Kreiranje admin korisnika

1. Registrovati se kroz aplikaciju na http://localhost:5173/register
2. U SSMS pokrenuti:

```sql
USE TravelPlannerDB;
UPDATE Users SET Role = 'admin' WHERE Email = 'vas@email.com';
```

3. Odjaviti se i prijaviti ponovo — u navigaciji će se pojaviti **Admin panel**

---

## Korišćene tehnologije

### Backend
- ASP.NET Core 8.0
- Microsoft Service Fabric
- Entity Framework Core 8.0
- JWT Bearer autentikacija
- BCrypt.Net za heširanje lozinki
- AutoMapper
- SQL Server 2022

### Frontend
- React 18 + TypeScript
- Vite
- React Router DOM
- Axios
- qrcode.react

---

## Funkcionalnosti

- Registracija i prijava korisnika sa JWT autentikacijom
- Kreiranje, pregled, izmjena i brisanje planova putovanja
- Upravljanje destinacijama sa opisom i napomenama
- Organizacija aktivnosti po danima sa kalendarskim prikazom
- Evidencija troškova i praćenje budžeta
- Checklist / packing lista
- Dijeljenje plana putovanja putem QR koda (VIEW i EDIT pristup)
- Admin panel za upravljanje korisnicima

---

## Struktura projekta

```
web_projekat/
└── TravelPlannerSF/
    ├── TravelPlannerSF/          
    ├── UserService/              
    │   ├── Controllers/
    │   ├── Data/
    │   ├── DTOs/
    │   ├── Mappings/
    │   ├── Models/
    │   └── Services/
    ├── TravelService/            
    │   ├── Controllers/
    │   ├── Data/
    │   ├── DTOs/
    │   ├── Mappings/
    │   ├── Models/
    │   └── Services/
    ├── FinanceService/           
    │   ├── Controllers/
    │   ├── Data/
    │   ├── DTOs/
    │   ├── Mappings/
    │   ├── Models/
    │   └── Services/
    └── travel-planner-frontend/  
        └── src/
            ├── components/
            ├── context/
            ├── models/
            ├── pages/
            └── services/
```
