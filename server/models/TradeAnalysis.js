import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const TradeAnalysis = sequelize.define('TradeAnalysis', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    trade_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    analysis_text: {
        type: DataTypes.TEXT
    },
    metrics: {
        type: DataTypes.JSONB
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
    tableName: 'trade_analysis',
    timestamps: false
});

export default TradeAnalysis; 