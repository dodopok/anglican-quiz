
export interface Scores {
  catholic: number; // Red
  liberal: number;  // Yellow
  protestant: number; // Blue
}

export interface AnswerOption {
  text: string;
  scores: Scores;
}

export interface Question {
  id: number;
  text: string;
  options: AnswerOption[];
}

export interface TitleDescriptor {
  scoreMin: number;
  scoreMax: number;
  title: string;
}

export interface TitleCategory {
  catholic: TitleDescriptor[];
  liberal: TitleDescriptor[];
  protestant: TitleDescriptor[];
}

export interface HistoricalFigure {
    name: string;
    explanation: string;
}
