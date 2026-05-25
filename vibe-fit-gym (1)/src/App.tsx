import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Dumbbell, 
  Calendar as CalendarIcon, 
  User, 
  Search, 
  Lock, 
  Mail, 
  Flame, 
  Droplet, 
  Bell, 
  Eye, 
  EyeOff, 
  Plus, 
  ChevronRight, 
  Check, 
  X, 
  Shield, 
  RefreshCw, 
  Smartphone, 
  Heart, 
  TrendingUp, 
  Sparkles, 
  Award,
  SmartphoneCharging,
  Edit2,
  Database,
  Trash2,
  Server,
  Terminal,
  Settings,
  CreditCard
} from 'lucide-react';


import { ClassCategory, BookingStatus, TrainingClass, BookingItem, UserProfile, ActiveTab } from './types';
import { INITIAL_BOOKINGS, INITIAL_USER, DAILY_TIPS } from './data';
import heroBanner from './assets/images/vibefit_hero_banner_1779642255743.png';
import spotlightImg from './assets/images/vibefit_reconstruction_spotlight_1779642286333.png';

export default function App() {
  // Simulated MongoDB Collection States
  const [mongoTrainers, setMongoTrainers] = useState<TrainingClass[]>(() => {
    const saved = localStorage.getItem('mongodb_trainers');
    return saved ? JSON.parse(saved) : [];
  });

  const [mongoUsers, setMongoUsers] = useState<any[]>(() => {
    const saved = localStorage.getItem('mongodb_users');
    let parsed = saved ? JSON.parse(saved) : [];
    
    // Completely remove the default 'admin@vibe.fit' legacy account
    const filteredUsers = parsed.filter((u: any) => u.email.toLowerCase() !== 'admin@vibe.fit');
    if (filteredUsers.length !== parsed.length) {
      localStorage.setItem('mongodb_users', JSON.stringify(filteredUsers));
    }
    
    return filteredUsers;
  });

  const [mongoBookings, setMongoBookings] = useState<any[]>(() => {
    const saved = localStorage.getItem('mongodb_bookings');
    return saved ? JSON.parse(saved) : [];
  });

  // Flag to open or toggle the interactive Mongo DB inspector tool
  const [showMongoConsole, setShowMongoConsole] = useState<boolean>(false);

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const savedUsers = localStorage.getItem('mongodb_users');
    const uList = savedUsers ? JSON.parse(savedUsers) : [];
    if (uList.length === 0) {
      return false; // Force registration view if no members exist in our MongoDB mock database
    }
    const saved = localStorage.getItem('vibefit_is_logged_in');
    return saved === 'true';
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sign In / Sign Up tab state - default to 'signup' so user is asked to register first
  const [authTab, setAuthTab] = useState<'signin' | 'signup' | 'forgot_password'>('signup');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupAge, setSignupAge] = useState<string>('');
  const [signupWeight, setSignupWeight] = useState<string>('');
  const [signupHeight, setSignupHeight] = useState<string>('');
  const [signupGender, setSignupGender] = useState<string>('Female');
  const [signupGoals, setSignupGoals] = useState<string[]>(['General Fitness']);

  // Forgot Password States
  const [forgotPasswordStep, setForgotPasswordStep] = useState<1 | 2 | 3>(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');

  // App Global State
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'member'|'admin'>('admin');
  
  const [showAddTrainerForm, setShowAddTrainerForm] = useState(false);
  const [newTrainerName, setNewTrainerName] = useState('');
  const [newTrainerClass, setNewTrainerClass] = useState('');
  const [newTrainerCategory, setNewTrainerCategory] = useState<'All' | 'Strength' | 'Yoga' | 'HIIT'>('Strength');
  const [newTrainerTime, setNewTrainerTime] = useState('');
  const [newTrainerDuration, setNewTrainerDuration] = useState('60');
  const [newTrainerCapacity, setNewTrainerCapacity] = useState('10');
  const [newTrainerAvatar, setNewTrainerAvatar] = useState('');
  
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('vibefit_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      name: 'Gym Member',
      email: '',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200&h=200',
      streakDays: 0,
      caloriesBurned: 0,
      age: 25,
      weight: 150,
      height: 175,
      gender: 'Female',
      fitnessGoals: ['General Fitness'],
      notificationsEnabled: true,
      biometricLogin: false,
      syncHealth: false,
      role: 'member'
    };
  });

  const [bookings, setBookings] = useState<BookingItem[]>(() => {
    const saved = localStorage.getItem('vibefit_bookings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed;
      } catch (e) {}
    }
    return []; // Start clean with 0 bookings until the user creates entries
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('Home');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);

  // Filters and Search (Booking & History tab)
  const [bookingFilter, setBookingFilter] = useState<ClassCategory>('All');
  const [selectedDate, setSelectedDate] = useState<number>(15); // Tue 15 is active by default
  const [historyFilter, setHistoryFilter] = useState<BookingStatus | 'All'>('All');
  const [historySearchQuery, setHistorySearchQuery] = useState('');

  // Modals & Action feedbacks
  const [bookingClassToConfirm, setBookingClassToConfirm] = useState<TrainingClass | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Profile Edit fields temp state
  const [editName, setEditName] = useState(userProfile.name);
  const [editAge, setEditAge] = useState(userProfile.age || 26);
  const [editWeight, setEditWeight] = useState(userProfile.weight || 174);
  const [editHeight, setEditHeight] = useState(userProfile.height || 181);
  const [editGender, setEditGender] = useState(userProfile.gender || 'Male');
  const [avatarInputExpanded, setAvatarInputExpanded] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');

  // Synchronize field editing state with user profile adjustments
  useEffect(() => {
    setEditName(userProfile.name);
    setEditAge(userProfile.age || 26);
    setEditWeight(userProfile.weight || 174);
    setEditHeight(userProfile.height || 181);
    setEditGender(userProfile.gender || 'Male');
  }, [userProfile]);

  // Persists states in localStorage
  useEffect(() => {
    localStorage.setItem('vibefit_is_logged_in', String(isLoggedIn));
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('vibefit_user_profile', JSON.stringify(userProfile));
    
    // Also sync updates to the mongoUsers collection so they persist on logout
    if (userProfile.email) {
      setMongoUsers(prev => {
        let changed = false;
        const updated = prev.map(u => {
          if (u.email.toLowerCase() === userProfile.email.toLowerCase()) {
            changed = true;
            return { ...u, ...userProfile };
          }
          return u;
        });
        if (changed) {
          localStorage.setItem('mongodb_users', JSON.stringify(updated));
        }
        return updated;
      });
    }
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('vibefit_bookings', JSON.stringify(bookings));
  }, [bookings]);

  // Rotates daily tips automatically
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % DAILY_TIPS.length);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      triggerToast('Please type in both your email address and password.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Simulated MongoDB connection query: db.users.findOne({ email, password })
    const matchedUser = mongoUsers.find(
      u => u.email.toLowerCase() === cleanEmail && u.password === cleanPassword
    );

    if (matchedUser) {
      const activeProfile: UserProfile = {
        name: matchedUser.name,
        email: matchedUser.email,
        avatar: matchedUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200&h=200',
        streakDays: matchedUser.streakDays || 0,
        caloriesBurned: matchedUser.caloriesBurned || 0,
        age: matchedUser.age || 25,
        weight: matchedUser.weight || 150,
        height: matchedUser.height || 175,
        gender: matchedUser.gender || 'Female',
        fitnessGoals: matchedUser.fitnessGoals || ['General Health'],
        notificationsEnabled: true,
        biometricLogin: false,
        syncHealth: false,
        role: matchedUser.role || 'member'
      };

      // Filter bookings of only this current user in the simulated bookings collection:
      const matchedBookings = mongoBookings.filter(b => b.userEmail?.toLowerCase() === cleanEmail);
      setBookings(matchedBookings);

      setUserProfile(activeProfile);
      setIsLoggedIn(true);
      triggerToast(`Welcome back to Vibe Fit Gym, ${matchedUser.name}!`);
    } else {
      triggerToast('No registered user account found matching these credentials. Please Sign Up/Register first!');
    }
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    
    // Check if user exists
    const userExists = mongoUsers.some(u => u.email.toLowerCase() === forgotEmail.toLowerCase());
    if (userExists) {
      triggerToast(`OTP sent to ${forgotEmail}! (Mock: enter any 4 digits)`);
      setForgotPasswordStep(2);
    } else {
      triggerToast('No account found with that email.');
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotOtp.length >= 4) {
      triggerToast('OTP Verified Successfully. Please enter your new password.');
      setForgotPasswordStep(3);
    } else {
      triggerToast('Invalid OTP. Please enter 4 digits.');
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotNewPassword) return;
    
    const updatedUsers = mongoUsers.map(u => {
      if (u.email.toLowerCase() === forgotEmail.toLowerCase()) {
        return { ...u, password: forgotNewPassword };
      }
      return u;
    });
    localStorage.setItem('mongodb_users', JSON.stringify(updatedUsers));
    setMongoUsers(updatedUsers);
    
    triggerToast('Password reset! Please log in with your new password.');
    setAuthTab('signin');
    setForgotPasswordStep(1);
    setForgotEmail('');
    setForgotOtp('');
    setForgotNewPassword('');
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName || !signupEmail || !signupPassword || !signupAge || !signupWeight || !signupHeight) {
      triggerToast('Please fill out all required details: Name, Email, Password, Age, Weight, and Height.');
      return;
    }

    // Check if user already exists
    const alreadyExists = mongoUsers.some(u => u.email.toLowerCase() === signupEmail.toLowerCase());
    if (alreadyExists) {
      triggerToast('A member with this email is already registered. Please Log In instead!');
      setAuthTab('signin');
      return;
    }

    const parsedAge = parseInt(signupAge) || 25;
    const parsedWeight = parseFloat(signupWeight) || 150;
    const parsedHeight = parseFloat(signupHeight) || 175;

    // Mongo ObjectID Hexadecimal generation simulation
    const newMongoId = "60e5f" + Math.floor(1000000000 + Math.random() * 9000000000).toString(16).slice(0, 19);
    
    // Create new document for MongoDB db.users collection
    const newUserDocument = {
      _id: `ObjectId("${newMongoId}")`,
      name: signupName,
      email: signupEmail,
      password: signupPassword,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200&h=200',
      streakDays: 1, // First signup session initialized
      caloriesBurned: 150, // base calories
      age: parsedAge,
      weight: parsedWeight,
      height: parsedHeight,
      gender: signupGender,
      fitnessGoals: signupGoals.length > 0 ? signupGoals : ['General Fitness'],
      createdAt: new Date().toISOString(),
      role: 'member'
    };

    const updatedUsers = [...mongoUsers, newUserDocument];
    localStorage.setItem('mongodb_users', JSON.stringify(updatedUsers));
    setMongoUsers(updatedUsers);

    // Initializing state profile context
    const brandNewProfile: UserProfile = {
      name: signupName,
      email: signupEmail,
      avatar: newUserDocument.avatar,
      streakDays: newUserDocument.streakDays,
      caloriesBurned: newUserDocument.caloriesBurned,
      age: newUserDocument.age,
      weight: newUserDocument.weight,
      height: newUserDocument.height,
      gender: newUserDocument.gender,
      fitnessGoals: newUserDocument.fitnessGoals,
      notificationsEnabled: true,
      biometricLogin: false,
      syncHealth: false,
      role: 'member'
    };

    // New accounts have zero historical bookings initially
    setBookings([]);

    setUserProfile(brandNewProfile);
    // sync visual states
    setEmail(signupEmail);
    setPassword(signupPassword);
    setIsLoggedIn(true);
    triggerToast(`Created connection! Welcoming ${signupName} to the system.`);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab('Home');
    // optionally restore generic profile context if wanted, but preserving local storage of other metrics is great
    triggerToast('You have successfully logged out of Vibe Fit Gym.');
  };

  const handleBookClass = (trainingClass: TrainingClass) => {
    setBookingClassToConfirm(trainingClass);
  };

  const initiatePayment = () => {
    if (!bookingClassToConfirm) return;

    // Check if duplicate booking for same class ID and same status is already active
    const alreadyBooked = bookings.some(b => b.className === bookingClassToConfirm.name && b.status === 'Upcoming');
    if (alreadyBooked) {
      triggerToast(`You are already booked for ${bookingClassToConfirm.name}!`);
      setBookingClassToConfirm(null);
      return;
    }

    if (bookingClassToConfirm.slotsLeft <= 0) {
      triggerToast(`Sorry, ${bookingClassToConfirm.name} is fully booked!`);
      setBookingClassToConfirm(null);
      return;
    }

    setShowPaymentModal(true);
  };

  const processPaymentAndBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingClassToConfirm) return;

    setPaymentProcessing(true);

    try {
      // Create Payment Intent on the Server
      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 15.00, currency: 'inr' })
      });
      const data = await res.json();
      
      if (!res.ok) {
        // Fallback for prototyping without env secrets: proceed with mockup booking anyway
        console.warn('Real payment backend returned error (likely missing API key):', data.error);
        console.log('Proceeding with successful mock booking for prototype demonstration.');
      } else {
        console.log('Real payment intent created:', data.clientSecret);
        // Here you would use stripe-js confirmPayment with the clientSecret
      }

    } catch (err) {
      console.error('Payment request failed:', err);
    }

    // Simulate wait for confirmation
    setTimeout(() => {
      setPaymentProcessing(false);
      setShowPaymentModal(false);

      const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const targetDate = new Date(2026, 9, selectedDate); // October 2026

      const dateStr = `${weekdays[targetDate.getDay()]}, ${months[targetDate.getMonth()]} ${selectedDate}`;

      // Mongo ObjectID generation for booking
      const mongoBookingId = "60f4d" + Math.floor(1000000000 + Math.random() * 9000000000).toString(16).slice(0, 19);
      const bookingId = `booking_${Date.now()}`;

      // Document to insert in db.bookings simulated collection
      const newBookingDoc = {
        _id: `ObjectId("${mongoBookingId}")`,
        bookingId: bookingId,
        userEmail: userProfile.email,
        className: bookingClassToConfirm.name,
        date: dateStr,
        time: bookingClassToConfirm.time,
        trainerName: bookingClassToConfirm.trainerName,
        status: 'Upcoming',
        timestamp: `${months[new Date().getMonth()]} ${new Date().getDate()}, 2026, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}`,
        intensity: bookingClassToConfirm.intensity,
      };

      const updatedCol = [newBookingDoc, ...mongoBookings];
      localStorage.setItem('mongodb_bookings', JSON.stringify(updatedCol));
      setMongoBookings(updatedCol);

      const newBooking: BookingItem = {
        id: bookingId,
        className: bookingClassToConfirm.name,
        date: dateStr,
        time: bookingClassToConfirm.time,
        trainerName: bookingClassToConfirm.trainerName,
        status: 'Upcoming',
        timestamp: newBookingDoc.timestamp,
        intensity: bookingClassToConfirm.intensity
      };

      setBookings([newBooking, ...bookings]);
      
      // Decrement slots available
      const updatedTrainers = mongoTrainers.map(t => {
        if (t.id === bookingClassToConfirm.id || t.name === bookingClassToConfirm.name) {
          return { ...t, slotsLeft: Math.max(0, t.slotsLeft - 1) };
        }
        return t;
      });
      localStorage.setItem('mongodb_trainers', JSON.stringify(updatedTrainers));
      setMongoTrainers(updatedTrainers);

      // Increment streak simulated value slightly on schedule and update in db.users collection
      setUserProfile(prev => ({
        ...prev,
        streakDays: prev.streakDays + 1
      }));

      const updatedUsers = mongoUsers.map(u => {
        if (u.email.toLowerCase() === userProfile.email.toLowerCase()) {
          return { ...u, streakDays: (u.streakDays || 0) + 1 };
        }
        return u;
      });
      localStorage.setItem('mongodb_users', JSON.stringify(updatedUsers));
      setMongoUsers(updatedUsers);

      triggerToast(`Payment successful! Booked ${bookingClassToConfirm.name}.`);
      setBookingClassToConfirm(null);
    }, 1500);
  };

  const handleCancelBooking = (bookingId: string) => {
    const bookingToCancel = bookings.find(b => b.id === bookingId || b.bookingId === bookingId);
    
    setBookings(prevBookings =>
      prevBookings.map(b => ((b.id === bookingId || b.bookingId === bookingId) ? { ...b, status: 'Cancelled' as BookingStatus } : b))
    );

    const updatedBookingsCol = mongoBookings.map(b => b.bookingId === bookingId ? { ...b, status: 'Cancelled' } : b);
    localStorage.setItem('mongodb_bookings', JSON.stringify(updatedBookingsCol));
    setMongoBookings(updatedBookingsCol);

    if (bookingToCancel) {
      const updatedTrainers = mongoTrainers.map(t => {
        if (t.name === bookingToCancel.className) {
           return { ...t, slotsLeft: Math.min(t.totalSlots, t.slotsLeft + 1) };
        }
        return t;
      });
      localStorage.setItem('mongodb_trainers', JSON.stringify(updatedTrainers));
      setMongoTrainers(updatedTrainers);
    }

    triggerToast('Workout session booking cancelled.');
  };

  const handleCompleteBooking = (bookingId: string) => {
    setBookings(prevBookings =>
      prevBookings.map(b => (b.id === bookingId ? { ...b, status: 'Completed' as BookingStatus } : b))
    );

    const updatedBookingsCol = mongoBookings.map(b => b.bookingId === bookingId ? { ...b, status: 'Completed' } : b);
    localStorage.setItem('mongodb_bookings', JSON.stringify(updatedBookingsCol));
    setMongoBookings(updatedBookingsCol);

    // Increment stats in current user session
    setUserProfile(prev => ({
      ...prev,
      streakDays: prev.streakDays + 1,
      caloriesBurned: prev.caloriesBurned + 320
    }));

    // Save incremented stats inside db.users collection of the simulated Mongo DB
    const updatedUsers = mongoUsers.map(u => {
      if (u.email.toLowerCase() === userProfile.email.toLowerCase()) {
        return { 
          ...u, 
          streakDays: (u.streakDays || 0) + 1, 
          caloriesBurned: (u.caloriesBurned || 0) + 320 
        };
      }
      return u;
    });
    localStorage.setItem('mongodb_users', JSON.stringify(updatedUsers));
    setMongoUsers(updatedUsers);

    triggerToast('Workout Session Completed! Check your History tab for results.');
  };

  const handleAddTrainer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrainerName || !newTrainerClass || !newTrainerTime) {
       triggerToast("Please fill the trainer's core details");
       return;
    }
    const capInt = parseInt(newTrainerCapacity) || 10;
    const newTrainer: TrainingClass = {
        id: `trainer_${Date.now()}`,
        name: newTrainerClass,
        intensity: 'INTENSE',
        time: newTrainerTime,
        duration: `${newTrainerDuration} mins`,
        trainerName: newTrainerName,
        trainerAvatar: newTrainerAvatar || 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&q=80&w=200&h=200',
        category: newTrainerCategory === 'All' ? 'Strength' : newTrainerCategory,
        slotsLeft: capInt,
        totalSlots: capInt
    };
    
    const updated = [newTrainer, ...mongoTrainers];
    localStorage.setItem('mongodb_trainers', JSON.stringify(updated));
    setMongoTrainers(updated);
    
    setNewTrainerName('');
    setNewTrainerClass('');
    setNewTrainerTime('');
    setNewTrainerDuration('60');
    setNewTrainerCapacity('10');
    setNewTrainerAvatar('');
    setShowAddTrainerForm(false);
    triggerToast("Trainer Added Successfully");
  };

  const handleChangeTrainerSlots = (id: string, currentTime: string, currentDuration: string, currentTotalSlots: number) => {
    const newTime = prompt("Update Time Slot:", currentTime);
    if (newTime === null) return;
    const newDuration = prompt("Update Duration (Mins):", currentDuration.replace(' mins', ''));
    if (newDuration === null) return;
    const newCap = prompt("Update Total Capacity:", String(currentTotalSlots));
    if (newCap === null) return;
    
    const capInt = parseInt(newCap) || currentTotalSlots;
    
    const updated = mongoTrainers.map(t => {
      if (t.id === id) {
        return { 
          ...t, 
          time: newTime, 
          duration: `${newDuration} mins`, 
          slotsLeft: Math.min(t.slotsLeft, capInt), 
          totalSlots: capInt 
        };
      }
      return t;
    });
    localStorage.setItem('mongodb_trainers', JSON.stringify(updated));
    setMongoTrainers(updated);
    triggerToast("Trainer Details Updated");
  };

  const handleDeleteTrainer = (id: string) => {
    const updated = mongoTrainers.filter(t => t.id !== id);
    localStorage.setItem('mongodb_trainers', JSON.stringify(updated));
    setMongoTrainers(updated);
    triggerToast("Trainer Deleted");
  };

  const handleDropDatabase = () => {
    localStorage.removeItem('mongodb_users');
    localStorage.removeItem('mongodb_trainers');
    localStorage.removeItem('mongodb_bookings');
    localStorage.removeItem('vibefit_is_logged_in');
    localStorage.removeItem('vibefit_user_profile');
    localStorage.removeItem('vibefit_bookings');
    setMongoUsers([]);
    setMongoTrainers([]);
    setMongoBookings([]);
    setBookings([]);
    setIsLoggedIn(false);
    setUserProfile({
      name: 'Gym Member',
      email: '',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200&h=200',
      streakDays: 0,
      caloriesBurned: 0,
      age: 25,
      weight: 150,
      height: 175,
      gender: 'Female',
      fitnessGoals: ['General Fitness'],
      notificationsEnabled: true,
      biometricLogin: false,
      syncHealth: false,
    });
    setAuthTab('signup');
    setSignupName('');
    setSignupEmail('');
    setSignupPassword('');
    setEmail('');
    setPassword('');
    triggerToast('Sandbox data dropped successfully! System wiped clean.');
  };

  const handleToggleAdminRole = (userEmail: string) => {
    const updatedUsers = mongoUsers.map(u => {
      if (u.email.toLowerCase() === userEmail.toLowerCase()) {
        return { ...u, role: u.role === 'admin' ? 'member' : 'admin' } as any; 
      }
      return u;
    });
    localStorage.setItem('mongodb_users', JSON.stringify(updatedUsers));
    setMongoUsers(updatedUsers);
    triggerToast(`Role updated for ${userEmail}.`);
  };

  const handleDeleteUser = (userEmail: string) => {
    // Prevent deleting themselves or the very last admin
    if (userEmail.toLowerCase() === userProfile.email.toLowerCase()) {
      triggerToast("You cannot delete your own active account.");
      return;
    }
    
    // Check if it's the last admin
    const targetUser = mongoUsers.find(u => u.email.toLowerCase() === userEmail.toLowerCase());
    const adminCount = mongoUsers.filter(u => u.role === 'admin').length;
    if (targetUser?.role === 'admin' && adminCount <= 1) {
      triggerToast("Cannot delete the last remaining administrator account.");
      return;
    }
    
    const updatedUsers = mongoUsers.filter(u => u.email.toLowerCase() !== userEmail.toLowerCase());
    localStorage.setItem('mongodb_users', JSON.stringify(updatedUsers));
    setMongoUsers(updatedUsers);
    
    const updatedBookings = mongoBookings.filter(b => b.userEmail?.toLowerCase() !== userEmail.toLowerCase());
    localStorage.setItem('mongodb_bookings', JSON.stringify(updatedBookings));
    setMongoBookings(updatedBookings);
    
    triggerToast(`Malicious user ${userEmail} and their history removed.`);
  };

  const handleAddCustomUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserPassword) {
      triggerToast("Please provide name, email, and password.");
      return;
    }
    
    // Check if email already exists
    if (mongoUsers.some(u => u.email.toLowerCase() === newUserEmail.toLowerCase())) {
       triggerToast("Account with this email already exists!");
       return;
    }

    const randomId = "60e" + Math.floor(100000 + Math.random() * 900000).toString(16);
    const mockUser = {
      _id: `ObjectId("${randomId}")`,
      name: newUserName,
      email: newUserEmail,
      password: newUserPassword,
      streakDays: 0,
      caloriesBurned: 0,
      age: 25,
      weight: 150,
      height: 170,
      gender: "Not specified",
      fitnessGoals: ["Custom"],
      createdAt: new Date().toISOString(),
      avatar: `https://i.pravatar.cc/150?u=${randomId}`,
      role: newUserRole
    };
    
    const updated = [mockUser, ...mongoUsers];
    localStorage.setItem('mongodb_users', JSON.stringify(updated));
    setMongoUsers(updated);
    triggerToast(`Added ${newUserRole} account: ${newUserName}`);
    // Clear form
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('');
    setShowAddUserForm(false);
  };

  const handleRebook = (booking: BookingItem) => {
    const matchingClass = mongoTrainers.find(c => c.name === booking.className);
    if (matchingClass) {
      setBookingClassToConfirm(matchingClass);
    } else {
      // Mock book if exact template is found or fallback
      const mockClass: TrainingClass = {
        id: `class_mock_${Date.now()}`,
        name: booking.className,
        intensity: booking.intensity,
        time: booking.time,
        duration: '60 mins',
        trainerName: booking.trainerName,
        trainerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200',
        category: 'Strength',
        slotsLeft: 6,
        totalSlots: 12
      };
      setBookingClassToConfirm(mockClass);
    }
  };

  // Pull-to-refresh simulator
  const handlePullToRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setTipIndex((prev) => (prev + 1) % DAILY_TIPS.length);
      // Simulate streak update
      if (Math.random() > 0.6) {
        setUserProfile(prev => ({
          ...prev,
          caloriesBurned: prev.caloriesBurned + 15
        }));
        triggerToast('Gained +15 kcal active burn with live telemetry sync!');
      } else {
        triggerToast('Telemetry data refreshed. All metrics are up-to-date.');
      }
    }, 1500);
  };

  const handleSaveProfile = () => {
    setUserProfile(prev => ({
      ...prev,
      name: editName,
      age: editAge,
      weight: editWeight,
      height: editHeight,
      gender: editGender
    }));
    setIsEditingProfile(false);
    triggerToast('Personal profile and bio updated successfully!');
  };

  const handleGoalToggle = (goal: string) => {
    const goals = userProfile.fitnessGoals || [];
    let updatedGoals: string[];
    if (goals.includes(goal)) {
      updatedGoals = goals.filter(g => g !== goal);
    } else {
      updatedGoals = [...goals, goal];
    }
    setUserProfile(prev => ({
      ...prev,
      fitnessGoals: updatedGoals
    }));
    triggerToast(`Fitness Goals updated: ${goal}`);
  };

  const handleToggleSetting = (key: 'notificationsEnabled' | 'biometricLogin' | 'syncHealth') => {
    setUserProfile(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    triggerToast(`Setting updated: ${key === 'notificationsEnabled' ? 'Push Notifications' : key === 'biometricLogin' ? 'Biometrics' : 'Google Fit Sync'}`);
  };

  const handleAvatarChange = (avatarUrl: string) => {
    setUserProfile(prev => ({
      ...prev,
      avatar: avatarUrl
    }));
    setCustomAvatarUrl('');
    setAvatarInputExpanded(false);
    triggerToast('Profile avatar updated successfully!');
  };

  // Filter and search computation for History
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.className.toLowerCase().includes(historySearchQuery.toLowerCase()) || 
                          b.trainerName.toLowerCase().includes(historySearchQuery.toLowerCase());
    const matchesFilter = historyFilter === 'All' || b.status === historyFilter;
    return matchesSearch && matchesFilter;
  });

  const nextUpcomingBooking = bookings.find(b => b.status === 'Upcoming');

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans overflow-x-hidden relative flex flex-col selection:bg-[#ccff00] selection:text-black">
      {/* Immersive Ambient Glows */}
      <div className="absolute top-[-150px] left-[-150px] w-[500px] h-[500px] bg-[#ccff00] opacity-[0.08] rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[-150px] w-[600px] h-[600px] bg-[#ccff00] opacity-[0.05] rounded-full blur-[180px] pointer-events-none"></div>

      {/* Global Toast System */}
      {toastMessage && (
        <div className="fixed top-20 left-12 right-12 md:left-auto md:right-12 md:w-96 z-[9999] bg-black/95 border border-[#ccff00]/40 backdrop-blur-xl rounded-2xl p-4 shadow-2xl transition-all duration-300 transform translate-y-0 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#ccff00] neon-glow animate-pulse"></div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-200">{toastMessage}</p>
        </div>
      )}

      {/* WELCOME / LOGIN SCREEN */}
      {!isLoggedIn ? (
        <div className="flex-1 w-full min-h-screen flex flex-col md:flex-row relative">
          {/* Hero Section */}
          <div className="flex-1 min-h-[40vh] md:min-h-screen relative flex flex-col justify-end p-8 md:p-16 overflow-hidden">
            <div className="absolute inset-0 z-0">
              <img 
                src={heroBanner} 
                alt="Vibe Fit Gym Member" 
                className="w-full h-full object-cover opacity-60 scale-105 transition-transform duration-[10s] hover:scale-100"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black via-black/40 to-transparent"></div>
            </div>
            
            <div className="relative z-10 space-y-4 max-w-xl">
              <span className="text-[#ccff00] uppercase tracking-[0.3em] text-[10px] font-bold bg-[#ccff00]/10 px-3 py-1.5 rounded-full border border-[#ccff00]/20 inline-block">
                Premium Elite Gym Experience
              </span>
              <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none text-white">
                VIBE<span className="text-[#ccff00]">FIT</span><br />GYM
              </h1>
              <p className="text-zinc-300 text-sm md:text-base font-light">
                Join our premium high-energy training community. Book expert-led classes instantly, design your personalized weekly schedule, and reach your fitness goals in style.
              </p>
            </div>
          </div>

          {/* Tabbed Auth Container */}
          <div className="flex-1 flex flex-col justify-center items-center p-4 md:p-12 z-10">
            {/* Mobile Header */}
            <div className="md:hidden text-center mb-6 space-y-1">
              <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none text-white">
                VIBE<span className="text-[#ccff00]">FIT</span>
              </h1>
              <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-black">Elite Gym Connect</p>
            </div>

            <div className="w-full max-w-sm glass-card rounded-[24px] p-6 md:p-8 border border-white/15 space-y-6 bg-zinc-950/40 backdrop-blur-xl">
              
              {/* Tabs selector */}
              <div className="flex border-b border-white/10 pb-4">
                <button
                  type="button"
                  onClick={() => setAuthTab('signin')}
                  className={`flex-1 text-center pb-2 text-sm font-bold tracking-wider uppercase transition-colors ${authTab === 'signin' ? 'text-[#ccff00] border-b-2 border-[#ccff00]' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  Sign In / Log In
                </button>
                <button
                  type="button"
                  onClick={() => setAuthTab('signup')}
                  className={`flex-1 text-center pb-2 text-sm font-bold tracking-wider uppercase transition-colors ${authTab === 'signup' ? 'text-[#ccff00] border-b-2 border-[#ccff00]' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  Sign Up / Register
                </button>
              </div>

              {authTab === 'signin' && (
                // SIGN IN FORM
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h2 className="text-xl font-extrabold text-white">Welcome Back!</h2>
                    <p className="text-zinc-500 text-xs">Enter your details to log in to your active fitness account.</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Email Address</label>
                      <div className="relative flex items-center bg-black border border-white/5 rounded-2xl h-14 px-4 focus-within:border-[#ccff00] transition-colors">
                        <Mail className="text-zinc-500 w-5 h-5 mr-3 shrink-0" />
                        <input 
                          type="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your-email@gmail.com" 
                          className="bg-transparent border-none outline-none focus:ring-0 text-white placeholder:text-zinc-700 w-full text-sm font-medium"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Password</label>
                      <div className="relative flex items-center bg-black border border-white/5 rounded-2xl h-14 px-4 focus-within:border-[#ccff00] transition-colors">
                        <Lock className="text-zinc-500 w-5 h-5 mr-3 shrink-0" />
                        <input 
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••" 
                          className="bg-transparent border-none outline-none focus:ring-0 text-white placeholder:text-zinc-700 w-full text-sm font-medium"
                          required
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-zinc-500 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <button type="button" onClick={() => setAuthTab('forgot_password')} className="text-[10px] text-[#ccff00] font-bold uppercase tracking-wider hover:underline">Forgot Password?</button>
                    </div>

                    <button 
                      type="submit" 
                      className="w-full bg-[#ccff00] hover:bg-[#b0db00] text-black font-extrabold uppercase text-xs tracking-widest rounded-full h-14 neon-glow transition-all active:scale-95 duration-200 mt-6"
                    >
                      Log In & Access Gym
                    </button>
                  </form>
                </div>
              )}
              
              {authTab === 'signup' && (
                // SIGN UP / REGISTER FORM
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h2 className="text-xl font-extrabold text-white">Create New Account</h2>
                    <p className="text-zinc-500 text-xs font-medium">Enter your personal measurements and goals to customize your active workout programs.</p>
                  </div>

                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Your Full Name</label>
                      <div className="relative flex items-center bg-black border border-white/5 rounded-2xl h-14 px-4 focus-within:border-[#ccff00] transition-colors">
                        <User className="text-zinc-500 w-5 h-5 mr-3 shrink-0" />
                        <input 
                          type="text" 
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          placeholder="e.g. Alex Johnson" 
                          className="bg-transparent border-none outline-none focus:ring-0 text-white placeholder:text-zinc-700 w-full text-sm font-medium"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Email Address</label>
                      <div className="relative flex items-center bg-black border border-white/5 rounded-2xl h-14 px-4 focus-within:border-[#ccff00] transition-colors">
                        <Mail className="text-zinc-500 w-5 h-5 mr-3 shrink-0" />
                        <input 
                          type="email" 
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          placeholder="your-email@domain.com" 
                          className="bg-transparent border-none outline-none focus:ring-0 text-white placeholder:text-zinc-700 w-full text-sm font-medium"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Password</label>
                      <div className="relative flex items-center bg-black border border-white/5 rounded-2xl h-14 px-4 focus-within:border-[#ccff00] transition-colors">
                        <Lock className="text-zinc-500 w-5 h-5 mr-3 shrink-0" />
                        <input 
                          type={showPassword ? 'text' : 'password'}
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          placeholder="Set password" 
                          className="bg-transparent border-none outline-none focus:ring-0 text-white placeholder:text-zinc-700 w-full text-sm font-medium"
                          required
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-zinc-500 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Age and Gender Side-by-Side */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Age (Years)</label>
                        <div className="relative flex items-center bg-black border border-white/5 rounded-2xl h-14 px-4 focus-within:border-[#ccff00] transition-colors">
                          <input 
                            type="number" 
                            min="10"
                            max="120"
                            value={signupAge}
                            onChange={(e) => setSignupAge(e.target.value)}
                            placeholder="Age" 
                            className="bg-transparent border-none outline-none focus:ring-0 text-white placeholder:text-zinc-700 w-full text-sm font-medium"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Gender</label>
                        <div className="relative flex items-center bg-black border border-white/5 rounded-2xl h-14 px-4 focus-within:border-[#ccff00] transition-colors bg-no-repeat">
                          <select 
                            value={signupGender}
                            onChange={(e) => setSignupGender(e.target.value)}
                            className="bg-transparent border-none outline-none focus:ring-0 text-white w-full text-sm font-medium appearance-none cursor-pointer pr-4"
                            style={{ colorScheme: 'dark' }}
                          >
                            <option value="Female" className="bg-[#080808] text-white">Female</option>
                            <option value="Male" className="bg-[#080808] text-white">Male</option>
                            <option value="Non-Binary" className="bg-[#080808] text-white">Non-Binary</option>
                            <option value="Prefer not to say" className="bg-[#080808] text-white">Prefer not to say</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Weight and Height Side-by-Side */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Weight (lbs)</label>
                        <div className="relative flex items-center bg-black border border-white/5 rounded-2xl h-14 px-4 focus-within:border-[#ccff00] transition-colors">
                          <input 
                            type="number" 
                            min="30"
                            max="500"
                            value={signupWeight}
                            onChange={(e) => setSignupWeight(e.target.value)}
                            placeholder="Weight (lbs)" 
                            className="bg-transparent border-none outline-none focus:ring-0 text-white placeholder:text-zinc-700 w-full text-sm font-medium"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Height (cm)</label>
                        <div className="relative flex items-center bg-black border border-white/5 rounded-2xl h-14 px-4 focus-within:border-[#ccff00] transition-colors">
                          <input 
                            type="number" 
                            min="80"
                            max="250"
                            value={signupHeight}
                            onChange={(e) => setSignupHeight(e.target.value)}
                            placeholder="Height (cm)" 
                            className="bg-transparent border-none outline-none focus:ring-0 text-white placeholder:text-zinc-700 w-full text-sm font-medium"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Fitness Goals interactive tags */}
                    <div className="space-y-2">
                      <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold block mb-1">Your Fitness Goals</label>
                      <div className="flex flex-wrap gap-2">
                        {['Weight Loss', 'Strength Training', 'HIIT & Cardio', 'Muscle Gain', 'Yoga & Flexibility'].map((goal) => {
                          const isSelected = signupGoals.includes(goal);
                          return (
                            <button
                              key={goal}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setSignupGoals(signupGoals.filter(g => g !== goal));
                                } else {
                                  setSignupGoals([...signupGoals.filter(g => g !== 'General Fitness'), goal]);
                                }
                              }}
                              className={`px-3 py-2 rounded-xl text-[11px] font-bold transition-all border cursor-pointer ${
                                isSelected 
                                  ? 'bg-[#ccff00] text-black border-[#ccff00]' 
                                  : 'bg-zinc-950 text-zinc-400 border-zinc-850 hover:border-zinc-700'
                              }`}
                            >
                              {goal}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="w-full bg-[#ccff00] hover:bg-[#b0db00] text-black font-extrabold uppercase text-xs tracking-widest rounded-full h-14 neon-glow transition-all active:scale-95 duration-200 mt-6 cursor-pointer"
                    >
                      Sign Up & Enter Gym
                    </button>
                  </form>
                </div>
              )}

              {authTab === 'forgot_password' && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h2 className="text-xl font-extrabold text-white">Reset Password</h2>
                    <p className="text-zinc-500 text-xs">Follow the steps to regain access to your account.</p>
                  </div>

                  {forgotPasswordStep === 1 && (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Email Address</label>
                        <div className="relative flex items-center bg-black border border-white/5 rounded-2xl h-14 px-4 focus-within:border-[#ccff00] transition-colors">
                          <Mail className="text-zinc-500 w-5 h-5 mr-3 shrink-0" />
                          <input 
                            type="email" 
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            placeholder="your-email@gmail.com" 
                            className="bg-transparent border-none outline-none focus:ring-0 text-white placeholder:text-zinc-700 w-full text-sm font-medium"
                            required
                          />
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        className="w-full bg-[#ccff00] hover:bg-[#b0db00] text-black font-extrabold uppercase text-xs tracking-widest rounded-full h-14 neon-glow transition-all active:scale-95 duration-200 mt-6"
                      >
                        Send OTP
                      </button>
                    </form>
                  )}

                  {forgotPasswordStep === 2 && (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Enter 4-Digit OTP</label>
                        <div className="relative flex items-center bg-black border border-white/5 rounded-2xl h-14 px-4 focus-within:border-[#ccff00] transition-colors">
                          <Shield className="text-zinc-500 w-5 h-5 mr-3 shrink-0" />
                          <input 
                            type="text" 
                            value={forgotOtp}
                            onChange={(e) => setForgotOtp(e.target.value)}
                            placeholder="e.g. 1234" 
                            maxLength={4}
                            className="bg-transparent border-none outline-none focus:ring-0 text-white placeholder:text-zinc-700 w-full text-sm font-medium tracking-widest font-mono"
                            required
                          />
                        </div>
                        <p className="text-[9px] text-[#ccff00]/60 mt-1">Hint: Type any 4 digits in this sandbox environment.</p>
                      </div>

                      <button 
                        type="submit" 
                        className="w-full bg-[#ccff00] hover:bg-[#b0db00] text-black font-extrabold uppercase text-xs tracking-widest rounded-full h-14 neon-glow transition-all active:scale-95 duration-200 mt-6"
                      >
                        Verify OTP
                      </button>
                    </form>
                  )}

                  {forgotPasswordStep === 3 && (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                       <div className="space-y-1">
                        <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">New Password</label>
                        <div className="relative flex items-center bg-black border border-white/5 rounded-2xl h-14 px-4 focus-within:border-[#ccff00] transition-colors">
                          <Lock className="text-zinc-500 w-5 h-5 mr-3 shrink-0" />
                          <input 
                            type={showPassword ? 'text' : 'password'}
                            value={forgotNewPassword}
                            onChange={(e) => setForgotNewPassword(e.target.value)}
                            placeholder="Set a new password" 
                            className="bg-transparent border-none outline-none focus:ring-0 text-white placeholder:text-zinc-700 w-full text-sm font-medium"
                            required
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-zinc-500 hover:text-white"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        className="w-full bg-[#ccff00] hover:bg-[#b0db00] text-black font-extrabold uppercase text-xs tracking-widest rounded-full h-14 neon-glow transition-all active:scale-95 duration-200 mt-6"
                      >
                        Update Password
                      </button>
                    </form>
                  )}

                  <div className="text-center mt-4">
                    <button type="button" onClick={() => { setAuthTab('signin'); setForgotPasswordStep(1); }} className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider hover:text-white transition-colors">
                      Back to Sign In
                    </button>
                  </div>
                </div>
              )}

              <p className="text-center text-[10px] text-zinc-600 leading-normal">
                By entering Vibe Fit Gym, you can view schedules, manage your bookings, and design personalized fit metrics safely.
              </p>
            </div>
          </div>
        </div>
      ) : userProfile.role === 'admin' ? (
        /* ADMIN DASHBOARD */
        <div className="flex-1 flex flex-col min-h-screen">
          <header className="p-8 flex justify-between items-center shrink-0 border-b border-white/5 bg-[#080808]/95 sticky top-0 z-40 backdrop-blur-xl">
            <div>
              <p className="text-[#ccff00] uppercase tracking-[0.3em] text-[10px] font-bold mb-1">System Administration</p>
              <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white">VIBE<span className="text-[#ccff00]">FIT</span> ADMIN</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowMongoConsole(true)}
                className="text-[10px] uppercase tracking-widest font-black text-[#ccff00] hover:text-black px-4 py-2 border border-[#ccff00]/30 rounded-xl hover:bg-[#ccff00] hover:border-[#ccff00] transition-colors cursor-pointer flex items-center gap-2"
              >
                <Database className="w-3 h-3" />
                Inspect Storage
              </button>
              <div className="flex items-center gap-3 bg-white/5 py-1.5 pl-3 pr-2 rounded-full border border-white/10">
                <Shield className="w-4 h-4 text-[#ccff00]" />
                <span className="text-xs font-bold text-white">{userProfile.name}</span>
                <img 
                  src={userProfile.avatar} 
                  alt="Admin" 
                  className="w-8 h-8 rounded-full border border-[#ccff00]/40 object-cover"
                />
              </div>
              <button
                onClick={handleLogout}
                className="text-[10px] uppercase tracking-widest font-black text-zinc-400 hover:text-black px-4 py-2 border border-white/10 rounded-xl hover:bg-[#ccff00] hover:border-[#ccff00] transition-colors cursor-pointer"
              >
                Log Out
              </button>
            </div>
          </header>

          <main className="flex-1 p-8 max-w-6xl mx-auto w-full space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-black border border-white/5 p-6 rounded-[24px] space-y-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#ccff00]">Total Members</span>
                <h3 className="text-4xl font-black">{mongoUsers.length}</h3>
                <p className="text-xs text-zinc-500">Registered users in the system</p>
              </div>

              <div className="bg-black border border-white/5 p-6 rounded-[24px] space-y-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-fuchsia-400">Total Bookings</span>
                <h3 className="text-4xl font-black">{mongoBookings.length}</h3>
                <p className="text-xs text-zinc-500">Scheduled workout sessions</p>
              </div>

              <div className="bg-black border border-white/5 p-6 rounded-[24px] space-y-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400">Estimated Revenue</span>
                <h3 className="text-4xl font-black">${mongoBookings.length * 15}</h3>
                <p className="text-xs text-zinc-500">Based on $15 average per booking</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Member Roster */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black italic uppercase">Member Roster</h2>
                  <button onClick={() => setShowAddUserForm(!showAddUserForm)} className="text-[#000] bg-[#ccff00] hover:bg-[#b0db00] text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-full transition-colors cursor-pointer flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add Account
                  </button>
                </div>

                {showAddUserForm && (
                  <div className="bg-[#111] border border-white/10 rounded-[24px] p-6 mb-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <h3 className="text-[#ccff00] uppercase text-[10px] font-bold tracking-widest mb-4">Create New Account</h3>
                    <form onSubmit={handleAddCustomUser} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Full Name</label>
                          <input 
                            type="text" 
                            value={newUserName}
                            onChange={(e) => setNewUserName(e.target.value)}
                            className="bg-black border border-white/5 rounded-xl h-12 px-4 text-sm text-white focus:outline-none focus:border-[#ccff00] w-full"
                            placeholder="John Doe"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Email Address</label>
                          <input 
                            type="email" 
                            value={newUserEmail}
                            onChange={(e) => setNewUserEmail(e.target.value)}
                            className="bg-black border border-white/5 rounded-xl h-12 px-4 text-sm text-white focus:outline-none focus:border-[#ccff00] w-full"
                            placeholder="user@vibe.fit"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Password</label>
                          <input 
                            type="password" 
                            value={newUserPassword}
                            onChange={(e) => setNewUserPassword(e.target.value)}
                            className="bg-black border border-white/5 rounded-xl h-12 px-4 text-sm text-white focus:outline-none focus:border-[#ccff00] w-full"
                            placeholder="••••••••"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Role Assignment</label>
                           <select 
                            value={newUserRole}
                            onChange={(e) => setNewUserRole(e.target.value as 'member'|'admin')}
                            className="bg-black border border-white/5 rounded-xl h-12 px-4 text-sm text-white focus:outline-none focus:border-[#ccff00] w-full appearance-none cursor-pointer"
                            style={{ colorScheme: 'dark' }}
                          >
                            <option value="member">Member</option>
                            <option value="admin">Administrator</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button type="submit" className="bg-[#ccff00] text-black text-[10px] uppercase font-black tracking-widest px-6 py-3 rounded-xl hover:bg-[#b0db00] transition-colors">
                          Create Account
                        </button>
                        <button type="button" onClick={() => setShowAddUserForm(false)} className="bg-transparent text-zinc-500 hover:text-white text-[10px] uppercase font-bold tracking-widest px-6 py-3 rounded-xl transition-colors">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
                <div className="bg-[#080808] border border-white/5 rounded-[24px] overflow-hidden">
                  {mongoUsers.length === 0 ? (
                    <div className="p-8 text-center text-zinc-600 text-xs uppercase tracking-widest">No members registered</div>
                  ) : (
                    <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
                      {mongoUsers.map((u, i) => (
                        <div key={i} className="p-4 hover:bg-white/5 transition-colors flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img src={u.avatar || 'https://images.unsplash.com/photo-1542317355-61266fe84605?auto=format&fit=crop&q=80&w=200&h=200'} className="w-10 h-10 rounded-full object-cover" />
                            <div>
                              <p className="text-sm font-bold">{u.name}</p>
                              <p className="text-[10px] text-zinc-500">{u.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-right">
                            <div className="hidden sm:block text-right pr-4">
                              <p className="text-xs font-bold text-[#ccff00]">{u.streakDays} Day Streak</p>
                              <p className="text-[9px] text-zinc-600 uppercase tracking-wider">
                                {u.role === 'admin' ? 'SYSTEM ADMIN' : `Goal: ${u.fitnessGoals?.[0] || 'Fitness'}`}
                              </p>
                            </div>
                            {u.email.toLowerCase() !== userProfile.email.toLowerCase() && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleToggleAdminRole(u.email)}
                                  className={`p-2 lg:p-2 border border-transparent rounded-full transition-colors cursor-pointer ${
                                    u.role === 'admin' 
                                      ? 'text-[#ccff00] hover:bg-[#ccff00]/10 hover:border-[#ccff00]/30' 
                                      : 'text-zinc-500 hover:text-white hover:bg-white/10 hover:border-white/30'
                                  }`}
                                  title={u.role === 'admin' ? "Revoke Admin Status" : "Promote to Admin"}
                                >
                                  <Shield className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u.email)}
                                  className="text-red-500 hover:text-red-400 p-2 lg:p-2 border border-transparent hover:border-red-500/30 hover:bg-red-500/10 rounded-full transition-colors cursor-pointer"
                                  title="Delete User Registration"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bookings Tracker */}
              <div className="space-y-4">
                <h2 className="text-xl font-black italic uppercase">Recent Bookings Log</h2>
                <div className="bg-[#080808] border border-white/5 rounded-[24px] overflow-hidden">
                  {mongoBookings.length === 0 ? (
                    <div className="p-8 text-center text-zinc-600 text-xs uppercase tracking-widest">No bookings yet</div>
                  ) : (
                    <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
                      {mongoBookings.map((b, i) => (
                        <div key={i} className="p-4 hover:bg-white/5 transition-colors space-y-2">
                          <div className="flex justify-between">
                            <p className="text-sm font-bold text-white">{b.className}</p>
                            <span className={`text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-full ${
                              b.status === 'Completed' ? 'bg-[#ccff00]/10 text-[#ccff00]' :
                              b.status === 'Cancelled' ? 'bg-red-500/10 text-red-500' :
                              'bg-zinc-800 text-white'
                            }`}>
                              {b.status}
                            </span>
                          </div>
                          <div className="flex justify-between text-[10px] text-zinc-500">
                            <span>User: {b.userEmail}</span>
                            <span>{b.date} • {b.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Trainer Directory */}
            <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black italic uppercase">Trainer Directory</h2>
                  <button onClick={() => setShowAddTrainerForm(!showAddTrainerForm)} className="text-[#000] bg-[#ccff00] hover:bg-[#b0db00] text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-full transition-colors cursor-pointer flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add Trainer
                  </button>
                </div>

                {showAddTrainerForm && (
                  <div className="bg-[#111] border border-white/10 rounded-[24px] p-6 mb-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <h3 className="text-[#ccff00] uppercase text-[10px] font-bold tracking-widest mb-4">Register New Trainer Session</h3>
                    <form onSubmit={handleAddTrainer} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Trainer Name</label>
                          <input 
                            type="text" 
                            required
                            value={newTrainerName}
                            onChange={(e) => setNewTrainerName(e.target.value)}
                            className="bg-black border border-white/5 rounded-xl h-12 px-4 text-sm text-white focus:outline-none focus:border-[#ccff00] w-full"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Class Name</label>
                          <input 
                            type="text"
                            required
                            value={newTrainerClass}
                            onChange={(e) => setNewTrainerClass(e.target.value)}
                            className="bg-black border border-white/5 rounded-xl h-12 px-4 text-sm text-white focus:outline-none focus:border-[#ccff00] w-full"
                            placeholder="e.g. Adv Calisthenics"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Category</label>
                           <select 
                            value={newTrainerCategory}
                            onChange={(e) => setNewTrainerCategory(e.target.value as any)}
                            className="bg-black border border-white/5 rounded-xl h-12 px-4 text-sm text-white focus:outline-none focus:border-[#ccff00] w-full appearance-none cursor-pointer"
                            style={{ colorScheme: 'dark' }}
                          >
                            <option value="Strength">Strength</option>
                            <option value="Yoga">Yoga</option>
                            <option value="HIIT">HIIT</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Time Slot</label>
                          <input 
                            type="text" 
                            required
                            value={newTrainerTime}
                            onChange={(e) => setNewTrainerTime(e.target.value)}
                            className="bg-black border border-white/5 rounded-xl h-12 px-4 text-sm text-white focus:outline-none focus:border-[#ccff00] w-full"
                            placeholder="e.g. 7:00 AM - 8:30 AM"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Duration (Mins)</label>
                          <input 
                            type="number" 
                            required
                            value={newTrainerDuration}
                            onChange={(e) => setNewTrainerDuration(e.target.value)}
                            className="bg-black border border-white/5 rounded-xl h-12 px-4 text-sm text-white focus:outline-none focus:border-[#ccff00] w-full"
                            placeholder="60"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Capacity (Slots)</label>
                          <input 
                            type="number" 
                            required
                            value={newTrainerCapacity}
                            onChange={(e) => setNewTrainerCapacity(e.target.value)}
                            className="bg-black border border-white/5 rounded-xl h-12 px-4 text-sm text-white focus:outline-none focus:border-[#ccff00] w-full"
                            placeholder="10"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Avatar URL (Optional)</label>
                          <input 
                            type="text" 
                            value={newTrainerAvatar}
                            onChange={(e) => setNewTrainerAvatar(e.target.value)}
                            className="bg-black border border-white/5 rounded-xl h-12 px-4 text-sm text-white focus:outline-none focus:border-[#ccff00] w-full"
                            placeholder="https://images.unsplash.com/..."
                          />
                        </div>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button type="submit" className="bg-[#ccff00] text-black text-[10px] uppercase font-black tracking-widest px-6 py-3 rounded-xl hover:bg-[#b0db00] transition-colors">
                          Save Profile
                        </button>
                        <button type="button" onClick={() => setShowAddTrainerForm(false)} className="bg-transparent text-zinc-500 hover:text-white text-[10px] uppercase font-bold tracking-widest px-6 py-3 rounded-xl transition-colors">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
                
                <div className="bg-[#080808] border border-white/5 rounded-[24px] overflow-hidden">
                  {mongoTrainers.length === 0 ? (
                    <div className="p-8 text-center text-zinc-600 text-xs uppercase tracking-widest">No trainers configured. Add one.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y divide-white/5 md:divide-y-0">
                      {mongoTrainers.map((t, i) => (
                        <div key={i} className="p-6 hover:bg-white/5 transition-colors border max-w-sm md:border-white/5 md:m-2 rounded-2xl flex flex-col justify-between space-y-4">
                          <div className="flex items-center gap-4">
                            <img src={t.trainerAvatar} alt={t.trainerName} className="w-12 h-12 rounded-full object-cover shadow-sm grayscale hover:grayscale-0 transition-all border border-[#ccff00]/40" />
                            <div>
                               <p className="font-bold text-white uppercase italic">{t.trainerName}</p>
                               <p className="text-[10px] tracking-widest text-[#ccff00] font-black uppercase">{t.name}</p>
                            </div>
                          </div>
                          
                          <div className="text-[10px] text-zinc-500 uppercase tracking-widest space-y-1">
                             <p>Slot: <span className="text-white">{t.time} ({t.duration})</span></p>
                             <p>Cat: <span className="text-white">{t.category}</span></p>
                             <p>Capacity: <span className="text-white">{t.slotsLeft} / {t.totalSlots}</span></p>
                          </div>
                          
                          <div className="pt-2 border-t border-white/5 flex justify-end gap-2">
                             <button
                               onClick={() => handleChangeTrainerSlots(t.id, t.time, t.duration, t.totalSlots)}
                               className="text-zinc-400 hover:text-[#ccff00] p-2 border border-transparent hover:border-[#ccff00]/30 hover:bg-[#ccff00]/10 rounded-full transition-colors cursor-pointer"
                               title="Edit Trainer Slots"
                             >
                               <Settings className="w-4 h-4" />
                             </button>
                             <button
                               onClick={() => handleDeleteTrainer(t.id)}
                               className="text-red-500 hover:text-red-400 p-2 border border-transparent hover:border-red-500/30 hover:bg-red-500/10 rounded-full transition-colors cursor-pointer"
                               title="Delete Trainer Profile"
                             >
                               <Trash2 className="w-4 h-4" />
                             </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
            </div>
          </main>
        </div>
      ) : (
        /* MAIN APPLICATION WORKSPACE */
        <div className="flex-1 flex flex-col min-h-screen">
          
          {/* Header Layout */}
          <header className="p-8 flex justify-between items-center shrink-0 border-b border-white/5 bg-[#080808]/95 sticky top-0 z-40 backdrop-blur-xl">
            <div>
              <p className="text-[#ccff00] uppercase tracking-[0.3em] text-[10px] font-bold mb-1">Vibe Fit Gym Premium Hub</p>
              <h1 className="text-3xl font-black italic tracking-tighter uppercase">VIBE<span className="text-[#ccff00]">FIT</span></h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={handlePullToRefresh} 
                className={`p-3 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 active:scale-95 transition-all text-[#ccff00] ${isRefreshing ? 'animate-spin' : ''}`}
                title="Refresh stats"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <div 
                onClick={() => setActiveTab('Profile')} 
                className="flex items-center gap-3 bg-white/5 hover:bg-white/10 py-1.5 pl-3 pr-2 rounded-full border border-white/5 cursor-pointer transition-all active:scale-95"
              >
                <span className="text-xs font-bold text-zinc-300">{userProfile.name}</span>
                <img 
                  src={userProfile.avatar} 
                  alt="Avatar" 
                  className="w-8 h-8 rounded-full border border-[#ccff00]/40 object-cover"
                />
              </div>
            </div>
          </header>

          {/* Core Screen Area */}
          <main className="flex-1 px-4 py-6 md:p-8 max-w-4xl mx-auto w-full space-y-6">

            {/* simulated reloading banner */}
            {isRefreshing && (
              <div className="w-full py-4 glass-card rounded-2xl border border-[#ccff00]/20 flex items-center justify-center gap-3 animate-pulse">
                <Spinner />
                <span className="text-xs font-mono text-[#ccff00] uppercase tracking-widest">Refreshing your fitness stats...</span>
              </div>
            )}

            {/* 1. HOME TAB */}
            {activeTab === 'Home' && (
              <div className="space-y-6">
                
                {/* Streak Days + Progress Banner (Bento 1) */}
                <div className="glass-card rounded-[32px] p-8 border-l-4 border-l-[#ccff00] relative overflow-hidden flex flex-col justify-between shadow-2xl">
                  <div className="absolute -right-20 -top-20 w-60 h-60 bg-[#ccff00] opacity-[0.05] rounded-full blur-[100px]" />
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-zinc-500 uppercase tracking-widest text-[9px] font-bold">Your Active Workout Streak</p>
                      <h3 className="text-5xl font-black italic tracking-tighter uppercase mt-2">
                        {userProfile.streakDays} <span className="text-[#ccff00] text-lg font-bold tracking-normal not-italic uppercase">ACTIVE DAYS</span>
                      </h3>
                    </div>
                    <Award className="text-[#ccff00] w-10 h-10 neon-glow" />
                  </div>

                  <div className="w-full h-1 bg-zinc-800 rounded-full mt-6 overflow-hidden">
                    <div className="h-full bg-[#ccff00] rounded-full" style={{ width: `${Math.min(userProfile.streakDays * 8, 100)}%` }}></div>
                  </div>
                  <p className="text-[10px] mt-2 text-zinc-400">
                    Keep showing up! Your regular exercise streak helps you build healthy habits.
                  </p>
                </div>

                {/* Dashboard Stats Quick Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Next class upcoming */}
                  <div className="glass-card p-6 rounded-3xl flex flex-col justify-between border border-white/5 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-[#ccff00] font-bold uppercase tracking-widest">Next Scheduled Class</span>
                      <CalendarIcon className="text-zinc-500 w-4 h-4" />
                    </div>

                    {nextUpcomingBooking ? (
                      <div className="space-y-2">
                        <p className="text-lg font-black italic uppercase text-white">{nextUpcomingBooking.className}</p>
                        <p className="text-xs text-zinc-400 font-medium">{nextUpcomingBooking.date} • {nextUpcomingBooking.time}</p>
                        <p className="text-[9px] uppercase tracking-wider text-zinc-600">Trainer: {nextUpcomingBooking.trainerName}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-zinc-400 italic">No upcomings scheduled today</p>
                        <button 
                          onClick={() => setActiveTab('Bookings')}
                          className="text-xs text-[#ccff00] font-bold uppercase tracking-wider hover:underline flex items-center gap-1"
                        >
                          Find a workout now <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    
                    {nextUpcomingBooking && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setActiveTab('History')}
                          className="py-2 px-4 bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-bold uppercase tracking-wider rounded-xl text-zinc-300 transition-all active:scale-95"
                        >
                          Manage
                        </button>
                        <button 
                          onClick={() => handleCompleteBooking(nextUpcomingBooking.id)}
                          className="py-2 px-4 bg-[#ccff00] text-black text-[10px] font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-[0_4px_12px_rgba(204,255,0,0.25)]"
                        >
                          Complete Workout
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Energy Burned + Daily Random Tip */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass-card p-6 rounded-3xl flex flex-col justify-between border border-white/5">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Active Burn</span>
                        <Flame className="text-[#ccff00] w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-3xl font-black italic tracking-tighter text-white">{userProfile.caloriesBurned}</h4>
                        <span className="text-[10px] bg-[#ccff00]/10 px-2 py-0.5 rounded text-[#ccff00] font-bold">+12%</span>
                        <p className="text-[9px] text-zinc-500 uppercase mt-1">kcal burned</p>
                      </div>
                    </div>

                    <div className="glass-card p-6 rounded-3xl flex flex-col justify-between border border-[#ccff00]/20 bg-[#ccff00]/5">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] text-[#ccff00] font-bold uppercase tracking-widest">Vital Tip</span>
                        <Droplet className="text-[#ccff00] w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] leading-snug text-zinc-200 font-medium">"{DAILY_TIPS[tipIndex]}"</p>
                        <button 
                          onClick={() => setTipIndex((prev) => (prev + 1) % DAILY_TIPS.length)}
                          className="text-[9px] text-zinc-500 uppercase font-black hover:text-[#ccff00] mt-1 transition-colors"
                        >
                          Shuffle Tip
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interactive Weekly activities chart */}
                <div className="glass-card rounded-[32px] p-8 border border-white/5 space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Your Habit Tracker</p>
                      <h4 className="text-xl font-extrabold text-white">Weekly Workout Target</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-[#ccff00] rounded-full shadow-[0_0_8px_#ccff00]"></span>
                      <span className="text-[10px] uppercase font-bold text-zinc-400">Week 42</span>
                    </div>
                  </div>

                  {/* Responsive Grid Bars */}
                  <div className="h-44 flex items-end justify-between gap-3 px-2">
                    {[
                      { day: 'Mon', h: 'h-24', active: false, time: '35m' },
                      { day: 'Tue', h: 'h-32', active: false, time: '55m' },
                      { day: 'Wed', h: 'h-16', active: false, time: '20m' },
                      { day: 'Thu', h: 'h-40', active: true, time: '75m' },
                      { day: 'Fri', h: 'h-20', active: false, time: '30m' },
                      { day: 'Sat', h: 'h-36', active: false, time: '65m' },
                      { day: 'Sun', h: 'h-12', active: false, time: '15m' },
                    ].map((bar, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-3">
                        <div className="text-[9px] font-mono text-zinc-500 opacity-0 hover:opacity-100 transition-opacity">{bar.time}</div>
                        <div className="w-full relative group cursor-pointer">
                          <div className={`w-full rounded-t-xl transition-all duration-300 ${bar.active ? 'bg-[#ccff00] shadow-[0_0_15px_rgba(204,255,0,0.4)]' : 'bg-white/10 group-hover:bg-[#ccff00]/40'} ${bar.h}`} />
                        </div>
                        <span className={`text-[10px] font-bold ${bar.active ? 'text-[#ccff00]' : 'text-zinc-500'}`}>{bar.day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Spot Light Showcase (Specialized content block) */}
                <div className="relative rounded-[32px] overflow-hidden group shadow-2xl">
                  <div className="absolute inset-0 z-0">
                    <img src={spotlightImg} alt="Gym reconstruction" className="w-full h-full object-cover opacity-50 scale-100 group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
                  </div>
                  <div className="relative z-10 p-8 space-y-4">
                    <span className="text-[#ccff00] uppercase tracking-[0.2em] text-[9px] font-extrabold bg-[#ccff00]/10 px-3 py-1.5 rounded-full border border-[#ccff00]/20 max-w-max block">
                      RECOMMENDED WORKOUT
                    </span>
                    <div>
                      <h3 className="text-2xl font-black italic tracking-tighter uppercase text-white">Full Body Strength & Tone</h3>
                      <p className="text-xs text-zinc-400 mt-1">Build energy and endurance with high-repetition muscle movements under Trainer Marcus Vance.</p>
                    </div>
                    <button 
                      onClick={() => setActiveTab('Bookings')}
                      className="py-2.5 px-6 bg-[#ccff00] text-black text-xs font-black uppercase tracking-wider rounded-xl hover:bg-[#b5e000] active:scale-95 transition-all block max-w-max"
                    >
                      Book Session NOW
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* 2. BOOKINGS TAB */}
            {activeTab === 'Bookings' && (
              <div className="space-y-6">
                
                {/* Horizontal Date Selector */}
                <div className="glass-card rounded-3xl p-6 border border-white/5 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-bold text-white uppercase tracking-wider">Select Class Date</h3>
                    <span className="text-[10px] text-zinc-500 font-mono">OCTOBER 2026</span>
                  </div>

                  <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                    {[
                      { day: 'MON', date: 14 },
                      { day: 'TUE', date: 15 },
                      { day: 'WED', date: 16 },
                      { day: 'THU', date: 17 },
                      { day: 'FRI', date: 18 },
                      { day: 'SAT', date: 19 },
                      { day: 'SUN', date: 20 },
                    ].map((item, i) => (
                      <button 
                        key={i}
                        onClick={() => setSelectedDate(item.date)}
                        className={`flex flex-col items-center justify-center min-w-[64px] h-20 rounded-2xl border transition-all active:scale-95 ${selectedDate === item.date ? 'bg-[#ccff00] text-black border-transparent shadow-[0_0_15px_rgba(204,255,0,0.3)]' : 'bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10'}`}
                      >
                        <span className="text-[9px] font-bold tracking-widest">{item.day}</span>
                        <span className="text-xl font-bold mt-1">{item.date}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Filters */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                  {(['All', 'Strength', 'Yoga', 'HIIT'] as ClassCategory[]).map((cat, i) => (
                    <button 
                      key={i}
                      onClick={() => setBookingFilter(cat)}
                      className={`px-5 py-2 rounded-full font-bold text-xs tracking-wider whitespace-nowrap transition-all active:scale-95 border ${bookingFilter === cat ? 'bg-[#ccff00] text-black border-transparent shadow-[0_4px_12px_rgba(204,255,0,0.3)]' : 'bg-transparent border-white/10 text-zinc-400 hover:bg-white/5'}`}
                    >
                      {cat.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Available Classes Grid */}
                <div className="space-y-4">
                  {mongoTrainers.length === 0 ? (
                    <div className="p-12 text-center text-zinc-500 text-xs tracking-widest uppercase border border-white/5 rounded-3xl">
                      No trainers currently scheduled. Please check back later.
                    </div>
                  ) : (
                    mongoTrainers
                    .filter(c => bookingFilter === 'All' || c.category === bookingFilter)
                    .map((item, i) => (
                      <div key={i} className="glass-card rounded-3xl p-6 border border-white/5 space-y-4 transition-transform duration-300 hover:scale-[1.01]">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <span className="text-[10px] text-[#ccff00] font-bold tracking-widest uppercase">{item.intensity}</span>
                            <h4 className="text-xl font-black italic uppercase text-white">{item.name}</h4>
                            <p className="text-xs text-zinc-400 font-medium">{item.time} ({item.duration})</p>
                          </div>
                          
                          {/* Intensity Icon */}
                          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 text-[#ccff00]">
                            {item.category === 'Strength' ? <Dumbbell className="w-6 h-6" /> : item.category === 'Yoga' ? <Award className="w-6 h-6" /> : <Activity className="w-6 h-6" />}
                          </div>
                        </div>

                        {/* Booking CTA Bar */}
                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                          <div className="flex items-center gap-3">
                            <img src={item.trainerAvatar} alt={item.trainerName} className="w-8 h-8 rounded-full border border-white/10 object-cover" />
                            <div>
                              <p className="text-[10px] text-zinc-400">Trainer</p>
                              <p className="text-xs font-bold text-white">{item.trainerName}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="text-[10px] text-zinc-500 font-medium">{item.slotsLeft} slots remaining</span>
                            <button 
                              onClick={() => handleBookClass(item)}
                              className="px-6 py-2.5 bg-[#ccff00] text-black text-xs font-extrabold uppercase tracking-wider rounded-xl hover:bg-[#b0db00] transition-colors"
                            >
                              Book Now
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

              </div>
            )}

            {/* 3. HISTORY TAB */}
            {activeTab === 'History' && (
              <div className="space-y-6">
                
                {/* Search Bar / Filter Panel */}
                <div className="glass-card rounded-3xl p-6 border border-white/5 space-y-4">
                  <div className="relative flex items-center bg-black border border-white/5 rounded-2xl h-14 px-4 focus-within:border-[#ccff00]">
                    <Search className="text-zinc-500 w-5 h-5 mr-3 shrink-0" />
                    <input 
                      type="text" 
                      value={historySearchQuery}
                      onChange={(e) => setHistorySearchQuery(e.target.value)}
                      placeholder="Search class or trainer name..." 
                      className="bg-transparent border-none outline-none focus:ring-0 text-white placeholder:text-zinc-700 w-full text-sm font-medium"
                    />
                    {historySearchQuery && (
                      <button onClick={() => setHistorySearchQuery('')} className="text-zinc-500 hover:text-white">
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {/* Filter Subtabs */}
                  <div className="flex justify-between gap-2 overflow-x-auto no-scrollbar pt-1">
                    {(['All', 'Completed', 'Upcoming', 'Cancelled'] as const).map((status, i) => (
                      <button 
                        key={i}
                        onClick={() => setHistoryFilter(status)}
                        className={`flex-1 min-w-[70px] py-2 text-center rounded-xl font-bold text-[10px] tracking-wider transition-colors ${historyFilter === status ? 'bg-white/10 text-white border border-white/10' : 'text-zinc-500 hover:text-zinc-300'}`}
                      >
                        {status.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* History Session Cards */}
                <div className="space-y-4">
                  {filteredBookings.length > 0 ? (
                    filteredBookings.map((item, i) => (
                      <div 
                        key={i} 
                        className={`glass-card rounded-3xl p-6 border-l-4 border border-white/5 flex flex-col justify-between space-y-4 transition-transform duration-300 hover:scale-[1.01] ${
                          item.status === 'Completed' ? 'border-l-[#ccff00]' : item.status === 'Upcoming' ? 'border-l-sky-400' : 'border-l-red-500 opacity-60'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-[9px] text-zinc-500 font-mono">{item.date} • {item.time}</p>
                            <h4 className="text-lg font-black italic uppercase text-white mt-1">{item.className}</h4>
                            <p className="text-xs text-zinc-400 font-medium">Trainer: {item.trainerName}</p>
                          </div>

                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                            item.status === 'Completed' ? 'bg-[#ccff00]/10 text-[#ccff00]' : item.status === 'Upcoming' ? 'bg-sky-400/10 text-sky-400' : 'bg-red-500/10 text-red-500'
                          }`}>
                            {item.status}
                          </span>
                        </div>

                        {/* Interactive Footer (Rebook / Cancel) */}
                        <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-zinc-400">
                          <span className="text-[10px]">Registered checkin: {item.timestamp}</span>
                          
                          {item.status === 'Completed' && (
                            <button 
                              onClick={() => handleRebook(item)}
                              className="font-black text-[10px] uppercase tracking-wider text-[#ccff00] border-b border-[#ccff00]/40 pb-0.5 hover:text-white hover:border-white transition-all"
                            >
                              Rebook Session
                            </button>
                          )}

                          {item.status === 'Upcoming' && (
                            <button 
                              onClick={() => handleCancelBooking(item.id)}
                              className="font-black text-[10px] uppercase tracking-wider text-red-500 border-b border-red-500/40 pb-0.5 hover:text-white hover:border-white transition-all"
                            >
                              Cancel Booking
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="glass-card rounded-3xl p-12 text-center border border-white/5 space-y-4">
                      <p className="text-zinc-400 text-sm font-medium italic">No recorded bookings matching filters</p>
                      <button 
                        onClick={() => { setHistoryFilter('All'); setHistorySearchQuery(''); }}
                        className="py-2.5 px-6 border border-white/10 hover:bg-white/5 text-xs font-bold text-[#ccff00] rounded-xl whitespace-nowrap"
                      >
                        Reset Filters
                      </button>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* 4. PROFILE TAB */}
            {activeTab === 'Profile' && (
              <div className="space-y-6">
                
                {/* Profile Meta Info with Edit State */}
                <div className="glass-card rounded-[32px] p-8 border border-white/5 space-y-6">
                  {/* Pic Upload Placeholder */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative group w-24 h-24 rounded-full overflow-hidden border-2 border-[#ccff00] shadow-[0_0_15px_rgba(204,255,0,0.25)] mx-auto">
                      <img src={userProfile.avatar} alt="Profile" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer" onClick={() => setAvatarInputExpanded(!avatarInputExpanded)}>
                        <Edit2 className="w-5 h-5 text-[#ccff00]" />
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setAvatarInputExpanded(!avatarInputExpanded)}
                      className="text-[10px] uppercase font-bold tracking-widest text-[#ccff00] hover:underline"
                    >
                      Change Picture
                    </button>

                    <div className="text-center">
                      <h3 className="text-xl font-black italic uppercase text-white">{userProfile.name}</h3>
                      <p className="text-xs text-zinc-500">{userProfile.email}</p>
                    </div>

                    {/* Expandable Simulated URL Upload Tool */}
                    {avatarInputExpanded && (
                      <div className="w-full max-w-sm bg-black border border-white/10 rounded-2xl p-4 space-y-3">
                        <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Change Profile Picture URL</label>
                        <input 
                          type="text" 
                          value={customAvatarUrl}
                          onChange={(e) => setCustomAvatarUrl(e.target.value)}
                          placeholder="Paste image web link here..."
                          className="w-full bg-white/5 border border-white/10 rounded-xl h-10 px-3 text-xs outline-none text-white focus:border-[#ccff00]"
                        />
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleAvatarChange(customAvatarUrl || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200&h=200')} 
                            className="flex-1 py-1.5 bg-[#ccff00] text-black text-[10px] font-bold rounded-lg"
                          >
                            Apply URL
                          </button>
                          <button 
                            onClick={() => handleAvatarChange('https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200&h=200')} 
                            className="flex-1 py-1.5 bg-zinc-800 text-zinc-300 text-[10px] font-medium rounded-lg"
                          >
                            Use Preset
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Personal Details Form */}
                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs text-zinc-400 font-black uppercase tracking-wider">Your Body Measurements</h4>
                      <button 
                        onClick={() => {
                          if (isEditingProfile) {
                            handleSaveProfile();
                          } else {
                            setIsEditingProfile(true);
                          }
                        }}
                        className="text-xs text-[#ccff00] font-bold uppercase tracking-wider hover:underline"
                      >
                        {isEditingProfile ? 'Save Profile' : 'Edit Details'}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">User Name</label>
                        <input 
                          type="text" 
                          disabled={!isEditingProfile}
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-black disabled:opacity-60 border border-white/5 rounded-2xl h-12 px-4 text-xs font-semibold focus:border-[#ccff00] outline-none text-white text-center"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Age Years</label>
                        <input 
                          type="number" 
                          disabled={!isEditingProfile}
                          value={editAge}
                          onChange={(e) => setEditAge(Number(e.target.value))}
                          className="w-full bg-black disabled:opacity-60 border border-white/5 rounded-2xl h-12 px-4 text-xs font-semibold focus:border-[#ccff00] outline-none text-white text-center"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Body Weight (LBS)</label>
                        <input 
                          type="number" 
                          disabled={!isEditingProfile}
                          value={editWeight}
                          onChange={(e) => setEditWeight(Number(e.target.value))}
                          className="w-full bg-black disabled:opacity-60 border border-white/5 rounded-2xl h-12 px-4 text-xs font-semibold focus:border-[#ccff00] outline-none text-white text-center"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Body Height (CM)</label>
                        <input 
                          type="number" 
                          disabled={!isEditingProfile}
                          value={editHeight}
                          onChange={(e) => setEditHeight(Number(e.target.value))}
                          className="w-full bg-black disabled:opacity-60 border border-white/5 rounded-2xl h-12 px-4 text-xs font-semibold focus:border-[#ccff00] outline-none text-white text-center"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fitness Goals Selection Card */}
                <div className="glass-card rounded-[32px] p-8 border border-white/5 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs text-zinc-400 font-black uppercase tracking-wider">Targets & Fitness Goals</h4>
                    <span className="text-[10px] text-zinc-500">Choose all matching goals</span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {['Muscle Gain', 'Fat Loss', 'Endurance', 'Flexibility', 'Strength', 'General Health'].map((goal, i) => {
                      const isSelected = (userProfile.fitnessGoals || []).includes(goal);
                      return (
                        <button 
                          key={i}
                          onClick={() => handleGoalToggle(goal)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide border transition-all active:scale-95 ${
                            isSelected ? 'bg-[#ccff00] text-black border-transparent shadow-[0_0_12px_rgba(204,255,0,0.35)]' : 'bg-transparent border-white/10 text-zinc-400 hover:bg-white/5'
                          }`}
                        >
                          {goal}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* App Settings Card */}
                <div className="glass-card rounded-[32px] p-8 border border-white/5 space-y-6">
                  <h4 className="text-xs text-zinc-400 font-black uppercase tracking-wider">Notification & Sync Settings</h4>

                  <div className="space-y-4">
                    {/* Toggle 1: Push Notifications */}
                    <div className="flex items-center justify-between py-2">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-white">Push Notifications</p>
                        <p className="text-[10px] text-zinc-400">Receive class reminders and fitness goal updates.</p>
                      </div>
                      <button 
                        onClick={() => handleToggleSetting('notificationsEnabled')}
                        className={`w-12 h-6 flex items-center rounded-full p-1 transition-all duration-300 ${userProfile.notificationsEnabled ? 'bg-[#ccff00]' : 'bg-zinc-800'}`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all duration-300 ${userProfile.notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {/* Toggle 2: Biometric Login */}
                    <div className="flex items-center justify-between py-2 border-t border-white/5">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-white">Biometric Logins (FaceID / TouchID)</p>
                        <p className="text-[10px] text-zinc-400">Sign in rapidly using your device fingerprint or face scanner.</p>
                      </div>
                      <button 
                        onClick={() => handleToggleSetting('biometricLogin')}
                        className={`w-12 h-6 flex items-center rounded-full p-1 transition-all duration-300 ${userProfile.biometricLogin ? 'bg-[#ccff00]' : 'bg-zinc-800'}`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all duration-300 ${userProfile.biometricLogin ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {/* Toggle 3: Google Fit Integration */}
                    <div className="flex items-center justify-between py-2 border-t border-white/5">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-white">Sync Google Fit / Health Connect</p>
                        <p className="text-[10px] text-zinc-400">Import your steps and calorie data automatically from Google Fit.</p>
                      </div>
                      <button 
                        onClick={() => handleToggleSetting('syncHealth')}
                        className={`w-12 h-6 flex items-center rounded-full p-1 transition-all duration-300 ${userProfile.syncHealth ? 'bg-[#ccff00]' : 'bg-zinc-800'}`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all duration-300 ${userProfile.syncHealth ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Log Out CTA */}
                <button 
                  onClick={handleLogout}
                  className="w-full py-4 border border-red-500 text-red-500 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-500/10 active:scale-95 transition-all"
                >
                  Log Out
                </button>

              </div>
            )}

          </main>

          {/* Bottom Floating Navigation (Immersive UI Style) */}
          <nav className="fixed bottom-6 left-6 right-6 md:left-1/2 md:right-auto md:w-max md:-translate-x-1/2 z-[49] flex justify-around items-center p-2.5 bg-[#0a0a0add]/90 backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl space-x-1">
            {[
              { id: 'Home', icon: <Activity className="w-5 h-5" />, label: 'DASHBOARD' },
              { id: 'Bookings', icon: <CalendarIcon className="w-5 h-5" />, label: 'BOOKING' },
              { id: 'History', icon: <TrendingUp className="w-5 h-5" />, label: 'HISTORY' },
              { id: 'Profile', icon: <User className="w-5 h-5" />, label: 'PROFILE' },
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button 
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as ActiveTab);
                    setIsEditingProfile(false);
                  }}
                  className={`flex flex-col md:flex-row items-center justify-center gap-1 px-4 py-2.5 rounded-full transition-all active:scale-90 ${
                    isSelected ? 'bg-[#ccff00] text-black font-extrabold shadow-[0_4px_16px_rgba(204,255,0,0.35)]' : 'text-zinc-500 hover:text-zinc-200'
                  }`}
                >
                  {tab.icon}
                  <span className="text-[9px] font-black tracking-widest">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* CONFIRM BOOKING MODAL */}
      {bookingClassToConfirm && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-6">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={() => setBookingClassToConfirm(null)}></div>
          
          <div className="relative z-10 w-full max-w-md glass-card rounded-[32px] p-8 border border-[#ccff00]/30 shadow-2xl space-y-6">
            <div className="space-y-2">
              <span className="text-[#ccff00] uppercase tracking-widest text-[9px] font-black">Confirm Your Spot</span>
              <h3 className="text-2xl font-black italic tracking-tighter uppercase text-white">Book Your Class</h3>
              <p className="text-xs text-zinc-400">Click confirm below to guarantee your reservation in this session.</p>
            </div>

            <div className="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[9px] text-[#ccff00] font-bold tracking-wider uppercase">{bookingClassToConfirm.intensity}</span>
                  <p className="text-lg font-black italic uppercase text-white leading-snug">{bookingClassToConfirm.name}</p>
                  <p className="text-xs text-zinc-400 font-medium">{bookingClassToConfirm.time} ({bookingClassToConfirm.duration})</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#ccff00] font-bold">
                  {bookingClassToConfirm.slotsLeft}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                <img src={bookingClassToConfirm.trainerAvatar} alt="Trainer" className="w-8 h-8 rounded-full object-cover" />
                <div>
                  <p className="text-[9px] text-zinc-500 uppercase font-black">Trainer</p>
                  <p className="text-xs font-bold text-white">{bookingClassToConfirm.trainerName}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setBookingClassToConfirm(null)}
                className="py-3.5 border border-white/10 hover:bg-white/5 text-zinc-400 text-xs font-extrabold uppercase rounded-2xl tracking-wider active:scale-95 transition-all"
              >
                Go Back
              </button>
              <button 
                onClick={initiatePayment}
                className="py-3.5 bg-[#ccff00] text-black text-xs font-extrabold uppercase rounded-2xl tracking-wider neon-glow hover:bg-[#b5e000] active:scale-95 transition-all"
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {showPaymentModal && bookingClassToConfirm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={() => !paymentProcessing && setShowPaymentModal(false)}></div>
          
          <div className="relative z-10 w-full max-w-[320px] glass-card rounded-3xl p-5 border border-[#ccff00]/30 shadow-2xl space-y-4">
            <div className="space-y-1">
              <span className="text-[#ccff00] uppercase tracking-widest text-[9px] font-black">Secure Checkout</span>
              <h3 className="text-lg font-black italic tracking-tighter uppercase text-white flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#ccff00]" />
                Payment Method
              </h3>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1 flex justify-between items-center">
               <div>
                 <p className="text-[8px] text-zinc-500 uppercase font-black">Purchase Total</p>
                 <p className="text-sm font-bold text-white uppercase italic">{bookingClassToConfirm.name}</p>
               </div>
               <div className="text-right">
                 <p className="text-lg font-black text-[#ccff00]">$15.00</p>
               </div>
            </div>

            <form onSubmit={processPaymentAndBook} className="space-y-3">
              <div className="flex gap-2">
                 <button
                   type="button"
                   onClick={() => setPaymentMethod('card')}
                   className={`flex-1 py-1.5 rounded-lg text-[9px] uppercase font-black tracking-widest border transition-all flex items-center justify-center gap-1.5 ${paymentMethod === 'card' ? 'bg-[#ccff00]/10 border-[#ccff00] text-[#ccff00]' : 'bg-transparent border-white/10 text-zinc-500 hover:text-white'}`}
                 >
                   <CreditCard className="w-2.5 h-2.5" />
                   Card
                 </button>
                 <button
                   type="button"
                   onClick={() => setPaymentMethod('upi')}
                   className={`flex-1 py-1.5 rounded-lg text-[9px] uppercase font-black tracking-widest border transition-all flex items-center justify-center gap-1.5 ${paymentMethod === 'upi' ? 'bg-[#ccff00]/10 border-[#ccff00] text-[#ccff00]' : 'bg-transparent border-white/10 text-zinc-500 hover:text-white'}`}
                 >
                   <Smartphone className="w-2.5 h-2.5" />
                   UPI
                 </button>
              </div>

              {paymentMethod === 'card' ? (
                <>
                  <div className="space-y-1">
                     <label className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold">Cardholder Name</label>
                     <input type="text" required placeholder="John Doe" className="bg-black border border-white/10 rounded-lg h-9 px-3 text-[10px] text-white focus:outline-none focus:border-[#ccff00] w-full" />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold">Card Number</label>
                     <div className="relative">
                       <input type="text" required pattern="\d{16}" placeholder="4111 1111 1111 1111" maxLength={16} className="bg-black border border-white/10 rounded-lg h-9 pl-8 pr-3 text-[10px] text-white focus:outline-none focus:border-[#ccff00] w-full font-mono" />
                       <CreditCard className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                       <label className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold">Expiry Date</label>
                       <input type="text" required placeholder="MM/YY" maxLength={5} className="bg-black border border-white/10 rounded-lg h-9 px-3 text-[10px] text-white focus:outline-none focus:border-[#ccff00] w-full font-mono" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold">CVC/CVV</label>
                       <div className="relative">
                         <input type="text" required placeholder="123" pattern="\d{3,4}" maxLength={4} className="bg-black border border-white/10 rounded-lg h-9 pl-8 pr-3 text-[10px] text-white focus:outline-none focus:border-[#ccff00] w-full font-mono" />
                         <Lock className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
                       </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-1 pb-1">
                   <label className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold">UPI ID / VPA</label>
                   <div className="relative">
                     <input type="text" required placeholder="username@upi" className="bg-black border border-white/10 rounded-lg h-9 pl-8 pr-3 text-[10px] text-white focus:outline-none focus:border-[#ccff00] w-full font-mono" />
                     <Smartphone className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
                   </div>
                   <p className="text-[8px] text-zinc-500 pt-1">You will receive a payment request on your UPI app.</p>
                </div>
              )}

              <div className="pt-1 flex gap-2">
                <button 
                  type="button"
                  disabled={paymentProcessing}
                  onClick={() => setShowPaymentModal(false)}
                  className="w-1/3 py-2 border border-white/10 hover:bg-white/5 text-zinc-400 text-[10px] font-extrabold uppercase rounded-xl tracking-wider active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={paymentProcessing}
                  className="w-2/3 py-2 bg-[#ccff00] text-black text-[10px] font-extrabold uppercase rounded-xl tracking-wider neon-glow hover:bg-[#b5e000] active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  {paymentProcessing ? (
                    <span className="flex items-center gap-1.5">
                       <span className="w-3.5 h-3.5 rounded-full border-2 border-black border-r-transparent animate-spin"></span>
                       Processing
                    </span>
                  ) : "Pay $15.00"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER BRANDING FOR IMMERSIVE PROTO */}
      <footer className="p-8 pb-32 flex justify-between items-center bg-[#050505] border-t border-white/5 shrink-0">
        <div className="flex gap-8">
          {/* Removed theme and location metrics */}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full border-2 border-[#050505] bg-zinc-800"></div>
            <div className="w-8 h-8 rounded-full border-2 border-[#050505] bg-[#ccff00]"></div>
            <div className="w-8 h-8 rounded-full border-2 border-[#050505] bg-zinc-700"></div>
          </div>
          <span className="text-xs font-bold text-zinc-400">+12.4k Active Athletes</span>
        </div>
      </footer>

      {/* MongoDB Dynamic Side Console Cabinet */}
      {showMongoConsole && (
        <div className="fixed inset-0 z-[99999] flex justify-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/85 backdrop-blur-xs" onClick={() => setShowMongoConsole(false)}></div>

          {/* Console Draw-panel */}
          <div className="relative w-full max-w-lg bg-[#080808] border-l border-zinc-850 h-full flex flex-col shadow-2xl p-6 font-mono text-xs overflow-y-auto space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-850 pb-4">
              <div className="flex items-center gap-2">
                <Database className="text-[#ccff00] w-5 h-5 animate-bounce" />
                <div>
                  <h3 className="text-white font-extrabold tracking-wider uppercase text-sm">Offline Storage Console</h3>
                  <p className="text-[10px] text-zinc-500 font-mono">Local State Debugger [ACTIVE]</p>
                </div>
              </div>
              <button 
                onClick={() => setShowMongoConsole(false)}
                className="w-8 h-8 rounded-full bg-zinc-90 w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status indicators */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-zinc-950 rounded-2xl border border-zinc-900">
              <div>
                <span className="text-zinc-500 uppercase tracking-widest text-[9px] block">Active Data Records</span>
                <span className="text-[#ccff00] font-black text-xs">2 Modules (Members, Activity)</span>
              </div>
              <div>
                <span className="text-zinc-500 uppercase tracking-widest text-[9px] block">Storage Usage</span>
                <span className="text-white font-black text-xs">{(JSON.stringify(mongoUsers) + JSON.stringify(mongoBookings)).length * 2 + 54} Bytes</span>
              </div>
              <div>
                <span className="text-zinc-500 uppercase tracking-widest text-[9px] block">Total Registered</span>
                <span className="text-zinc-200 font-bold">{mongoUsers.length} Members</span>
              </div>
              <div>
                <span className="text-zinc-500 uppercase tracking-widest text-[9px] block">Total Scheduled</span>
                <span className="text-[#ccff00] font-bold">{mongoBookings.length} Bookings</span>
              </div>
            </div>

            {/* Quick Actions Console Panel */}
            <div className="space-y-3">
              <span className="text-[#ccff00] uppercase tracking-widest text-[9px] font-black">Quick Tools</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleDropDatabase}
                  className="bg-red-950/20 hover:bg-red-900/30 text-red-400 border border-red-900/30 rounded-xl p-3 flex flex-col justify-center gap-1 hover:border-red-500/50 transition-colors text-left cursor-pointer"
                >
                  <span className="font-extrabold text-[10px] tracking-wider uppercase text-red-200">Reset System Data</span>
                  <span className="text-[9px] text-red-400 font-normal">Wipe all simulated data</span>
                </button>

                <button
                  onClick={() => {
                    const randomId = "60e" + Math.floor(100000 + Math.random() * 900000).toString(16);
                    const mockUser = {
                      _id: `ObjectId("${randomId}")`,
                      name: "Alex Fitness Expert",
                      email: "alex.pro@gmail.com",
                      password: "alexpassword",
                      streakDays: 14,
                      caloriesBurned: 4200,
                      age: 28,
                      weight: 165,
                      height: 180,
                      gender: "Male",
                      fitnessGoals: ["Strength Training"],
                      createdAt: new Date().toISOString()
                    };
                    const updated = [...mongoUsers, mockUser];
                    localStorage.setItem('mongodb_users', JSON.stringify(updated));
                    setMongoUsers(updated);
                    triggerToast("Mock Teammate successfully added to the system.");
                  }}
                  className="bg-zinc-900/60 hover:bg-zinc-900 text-zinc-300 border border-zinc-800 hover:border-zinc-750 p-3 rounded-xl flex flex-col justify-center gap-1 transition-colors text-left cursor-pointer"
                >
                  <span className="font-extrabold text-[10px] tracking-wider uppercase text-[#ccff00]">Add Demo User</span>
                  <span className="text-[9px] text-zinc-500 font-normal">Create sample member profile</span>
                </button>
              </div>
            </div>

            {/* Collection Document Viewers */}
            <div className="space-y-4 flex-1 flex flex-col min-h-0">
              {/* Collection 1: Users */}
              <div className="space-y-2 flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center text-[10px] text-zinc-400 font-bold uppercase tracking-widest bg-zinc-950 p-2.5 rounded-lg border border-zinc-900">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500"></span> Collection: users
                  </span>
                  <span className="text-zinc-600 font-mono">BSON Hex format</span>
                </div>
                <div className="bg-black/95 rounded-2xl p-4 border border-zinc-900 overflow-auto text-[11px] font-mono text-zinc-300 flex-1 max-h-[160px]">
                  {mongoUsers.length === 0 ? (
                    <div className="text-zinc-650 italic py-4 text-center">
                      {"{ }"} empty collection. Register your first signup to write data to storage.
                    </div>
                  ) : (
                    <pre className="whitespace-pre text-cyan-400">{JSON.stringify(mongoUsers, null, 2)}</pre>
                  )}
                </div>
              </div>

              {/* Collection 2: Bookings */}
              <div className="space-y-2 flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center text-[10px] text-zinc-400 font-bold uppercase tracking-widest bg-zinc-950 p-2.5 rounded-lg border border-zinc-900">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse"></span> Collection: bookings
                  </span>
                  <span className="text-zinc-600 font-mono">Active relational query</span>
                </div>
                <div className="bg-black/95 rounded-2xl p-4 border border-zinc-900 overflow-auto text-[11px] font-mono text-zinc-300 flex-1 max-h-[160px]">
                  {mongoBookings.length === 0 ? (
                    <div className="text-zinc-650 italic py-4 text-center">
                      {"{ }"} empty collection. Book a high-energy workout class to create entries.
                    </div>
                  ) : (
                    <pre className="whitespace-pre text-fuchsia-400">{JSON.stringify(mongoBookings, null, 2)}</pre>
                  )}
                </div>
              </div>
            </div>

            {/* Quick help prompt */}
            <p className="text-[10px] text-zinc-600 leading-normal border-t border-zinc-900 pt-3">
              * Notice: Simulating real document schema storage structure on local storage. Dropping or updating collections immediately changes the application view flow context.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Custom Micro loading spinner component
function Spinner() {
  return (
    <div className="relative w-5 h-5">
      <div className="w-full h-full rounded-full border-2 border-white/10 border-t-[#ccff00] animate-spin"></div>
    </div>
  );
}
