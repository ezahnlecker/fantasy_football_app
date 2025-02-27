import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ESPNCredentials = sequelize.define('ESPNCredentials', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    espn_s2: {
        type: DataTypes.STRING(255)
    },
    swid: {
        type: DataTypes.STRING(255)
    },
    last_updated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'espn_credentials',
    timestamps: false
});

export default ESPNCredentials; 