import { Appointment, AppointmentStatus, ChatMessage } from "../entities/Communication.entity";

export interface CreateAppointmentData {
  studentId: string;
  teacherId: string;
  schoolId: string;
  note: string | null;
}

export interface CreateMessageData {
  appointmentId: string;
  senderId: string;
  content: string;
}

export interface ICommunicationRepository {
  // Appointments
  createAppointment(data: CreateAppointmentData): Promise<Appointment>;
  findAppointmentById(id: string): Promise<Appointment | null>;
  findAppointmentsByStudent(studentId: string): Promise<Appointment[]>;
  findAppointmentsByTeacher(teacherId: string): Promise<Appointment[]>;
  updateAppointmentStatus(id: string, status: AppointmentStatus, scheduledAt?: Date): Promise<Appointment>;
  
  // Messages
  createMessage(data: CreateMessageData): Promise<ChatMessage>;
  findMessagesByAppointment(appointmentId: string): Promise<ChatMessage[]>;
}
