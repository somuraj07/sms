import { Teacher } from "../entities/Teacher.entity";

export interface CreateTeacherData {
  userId: string;
  schoolId: string;
  mobile: string | null;
  subjectsTaught: string | null;
  isLeaveApprover: boolean;
}

export interface ITeacherRepository {
  create(data: CreateTeacherData): Promise<Teacher>;
  findById(id: string): Promise<Teacher | null>;
  findByUserId(userId: string): Promise<Teacher | null>;
  findBySchool(schoolId: string): Promise<Teacher[]>;
  update(id: string, data: Partial<CreateTeacherData>): Promise<Teacher>;
}
