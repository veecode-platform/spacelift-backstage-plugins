export type StackState =
  | 'APPLYING'
  | 'CONFIRMED'
  | 'DESTROYING'
  | 'DISCARDED'
  | 'FAILED'
  | 'FINISHED'
  | 'INITIALIZING'
  | 'NONE'
  | 'PLANNING'
  | 'PREPARING'
  | 'PREPARING_APPLY'
  | 'PREPARING_REPLAN'
  | 'REPLAN_REQUESTED'
  | 'STOPPED'
  | 'UNCONFIRMED';

export type Stack = {
  id: string;
  name: string;
  description?: string | null;
  labels: string[];
  state: StackState;
  branch: string;
  spaceDetails: {
    id: string;
    name: string;
  };
};

export type TriggerRunResponse = {
  id: string;
  state: string;
};
