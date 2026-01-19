import { ICommunicationRepository, CreateAppointmentData, CreateMessageData } from "@/domain/repositories/ICommunicationRepository";
import { Appointment, AppointmentStatus, ChatMessage } from "@/domain/entities/Communication.entity";
import prisma from "@/lib/db";

export class PrismaCommunicationRepository implements ICommunicationRepository {
  async createAppointment(data: CreateAppointmentData): Promise<Appointment> {
    const appointment = await prisma.appointment.create({ data });
    return this.toAppointmentEntity(appointment);
  }

  async findAppointmentById(id: string): Promise<Appointment | null> {
    const appointment = await prisma.appointment.findUnique({ where: { id } });
    return appointment ? this.toAppointmentEntity(appointment) : null;
  }

  async findAppointmentsByStudent(studentId: string): Promise<Appointment[]> {
    const appointments = await prisma.appointment.findMany({
      where: { studentId },
      orderBy: { createdAt: "desc" },
    });
    return appointments.map(this.toAppointmentEntity);
  }

  async findAppointmentsByTeacher(teacherId: string): Promise<Appointment[]> {
    const appointments = await prisma.appointment.findMany({
      where: { teacherId },
      orderBy: { createdAt: "desc" },
    });
    return appointments.map(this.toAppointmentEntity);
  }

  async updateAppointmentStatus(id: string, status: AppointmentStatus, scheduledAt?: Date): Promise<Appointment> {
    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        status,
        ...(scheduledAt && { scheduledAt }),
      },
    });
    return this.toAppointmentEntity(appointment);
  }

  async createMessage(data: CreateMessageData): Promise<ChatMessage> {
    const message = await prisma.chatMessage.create({ data });
    return this.toMessageEntity(message);
  }

  async findMessagesByAppointment(appointmentId: string): Promise<ChatMessage[]> {
    const messages = await prisma.chatMessage.findMany({
      where: { appointmentId },
      orderBy: { createdAt: "asc" },
    });
    return messages.map(this.toMessageEntity);
  }

  private toAppointmentEntity(prismaAppointment: any): Appointment {
    return new Appointment(
      prismaAppointment.id,
      prismaAppointment.studentId,
      prismaAppointment.teacherId,
      prismaAppointment.schoolId,
      prismaAppointment.requestedAt,
      prismaAppointment.scheduledAt,
      prismaAppointment.status,
      prismaAppointment.note,
      prismaAppointment.createdAt,
      prismaAppointment.updatedAt
    );
  }

  private toMessageEntity(prismaMessage: any): ChatMessage {
    return new ChatMessage(
      prismaMessage.id,
      prismaMessage.appointmentId,
      prismaMessage.senderId,
      prismaMessage.content,
      prismaMessage.createdAt
    );
  }
}
