-- Users and Authentication
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE espn_credentials (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    espn_s2 VARCHAR(255),
    swid VARCHAR(255),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leagues and Teams
CREATE TABLE leagues (
    id SERIAL PRIMARY KEY,
    espn_id BIGINT NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id),
    season INTEGER NOT NULL,
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(espn_id, season, user_id)
);

CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    espn_id INTEGER NOT NULL,
    league_id INTEGER NOT NULL REFERENCES leagues(id),
    name VARCHAR(100),
    rank INTEGER,
    wins INTEGER,
    losses INTEGER,
    ties INTEGER,
    points_for DECIMAL(10,2),
    points_against DECIMAL(10,2),
    streak VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(espn_id, league_id)
);

-- Players and Stats
CREATE TABLE players (
    id SERIAL PRIMARY KEY,
    espn_id INTEGER NOT NULL,
    league_id INTEGER NOT NULL REFERENCES leagues(id),
    team_id INTEGER REFERENCES teams(id),
    name VARCHAR(100),
    eligible_positions VARCHAR(50),
    roster_status VARCHAR(20),
    injury_status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(espn_id, league_id)
);

CREATE TABLE weekly_stats (
    id SERIAL PRIMARY KEY,
    player_id INTEGER NOT NULL REFERENCES players(id),
    league_id INTEGER NOT NULL REFERENCES leagues(id),
    week INTEGER NOT NULL,
    position VARCHAR(50),
    projected_points DECIMAL(10,2),
    points_scored DECIMAL(10,2),
    passing_yards INTEGER,
    rushing_yards INTEGER,
    receiving_yards INTEGER,
    touchdowns INTEGER,
    receptions INTEGER,
    interceptions INTEGER,
    position_rank INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE overall_stats (
    id SERIAL PRIMARY KEY,
    player_id INTEGER NOT NULL REFERENCES players(id),
    league_id INTEGER NOT NULL REFERENCES leagues(id),
    season INTEGER NOT NULL,
    position_rank INTEGER,
    total_points DECIMAL(10,2),
    total_projected_points DECIMAL(10,2),
    average_points DECIMAL(10,2),
    last_week_points DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trending and Analysis
CREATE TABLE trending_stats (
    id SERIAL PRIMARY KEY,
    player_id INTEGER NOT NULL REFERENCES players(id),
    league_id INTEGER NOT NULL REFERENCES leagues(id),
    computed_date DATE NOT NULL,
    trend_period VARCHAR(20),
    trending_direction VARCHAR(10),
    points_trend DECIMAL(10,2),
    usage_trend DECIMAL(10,2),
    snap_count_trend INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE proposed_trades (
    id SERIAL PRIMARY KEY,
    league_id INTEGER NOT NULL REFERENCES leagues(id),
    proposer_team_id INTEGER NOT NULL REFERENCES teams(id),
    trade_details JSONB,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE trade_analysis (
    id SERIAL PRIMARY KEY,
    trade_id INTEGER NOT NULL REFERENCES proposed_trades(id),
    analysis_text TEXT,
    metrics JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Additional tables
CREATE TABLE roster_history (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id),
    team_id INTEGER REFERENCES teams(id),
    action VARCHAR(50),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE league_settings (
    id SERIAL PRIMARY KEY,
    league_id INTEGER REFERENCES leagues(id),
    scoring_type VARCHAR(50),
    roster_positions JSONB,
    playoff_teams INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_players_league_team ON players(league_id, team_id);
CREATE INDEX idx_weekly_stats_league_week ON weekly_stats(league_id, week);
CREATE INDEX idx_weekly_stats_player_week ON weekly_stats(player_id, week);
CREATE INDEX idx_trending_stats_date ON trending_stats(computed_date);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_stats_updated_at
    BEFORE UPDATE ON weekly_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_overall_stats_updated_at
    BEFORE UPDATE ON overall_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposed_trades_updated_at
    BEFORE UPDATE ON proposed_trades
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trade_analysis_updated_at
    BEFORE UPDATE ON trade_analysis
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_league_settings_updated_at
    BEFORE UPDATE ON league_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 