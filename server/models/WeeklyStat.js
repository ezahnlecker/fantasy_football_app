import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const WeeklyStat = sequelize.define('WeeklyStat', {
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
    week: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    position: {
        type: DataTypes.STRING(50)
    },
    projected_points: {
        type: DataTypes.DECIMAL(10,2)
    },
    points_scored: {
        type: DataTypes.DECIMAL(10,2)
    },
    passing_yards: {
        type: DataTypes.INTEGER
    },
    rushing_yards: {
        type: DataTypes.INTEGER
    },
    receiving_yards: {
        type: DataTypes.INTEGER
    },
    touchdowns: {
        type: DataTypes.INTEGER
    },
    receptions: {
        type: DataTypes.INTEGER
    },
    interceptions: {
        type: DataTypes.INTEGER
    },
    position_rank: {
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
    tableName: 'weekly_stats',
    timestamps: false,
    indexes: [
        {
            fields: ['league_id', 'week']
        },
        {
            fields: ['player_id', 'week']
        }
    ]
});

export default WeeklyStat; 