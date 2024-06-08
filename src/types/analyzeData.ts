export type AnalyzeData = {
  area: string;
  predictions: {
    bbox: number[];
    class: string;
    score: number;
  };
  trackedObjects: string[];
};
