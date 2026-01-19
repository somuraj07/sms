/**
 * Super Admin DTOs for Frontend
 */

export interface CollegeDTO {
  id: string;
  name: string;
  subdomain: string;
  isActive: boolean;
  studentCount: number;
  teacherCount: number;
  admin: {
    id: string;
    name: string;
    email: string;
    mobile: string | null;
  } | null;
  createdAt: Date;
}

export interface SuperAdminDashboardDTO {
  totalColleges: number;
  activeColleges: number;
  totalStudents: number;
  totalTeachers: number;
  totalDepartments: number;
  totalStorageGB: number;
  colleges: CollegeDTO[];
}

export interface TransactionDTO {
  id: string;
  studentName: string;
  studentEmail: string;
  schoolName: string;
  schoolId: string;
  schoolSubdomain: string | null;
  amount: number;
  status: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  date: Date;
}
