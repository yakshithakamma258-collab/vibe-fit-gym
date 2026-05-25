export type ClassCategory = 'All' | 'Strength' | 'Yoga' | 'HIIT';

export type BookingStatus = 'Completed' | 'Upcoming' | 'Cancelled';

export type TrainingClass = {
  id: string;
  name: string;
  intensity: 'ELITE MORNING' | 'ZEN FLOW' | 'INTENSE' | 'METABOLIC';
  time: string;
  duration: string;
  trainerName: string;
  trainerAvatar: string;
  category: 'Strength' | 'Yoga' | 'HIIT';
  slotsLeft: number;
  totalSlots: number;
};

export type BookingItem = {
  id: string;
  className: string;
  date: string; // e.g. "Monday, Oct 14"
  time: string; // e.g. "7:00 AM - 8:30 AM"
  trainerName: string;
  status: BookingStatus;
  timestamp: string; // e.g., "Oct 24, 2026, 17:02"
  intensity: 'ELITE MORNING' | 'ZEN FLOW' | 'INTENSE' | 'METABOLIC';
};

export type UserProfile = {
  name: string;
  email: string;
  avatar: string;
  streakDays: number;
  caloriesBurned: number;
  age?: number;
  weight?: number; // can support both lbs/kg or simple number
  height?: number; // cm
  gender?: string;
  fitnessGoals?: string[];
  notificationsEnabled?: boolean;
  biometricLogin?: boolean;
  syncHealth?: boolean;
  role?: 'member' | 'admin';
};

export type ActiveTab = 'Home' | 'Bookings' | 'History' | 'Profile';
