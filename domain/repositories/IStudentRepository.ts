import { Student } from "../entities/Student.entity";
import { Gender } from "../entities/Hostel.entity";

export interface CreateStudentData {
  userId: string;
  schoolId: string;
  classId: string | null;
  admissionNo: string;
  fatherName: string;
  aadhaarNo: string;
  phoneNo: string;
  rollNo: string | null;
  dob: Date;
  address: string | null;
  gender: Gender;
}

export interface IStudentRepository {
  create(data: CreateStudentData): Promise<Student>;
  findById(id: string): Promise<Student | null>;
  findByUserId(userId: string): Promise<Student | null>;
  findBySchool(schoolId: string, classId?: string): Promise<Student[]>;
  findByAdmissionNo(admissionNo: string, schoolId: string): Promise<Student | null>;
  update(id: string, data: Partial<CreateStudentData>): Promise<Student>;
  assignToClass(studentId: string, classId: string): Promise<Student>;
  existsByAdmissionNo(admissionNo: string, schoolId: string): Promise<boolean>;
  existsByAadhaar(aadhaarNo: string, schoolId: string): Promise<boolean>;
}
