export interface GameEvents {
  PLAYER_HURT: string;
  PLAYER_DEATH: string;
  ENEMY_DEATH: string;
  ITEM_COLLECTED: string;
  QUESTION_ANSWERED: string;
  LEVEL_COMPLETE: string;
  GAME_OVER: string;
}

export const EVENTS: GameEvents = {
  PLAYER_HURT: "player-hurt",
  PLAYER_DEATH: "player-death",
  ENEMY_DEATH: "enemy-death",
  ITEM_COLLECTED: "item-collected",
  QUESTION_ANSWERED: "question-answered",
  LEVEL_COMPLETE: "level-complete",
  GAME_OVER: "game-over",
};
