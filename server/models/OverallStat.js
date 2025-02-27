import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const OverallStat = sequelize.define('OverallStat', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    player_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    league_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    season: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    position_rank: {
        type: DataTypes.INTEGER
    },
    total_points: {
        type: DataTypes.DECIMAL(10,2)
    },
    total_projected_points: {
        type: DataTypes.DECIMAL(10,2)
    },
    average_points: {
        type: DataTypes.DECIMAL(10,2)
    },
    last_week_points: {
        type: DataTypes.DECIMAL(10,2)
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
    tableName: 'overall_stats',
    timestamps: false
});

export default OverallStat; 