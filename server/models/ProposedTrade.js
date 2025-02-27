import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ProposedTrade = sequelize.define('ProposedTrade', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    league_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    proposer_team_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    trade_details: {
        type: DataTypes.JSONB
    },
    status: {
        type: DataTypes.STRING(20),
        defaultValue: 'pending'
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
    tableName: 'proposed_trades',
    timestamps: false
});

export default ProposedTrade; 