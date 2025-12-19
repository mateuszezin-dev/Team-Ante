
export type IconType = 'sword' | 'shield' | 'potion' | 'target' | 'cross' | 'y' | 'none';

export type CellSize = 'large' | 'small';

export interface GridCell {
  id: string;
  imageUrl?: string;
  stickerTl?: string;
  stickerTr?: string;
  stickerBl?: string;
  stickerBr?: string;
  linkUrl?: string;
  icon?: IconType;
  iconColor?: string;
  size: CellSize;
  isCrossedOut?: boolean;
}

export interface QuadrantState {
  id: string;
  title: string;
  rows: number;
  columns: number;
  cells: Record<string, GridCell>;
}

export interface AppState {
  quadrants: QuadrantState[];
  password?: string;
}
