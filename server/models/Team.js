import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Team = sequelize.define('Team', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    espn_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    league_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    rank: {
        type: DataTypes.INTEGER
    },
    wins: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    losses: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    ties: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    points_for: {
        type: DataTypes.DECIMAL(10,2),
        defaultValue: 0
    },
    points_against: {
        type: DataTypes.DECIMAL(10,2),
        defaultValue: 0
    },
    streak: {
        type: DataTypes.STRING(20)
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'teams',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['espn_id', 'league_id']
        }
    ]
});

export default Team; 