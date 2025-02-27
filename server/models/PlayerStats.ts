import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../database';

class PlayerStats extends Model {
  public id!: number;
  public playerId!: string;
  public name!: string;
  public team!: string;
  public position!: string;
  public totalPoints!: number;
  public lastGamePoints!: number;
  public weeklyPoints!: Record<string, number>; // Stored as JSON
  public rank!: number;
  public positionRank!: number;
  public lastUpdated!: Date;
}

PlayerStats.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  playerId: {
    type: DataTypes.STRING,
    unique: true
  },
  name: DataTypes.STRING,
  team: DataTypes.STRING,
  position: DataTypes.STRING,
  totalPoints: DataTypes.FLOAT,
  lastGamePoints: DataTypes.FLOAT,
  weeklyPoints: DataTypes.JSON, // Store points by week: { "1": 10.5, "2": 15.2, ... }
  rank: DataTypes.INTEGER,
  positionRank: DataTypes.INTEGER,
  lastUpdated: DataTypes.DATE
}, {
  sequelize,
  modelName: 'PlayerStats'
});

export default PlayerStats; 