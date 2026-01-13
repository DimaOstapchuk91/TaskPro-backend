export interface Task {
  id: number;
  column_id: number;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low' | 'Without';
  deadline: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export type TaskInput = Omit<
  Task,
  'updated_at' | 'created_at' | 'id' | 'column_id'
>;

export interface MoveTaskData {
  sourceColumnId: number;
  destinationColumnId: number;
  oldPosition: number;
  newPosition: number;
}
