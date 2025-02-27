import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const RosterHistory = sequelize.define('RosterHistory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    player_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'players',
            key: 'id'
        }
    },
    team_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'teams',
            key: 'id'
        }
    },
    action: {
        type: DataTypes.STRING(50)
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'roster_history',
    timestamps: false
});

export default RosterHistory; 