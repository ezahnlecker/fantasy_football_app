import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Roster = sequelize.define('Roster', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  teamId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  leagueId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  week: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  seasonId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  rosterData: {
    type: DataTypes.JSON,
    allowNull: false
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['teamId', 'leagueId', 'week', 'seasonId']
    }
  ]
});

export default Roster; 