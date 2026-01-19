import { Homework } from "../entities/Homework.entity";

export interface CreateHomeworkData {
  title: string;
  description: string;
  subject: string;
  dueDate: Date | null;
  classId: string;
  teacherId: string;
  schoolId: string;
}

export interface IHomeworkRepository {
  create(data: CreateHomeworkData): Promise<Homework>;
  findById(id: string): Promise<Homework | null>;
  findByClass(classId: string): Promise<Homework[]>;
  findByTeacher(teacherId: string): Promise<Homework[]>;
  findByStudent(studentId: string): Promise<Homework[]>;
  update(id: string, data: Partial<CreateHomeworkData>): Promise<Homework>;
  delete(id: string): Promise<void>;
}
