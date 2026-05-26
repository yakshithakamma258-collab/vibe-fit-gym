import { TrainingClass, BookingItem, UserProfile } from './types';

export const INITIAL_USER: UserProfile = {
  name: 'Gym Member',
  email: 'member@vibefit.com',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200&h=200',
  streakDays: 5,
  caloriesBurned: 420,
  age: 25,
  weight: 150, // in lbs
  height: 175, // in cm
  gender: 'Female',
  fitnessGoals: ['General Health', 'Endurance'],
  notificationsEnabled: true,
  biometricLogin: false,
  syncHealth: true,
};

export const AVAILABLE_CLASSES: TrainingClass[] = [
  {
    id: 'class_1',
    name: 'Strength Training',
    intensity: 'ELITE MORNING',
    time: '7:00 AM - 8:30 AM',
    duration: '90 mins',
    trainerName: 'Marcus Vance',
    trainerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200',
    category: 'Strength',
    slotsLeft: 8,
    totalSlots: 15,
  },
  {
    id: 'class_2',
    name: 'Vinyasa Yoga',
    intensity: 'ZEN FLOW',
    time: '6:00 PM - 7:00 PM',
    duration: '60 mins',
    trainerName: 'Elena Rostova',
    trainerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200',
    category: 'Yoga',
    slotsLeft: 4,
    totalSlots: 10,
  },
  {
    id: 'class_3',
    name: 'HIIT Session',
    intensity: 'INTENSE',
    time: '8:00 PM - 9:00 PM',
    duration: '60 mins',
    trainerName: 'David Mercer',
    trainerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200&h=200',
    category: 'HIIT',
    slotsLeft: 14,
    totalSlots: 20,
  },
  {
    id: 'class_4',
    name: 'Powerlifting Core',
    intensity: 'ELITE MORNING',
    time: '9:30 AM - 11:00 AM',
    duration: '90 mins',
    trainerName: 'Marcus Vance',
    trainerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200',
    category: 'Strength',
    slotsLeft: 1,
    totalSlots: 12,
  },
  {
    id: 'class_5',
    name: 'Ashtanga Restore',
    intensity: 'ZEN FLOW',
    time: '4:30 PM - 5:30 PM',
    duration: '60 mins',
    trainerName: 'Elena Rostova',
    trainerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200',
    category: 'Yoga',
    slotsLeft: 7,
    totalSlots: 12,
  }
];

export const INITIAL_BOOKINGS: BookingItem[] = [
  {
    id: 'booking_1',
    className: 'Calisthenics Basics',
    date: 'Friday, Oct 11',
    time: '8:00 AM - 9:15 AM',
    trainerName: 'David Mercer',
    status: 'Completed',
    timestamp: 'Oct 11, 2026, 09:15',
    intensity: 'METABOLIC',
  },
  {
    id: 'booking_2',
    className: 'Deep Core Yoga',
    date: 'Saturday, Oct 12',
    time: '10:00 AM - 11:00 AM',
    trainerName: 'Elena Rostova',
    status: 'Completed',
    timestamp: 'Oct 12, 2026, 11:00',
    intensity: 'ZEN FLOW',
  },
  {
    id: 'booking_3',
    className: 'Iron Core Deadlift',
    date: 'Sunday, Oct 13',
    time: '2:00 PM - 3:30 PM',
    trainerName: 'Marcus Vance',
    status: 'Cancelled',
    timestamp: 'Oct 13, 2026, 12:45', // Cancelled time
    intensity: 'ELITE MORNING',
  },
  {
    id: 'booking_4',
    className: 'Metabolic Conditioning',
    date: 'Monday, Oct 14',
    time: '5:00 PM - 6:00 PM',
    trainerName: 'David Mercer',
    status: 'Completed',
    timestamp: 'Oct 14, 2026, 18:00',
    intensity: 'INTENSE',
  }
];

export const DAILY_TIPS = [
  "Hydration is key to muscle recovery. Drink 500ml now.",
  "Never skip warm-up; 5 mins of movement keeps joints lubricated.",
  "Focus on time-under-tension for better muscle fiber activation.",
  "Deep diaphragmatic breathing lowers heart rate post-workout.",
  "Consistency beats intensity. 30 mins daily wins the long game.",
  "Active recovery days prevent overtraining and build overall strength."
];
