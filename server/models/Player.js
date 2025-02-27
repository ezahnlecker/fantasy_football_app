import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Player = sequelize.define('Player', {
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
    team_id: {
        type: DataTypes.INTEGER,
        allowNull: true // null means free agent
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    eligible_positions: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    roster_status: {
        type: DataTypes.STRING(20)
    },
    injury_status: {
        type: DataTypes.STRING(50)
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'players',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['espn_id', 'league_id']
        },
        {
            fields: ['league_id', 'team_id']
        }
    ]
});

export default Player; 