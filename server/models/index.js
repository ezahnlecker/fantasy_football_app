import User from './User.js';
import ESPNCredentials from './ESPNCredentials.js';
import League from './League.js';
import Team from './Team.js';
import Player from './Player.js';
import WeeklyStat from './WeeklyStat.js';
import OverallStat from './OverallStat.js';
import TrendingStat from './TrendingStat.js';
import ProposedTrade from './ProposedTrade.js';
import TradeAnalysis from './TradeAnalysis.js';
import RosterHistory from './RosterHistory.js';
import LeagueSettings from './LeagueSettings.js';

// User relationships
User.hasOne(ESPNCredentials, { foreignKey: 'user_id' });
User.hasMany(League, { foreignKey: 'user_id' });

// League relationships
League.belongsTo(User, { foreignKey: 'user_id' });
League.hasMany(Team, { foreignKey: 'league_id' });
League.hasOne(LeagueSettings, { foreignKey: 'league_id' });
League.hasMany(Player, { foreignKey: 'league_id' });
League.hasMany(ProposedTrade, { foreignKey: 'league_id' });

// Team relationships
Team.belongsTo(League, { foreignKey: 'league_id' });
Team.hasMany(Player, { foreignKey: 'team_id' });
Team.hasMany(ProposedTrade, { foreignKey: 'proposer_team_id' });
Team.hasMany(RosterHistory, { foreignKey: 'team_id' });

// Player relationships
Player.belongsTo(League, { foreignKey: 'league_id' });
Player.belongsTo(Team, { foreignKey: 'team_id' });
Player.hasMany(WeeklyStat, { foreignKey: 'player_id' });
Player.hasMany(OverallStat, { foreignKey: 'player_id' });
Player.hasMany(TrendingStat, { foreignKey: 'player_id' });
Player.hasMany(RosterHistory, { foreignKey: 'player_id' });

// Stats relationships
WeeklyStat.belongsTo(Player, { foreignKey: 'player_id' });
WeeklyStat.belongsTo(League, { foreignKey: 'league_id' });

OverallStat.belongsTo(Player, { foreignKey: 'player_id' });
OverallStat.belongsTo(League, { foreignKey: 'league_id' });

TrendingStat.belongsTo(Player, { foreignKey: 'player_id' });
TrendingStat.belongsTo(League, { foreignKey: 'league_id' });

// Trade relationships
ProposedTrade.belongsTo(League, { foreignKey: 'league_id' });
ProposedTrade.belongsTo(Team, { foreignKey: 'proposer_team_id' });
ProposedTrade.hasOne(TradeAnalysis, { foreignKey: 'trade_id' });

TradeAnalysis.belongsTo(ProposedTrade, { foreignKey: 'trade_id' });

// Settings relationship
LeagueSettings.belongsTo(League, { foreignKey: 'league_id' });

// Credentials relationship
ESPNCredentials.belongsTo(User, { foreignKey: 'user_id' });

export {
    User,
    ESPNCredentials,
    League,
    Team,
    Player,
    WeeklyStat,
    OverallStat,
    TrendingStat,
    ProposedTrade,
    TradeAnalysis,
    RosterHistory,
    LeagueSettings
}; 