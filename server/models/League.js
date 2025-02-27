import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const League = sequelize.define('League', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    espn_id: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    season: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(100)
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'leagues',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['espn_id', 'season', 'user_id']
        }
    ]
});

export default League; 