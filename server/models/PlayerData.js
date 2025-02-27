import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PlayerData = sequelize.define('PlayerData', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  espnId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  leagueId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  seasonId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  week: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  position: DataTypes.STRING,
  team: DataTypes.STRING,
  teamId: DataTypes.INTEGER,
  status: DataTypes.STRING,
  injuryStatus: DataTypes.STRING,
  projectedPoints: DataTypes.FLOAT,
  actualPoints: DataTypes.FLOAT,
  lineupSlot: DataTypes.STRING,
  opponent: DataTypes.STRING,
  opponentRank: DataTypes.INTEGER,
  photoUrl: DataTypes.STRING,
  isRostered: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  rosteredTeamId: DataTypes.INTEGER,
  lastUpdated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['espnId', 'leagueId', 'seasonId', 'week']
    },
    {
      fields: ['position']
    },
    {
      fields: ['team']
    },
    {
      fields: ['isRostered']
    },
    {
      fields: ['lastUpdated']
    }
  ]
});

export default PlayerData; 