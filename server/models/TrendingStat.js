import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const TrendingStat = sequelize.define('TrendingStat', {
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
    computed_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    trend_period: {
        type: DataTypes.STRING(20)
    },
    trending_direction: {
        type: DataTypes.STRING(10)
    },
    points_trend: {
        type: DataTypes.DECIMAL(10,2)
    },
    usage_trend: {
        type: DataTypes.DECIMAL(10,2)
    },
    snap_count_trend: {
        type: DataTypes.INTEGER
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'trending_stats',
    timestamps: false,
    indexes: [
        {
            fields: ['computed_date']
        }
    ]
});

export default TrendingStat; 