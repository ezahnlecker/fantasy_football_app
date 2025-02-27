import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const LeagueSettings = sequelize.define('LeagueSettings', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    league_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'leagues',
            key: 'id'
        }
    },
    scoring_type: {
        type: DataTypes.STRING(50)
    },
    roster_positions: {
        type: DataTypes.JSONB
    },
    playoff_teams: {
        type: DataTypes.INTEGER
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'league_settings',
    timestamps: false
});

export default LeagueSettings; 