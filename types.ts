
export enum StaffCadre {
  DOCTOR = 'Doctor',
  NURSE = 'Nurse',
  CARER = 'Carer',
  CARE_ASSISTANT = 'Care Assistant',
  COOK = 'Cook'
}

export enum StaffStatus {
  PENDING_VERIFICATION = 'Pending Verification',
  VERIFIED = 'Verified',
  TRAINING = 'In Training',
  SHADOWING = 'Shadowing',
  ACTIVE = 'Active',
  ON_BREAK = 'On Break'
}

export enum MaritalStatus {
  SINGLE = 'Single',
  MARRIED = 'Married',
  DIVORCED = 'Divorced',
  WIDOWED = 'Widowed'
}

export enum ServiceType {
  LIVE_IN = 'Live-in Care',
  DAILY_VISIT = 'Daily Visit',
  NIGHT_CARE = 'Night Care'
}

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other'
}

export enum ClientStatus {
  ONBOARDING = 'Onboarding',
  VERIFICATION = 'Verification',
  PAYMENT_PENDING = 'Payment Pending',
  ACTIVE = 'Active',
  INACTIVE = 'Inactive'
}

export enum TransactionStatus {
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  FAILED = 'Failed'
}

export enum TaskStatus {
  YET_TO_START = 'yet to start',
  STARTED = 'started',
  IN_PROGRESS = 'in progress',
  PENDING = 'pending',
  COMPLETED = 'completed'
}

export enum TaskTiming {
  EARLY = 'Early',
  ON_TIME = 'On Time',
  LATE = 'Late'
}

export interface VerificationSource {
  title: string;
  uri: string;
}

export interface VerificationReport {
  summary: string;
  sources: VerificationSource[];
  verifiedAt: string;
}

export interface Staff {
  id: string;
  name: string;
  cadre: StaffCadre;
  status: StaffStatus;
  email: string;
  mobileNumber: string;
  gender: Gender;
  maritalStatus: MaritalStatus;
  education: {
    training: string;
    completionYear: string;
  };
  joinedDate: string;
  avatar: string;
  verified: boolean;
  trainingCompleted: boolean;
  shadowingCompleted: boolean;
  state: string;
  hourlyRate?: number;
  registrationNumber?: string;
  verificationReport?: VerificationReport;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  serviceType: ServiceType;
  status: ClientStatus;
  carePlan?: string;
  assignedStaffIds: string[];
  signupDate: string;
  state: string;
  balance?: number;
  age: number;
  gender: Gender;
  reviewers?: string[];
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  status: TransactionStatus;
  relatedEntityId: string;
}

export interface Timesheet {
  id: string;
  staffId: string;
  month: string;
  hoursWorked: number;
  totalEarnings: number;
  payoutStatus: 'Pending' | 'Paid';
}

export interface ServicePackage {
  id: string;
  name: string;
  description: string;
  hourlyRate: number;
  cadreRequired: StaffCadre;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
}

export interface Task {
  id: string;
  staffId: string;
  clientId: string;
  date: string;
  time: string;
  title: string;
  description: string;
  status: TaskStatus;
  comments?: string;
  completedAt?: string;
  timingResult?: TaskTiming;
}

export interface DailyReport {
  id: string;
  staffId: string;
  clientId: string;
  date: string;
  content: string;
  submittedAt: string;
  isFinalized: boolean;
  mood?: 'excellent' | 'good' | 'stable' | 'concerning';
  clientFeedback?: string;
  clientFeedbackAt?: string;
  adminReply?: string;
  adminReplyAt?: string;
  adminFlagged?: boolean;
}

export type View = 'dashboard' | 'staff' | 'clients' | 'services' | 'assignments' | 'accounting' | 'reporting';
