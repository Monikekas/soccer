IF DB_ID('db_soccer') IS NULL
BEGIN
    CREATE DATABASE db_soccer;
END;
GO

USE db_soccer;
GO


CREATE TABLE league (
    id INT IDENTITY(1,1) NOT NULL,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    start_date DATETIME2 NOT NULL CONSTRAINT df_league_start_date DEFAULT (SYSDATETIME()),
    end_date DATETIME2 NOT NULL CONSTRAINT df_league_end_date DEFAULT (SYSDATETIME()),
    enabled BIT NOT NULL CONSTRAINT df_league_enabled DEFAULT (1),
    CONSTRAINT pk_league PRIMARY KEY (id),
    CONSTRAINT ck_league_name_length CHECK (LEN(LTRIM(RTRIM(name))) >= 2),
    CONSTRAINT ck_league_country_length  CHECK (LEN(LTRIM(RTRIM(country))) >= 2),
    CONSTRAINT ck_league_date_range CHECK (start_date <= end_date)
);
GO

CREATE TABLE team (
    id INT IDENTITY(1,1) NOT NULL,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    players_quantity INT NOT NULL,
    enabled BIT NOT NULL CONSTRAINT df_team_enabled DEFAULT (1),

    CONSTRAINT pk_team PRIMARY KEY (id),
    CONSTRAINT ck_team_name_length CHECK (LEN(LTRIM(RTRIM(name))) >= 2),
    CONSTRAINT ck_team_country_length CHECK (LEN(LTRIM(RTRIM(country))) >= 2),
    CONSTRAINT ck_team_players_quantity CHECK (players_quantity BETWEEN 11 AND 22)
);
GO

CREATE TABLE league_has_team (
    league INT NOT NULL,
    team INT NOT NULL,

    CONSTRAINT pk_league_has_team PRIMARY KEY (league, team),
    CONSTRAINT fk_league_has_team_league FOREIGN KEY (league) REFERENCES league (id),
    CONSTRAINT fk_league_has_team_team FOREIGN KEY (team) REFERENCES team (id)
);
GO


CREATE TABLE rol (
    id INT IDENTITY(1,1) NOT NULL,
    name VARCHAR(30) NOT NULL,

    CONSTRAINT pk_rol PRIMARY KEY (id),
    CONSTRAINT uq_rol_name UNIQUE (name)
);
GO

INSERT INTO rol (name)
VALUES ('admin'), ('team');
GO

CREATE TABLE user (
    id INT IDENTITY(1,1) NOT NULL,
    [user] VARCHAR(100) NOT NULL,
    pwd_hash VARCHAR(255) NOT NULL,
    role INT NOT NULL,

    CONSTRAINT pk_user PRIMARY KEY (id),
    CONSTRAINT uq_user_username UNIQUE ([user]),
    CONSTRAINT fk_user_rol FOREIGN KEY (role) REFERENCES rol (id)
);
GO

INSERT INTO [user] ([user], pwd_hash, role)
SELECT
    'admin',
    'AQAAAAIAAYagAAAAEHogz2kRkEBjmrUFUFcIlooaiem28KHfilfEPrH7alEg6geHGN6oQF1H+u7oKELJJg==',
    id
FROM rol
WHERE name = 'admin';

INSERT INTO [user] ([user], pwd_hash, role)
SELECT
    'team',
    'AQAAAAIAAYagAAAAECcwQLWoyd1YVEIKWPatBMxNiYhfU3epleExXdieCN5nLQScx9K+axP3b6wMmQZFxg==',
    id
FROM rol
WHERE name = 'team';
GO
