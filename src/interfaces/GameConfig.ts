import { GameData, PlayerData } from "./GameData";

export interface GameConfig extends Phaser.Types.Core.GameConfig {
  playerData?: PlayerData;
  gameData?: GameData;
}

export interface SceneConfig extends Phaser.Types.Scenes.SettingsConfig {
  key: string;
  active?: boolean;
  visible?: boolean;
  data?: GameData;
}
