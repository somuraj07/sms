import { Mark } from "../entities/Mark.entity";

export interface CreateMarkData {
  subject: string;
  marks: number;
  totalMarks: number;
  grade: string | null;
  suggestions: string | null;
  examId: string;
  studentId: string;
  classId: string;
  teacherId: string;
}

export interface IMarkRepository {
  create(data: CreateMarkData): Promise<Mark>;
  findById(id: string): Promise<Mark | null>;
  findByStudent(studentId: string, examId?: string): Promise<Mark[]>;
  findByClass(classId: string, examId: string): Promise<Mark[]>;
  findByExam(examId: string): Promise<Mark[]>;
  update(id: string, data: Partial<CreateMarkData>): Promise<Mark>;
}
