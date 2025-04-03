export interface PlayerData {
  name: string;
  sector: string;
  region: string;
  gender: "Male" | "Female";
}

export interface Question {
  id: number;
  descricao: string;
  opcoes: string[];
  resposta_correta: number;
}

export interface GameData {
  player: PlayerData;
  questions: Question[];
  score?: number;
  currentLevel?: number;
}
