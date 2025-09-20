export interface Race {
  id: string;
  name: string;
  sizeId: string;
  stats: Record<string, number>;
  averageHeight: { male: number; female: number };
  averageWeight: { male: number; female: number };
  strideBonus: number;
  [key: string]: any;
}
