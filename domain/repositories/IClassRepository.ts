import { Class } from "../entities/Class.entity";

export interface CreateClassData {
  name: string;
  section: string | null;
  schoolId: string;
  teacherId: string | null;
}

export interface IClassRepository {
  create(data: CreateClassData): Promise<Class>;
  findById(id: string): Promise<Class | null>;
  findBySchool(schoolId: string): Promise<Class[]>;
  update(id: string, data: Partial<CreateClassData>): Promise<Class>;
  assignTeacher(classId: string, teacherId: string): Promise<Class>;
}
