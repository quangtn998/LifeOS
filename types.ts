// Base User
export interface UserProfile {
  id: string;
  email?: string;
}

// Vision -> Life Compass
export interface RoleModel {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  emulate: string;
  avoid: string;
  editing?: boolean;
}

export interface BecomingProfile {
  id: string;
  who: string;
  url: string;
  traits: string;
  sacrifices: string;
  editing?: boolean;
}

export interface ImportantThing {
  id: string;
  title: string;
  details: string;
  editing?: boolean;
}

export interface Principle {
  id: string;
  title: string;
  details: string;
  editing?: boolean;
}

export interface LifeCompassData {
  user_id?: string;
  eulogy: string;
  bucketList: string;
  mission: string;
  success: string;
  roleModels: RoleModel[];
  becoming: BecomingProfile[];
  importantThings: ImportantThing[];
  principles: Principle[];
}

// Vision -> Future Sketch
export interface VisionBoardImage {
  id: string;
  url: string;
  caption: string;
}

export interface FutureSketchData {
  user_id?: string;
  threeYearDream: string;
  odysseyPlan: string;
  visionBoard: VisionBoardImage[];
  futureCalendar: string;
}

// Vision -> Quarterly Quests
export interface Quest {
  id: string;
  user_id: string;
  type: 'main' | 'side';
  category: 'work' | 'life';
  title: string;
  completed: boolean;
  created_at: string;
  editing?: boolean;
}

// Action -> Focus Timer
export interface CustomTool {
  id: string;
  text: string;
}

export interface FocusSessionStats {
  disruptors: {
    procrastination: number;
    distraction: number;
    burnout: number;
    perfectionism: number;
  };
  toolkit: Record<string, number>;
  recharge: Record<string, number>;
}

export interface FocusLogData {
    [date: string]: number; // date (YYYY-MM-DD): total minutes
}

// Action -> Daily Plan
export interface DailyTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface DailyPlan {
  id?: string;
  user_id?: string;
  date: string; // YYYY-MM-DD
  manifesto: {
    feeling: string;
    gratitude: string;
    adventure: string;
  };
  tasks: DailyTask[];
  shutdown: {
    accomplished: string;
    learned: string;
    tomorrow: string;
  };
}


// Action -> Weekly Plan
export interface IdealBlock {
    id: string;
    day: number; // 0 for Sunday, 1 for Monday...
    startTime: number; // 0-23
    endTime: number; // 1-24
    title: string;
    color: string;
}
  
export interface WeeklyReviewData {
    id?: string;
    user_id?: string;
    week_start_date: string; // YYYY-MM-DD
    wins: string;
    challenges: string;
    nextWeekPriorities: DailyTask[];
    quests_status: string;
    plan_adjustments: string;
}

export interface CalendarEvent {
    summary: string;
    start: string;
    end: string;
    description?: string;
}
