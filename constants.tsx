
import { Staff, StaffCadre, StaffStatus, Client, ClientStatus, ServiceType, ServicePackage, Transaction, TransactionStatus, Timesheet, Task, TaskStatus, Gender, MaritalStatus } from './types';

export const NIGERIA_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", 
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT Abuja", "Gombe", 
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", 
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", 
  "Taraba", "Yobe", "Zamfara"
];

const today = new Date().toISOString().split('T')[0];

export const MOCK_STAFF: Staff[] = [
  {
    id: 's1',
    name: 'Dr. Chinedu Okafor',
    cadre: StaffCadre.DOCTOR,
    status: StaffStatus.ACTIVE,
    email: 'chinedu.o@carebridge.ng',
    mobileNumber: '+234 803 123 4567',
    gender: Gender.MALE,
    maritalStatus: MaritalStatus.MARRIED,
    education: {
      training: 'MBBS - University of Ibadan',
      completionYear: '2012'
    },
    joinedDate: '2023-10-15',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chinedu',
    verified: true,
    trainingCompleted: true,
    shadowingCompleted: true,
    state: 'Lagos',
    hourlyRate: 15000,
    registrationNumber: 'MDCN/6784/A'
  },
  {
    id: 's2',
    name: 'Amina Yusuf',
    cadre: StaffCadre.NURSE,
    status: StaffStatus.ACTIVE,
    email: 'amina.y@carebridge.ng',
    mobileNumber: '+234 810 987 6543',
    gender: Gender.FEMALE,
    maritalStatus: MaritalStatus.SINGLE,
    education: {
      training: 'B.NSc - Ahmadu Bello University',
      completionYear: '2018'
    },
    joinedDate: '2024-01-20',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amina',
    verified: true,
    trainingCompleted: true,
    shadowingCompleted: true,
    state: 'FCT Abuja',
    hourlyRate: 8000,
    registrationNumber: 'NMCN/22091/B'
  },
  {
    id: 's3',
    name: 'Olawale Adenuga',
    cadre: StaffCadre.CARER,
    status: StaffStatus.PENDING_VERIFICATION,
    email: 'olawale.a@carebridge.ng',
    mobileNumber: '+234 905 555 1234',
    gender: Gender.MALE,
    maritalStatus: MaritalStatus.MARRIED,
    education: {
      training: 'First Aid & Geriatric Care Cert.',
      completionYear: '2021'
    },
    joinedDate: '2024-02-01',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Olawale',
    verified: false,
    trainingCompleted: false,
    shadowingCompleted: false,
    state: 'Ogun',
    hourlyRate: 4000
  }
];

export const MOCK_CLIENTS: Client[] = [
  {
    id: 'c1',
    name: 'Chief Robert Thompson',
    email: 'robert.t@yahoo.com',
    serviceType: ServiceType.LIVE_IN,
    status: ClientStatus.ACTIVE,
    assignedStaffIds: ['s1', 's2', 's8'],
    signupDate: '2023-11-05',
    carePlan: 'Post-stroke rehabilitation and daily monitoring of vitals. Requires physical therapy 3x weekly.',
    state: 'Lagos',
    balance: 0,
    age: 72,
    gender: Gender.MALE
  },
  {
    id: 'c2',
    name: 'Alhaji Musa Chen',
    email: 'musa.c@gmail.com',
    serviceType: ServiceType.DAILY_VISIT,
    status: ClientStatus.ONBOARDING,
    assignedStaffIds: ['s4'],
    signupDate: '2024-02-10',
    state: 'Kano',
    balance: 150000,
    age: 65,
    gender: Gender.MALE
  },
  {
    id: 'c3',
    name: 'Mrs. Funke Akindele',
    email: 'funke.a@hotmail.com',
    serviceType: ServiceType.NIGHT_CARE,
    status: ClientStatus.ACTIVE,
    assignedStaffIds: ['s2', 's7'],
    signupDate: '2024-01-15',
    carePlan: 'Elderly companionship and nighttime assistance for dementia patient.',
    state: 'Oyo',
    balance: 50000,
    age: 78,
    gender: Gender.FEMALE
  },
  {
    id: 'c4',
    name: 'Dr. Emmanuel Eke',
    email: 'e.eke@med.ng',
    serviceType: ServiceType.LIVE_IN,
    status: ClientStatus.ACTIVE,
    assignedStaffIds: ['s1', 's5'],
    signupDate: '2023-12-01',
    carePlan: 'Comprehensive geriatric care for retired surgeon. Focus on nutrition and mobility.',
    state: 'Rivers',
    balance: 0,
    age: 85,
    gender: Gender.MALE
  },
  {
    id: 'c5',
    name: 'Madam Elizabeth Solanke',
    email: 'lizzy.s@gmail.com',
    serviceType: ServiceType.DAILY_VISIT,
    status: ClientStatus.ACTIVE,
    assignedStaffIds: ['s8'],
    signupDate: '2024-02-01',
    carePlan: 'Daily companionship and assistance with mobility for a post-op recovery client.',
    state: 'Lagos',
    balance: 25000,
    age: 81,
    gender: Gender.FEMALE
  }
];

export const MOCK_TASKS: Task[] = [
  {
    id: 't-1',
    staffId: 's1',
    clientId: 'c1',
    date: today,
    time: '08:00',
    title: 'Morning Vitals Check',
    description: 'Check BP, Heart Rate and Respiratory Rate.',
    status: TaskStatus.YET_TO_START,
    comments: ''
  },
  {
    id: 't-2',
    staffId: 's1',
    clientId: 'c1',
    date: today,
    time: '09:30',
    title: 'Medication Administration',
    description: 'Administer prescribed neuro-protective agents.',
    status: TaskStatus.YET_TO_START,
    comments: ''
  },
  {
    id: 't-3',
    staffId: 's8',
    clientId: 'c1',
    date: today,
    time: '11:00',
    title: 'Mobility Support Session',
    description: 'Assisted walking around the garden for Chief Thompson.',
    status: TaskStatus.YET_TO_START,
    comments: ''
  },
  {
    id: 't-4',
    staffId: 's8',
    clientId: 'c5',
    date: today,
    time: '14:00',
    title: 'Post-Op Physical Therapy',
    description: 'Assisting Madam Solanke with lower limb recovery exercises.',
    status: TaskStatus.YET_TO_START,
    comments: ''
  }
];

export const SERVICE_PACKAGES: ServicePackage[] = [
  { 
    id: 'p1', 
    name: 'Elderly Care & Companionship', 
    description: 'Maintaining dignity and independence. Personalised hygiene, mobility support, and meaningful social engagement.', 
    hourlyRate: 4500, 
    cadreRequired: StaffCadre.CARER 
  },
  { 
    id: 'p2', 
    name: 'Post-Surgical & Medical Recovery', 
    description: 'Expert clinical support for hospital-to-home transition. Skilled nursing, wound dressing, and pain management.', 
    hourlyRate: 12000, 
    cadreRequired: StaffCadre.NURSE 
  },
  { 
    id: 'p3', 
    name: 'Maternity & Post-Partum Support', 
    description: 'Nurturing care for mother and newborn. Neonatal cord care, sleep settling, and nutritional guidance.', 
    hourlyRate: 10000, 
    cadreRequired: StaffCadre.NURSE 
  },
  { 
    id: 'p4', 
    name: 'Specialist Rehabilitation', 
    description: 'Home-based professional intervention to restore mobility and occupational independence.', 
    hourlyRate: 25000, 
    cadreRequired: StaffCadre.DOCTOR 
  }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', date: '2024-03-01', amount: 450000, type: 'income', description: 'Monthly Subscription - Robert Thompson', status: TransactionStatus.COMPLETED, relatedEntityId: 'c1' },
  { id: 't2', date: '2024-03-05', amount: 120000, type: 'expense', description: 'Salary Payout - Dr. Chinedu Okafor', status: TransactionStatus.COMPLETED, relatedEntityId: 's1' },
  { id: 't3', date: '2024-03-10', amount: 250000, type: 'income', description: 'Initial Deposit - Musa Chen', status: TransactionStatus.COMPLETED, relatedEntityId: 'c2' }
];

export const MOCK_TIMESHEETS: Timesheet[] = [
  { id: 'ts1', staffId: 's1', month: '2024-03', hoursWorked: 160, totalEarnings: 2400000, payoutStatus: 'Paid' },
  { id: 'ts2', staffId: 's2', month: '2024-03', hoursWorked: 45, totalEarnings: 360000, payoutStatus: 'Pending' },
  { id: 'ts3', staffId: 's1', month: '2024-04', hoursWorked: 20, totalEarnings: 300000, payoutStatus: 'Pending' },
  { id: 'ts4', staffId: 's8', month: '2024-03', hoursWorked: 120, totalEarnings: 600000, payoutStatus: 'Paid' }
];
