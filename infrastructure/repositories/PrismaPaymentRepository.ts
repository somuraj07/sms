import { IPaymentRepository, CreatePaymentData } from "@/domain/repositories/IPaymentRepository";
import { Payment } from "@/domain/entities/Payment.entity";
import prisma from "@/lib/db";

export class PrismaPaymentRepository implements IPaymentRepository {
  async create(data: CreatePaymentData): Promise<Payment> {
    const payment = await prisma.payment.create({ data });
    return this.toPaymentEntity(payment);
  }

  async findById(id: string): Promise<Payment | null> {
    const payment = await prisma.payment.findUnique({ where: { id } });
    return payment ? this.toPaymentEntity(payment) : null;
  }

  async findByStudent(studentId: string): Promise<Payment[]> {
    const payments = await prisma.payment.findMany({
      where: { studentId },
      orderBy: { createdAt: "desc" },
    });
    return payments.map(this.toPaymentEntity);
  }

  async findByOrderId(orderId: string): Promise<Payment | null> {
    const payment = await prisma.payment.findFirst({
      where: { razorpayOrderId: orderId },
    });
    return payment ? this.toPaymentEntity(payment) : null;
  }

  async updateStatus(id: string, status: string): Promise<Payment> {
    const payment = await prisma.payment.update({
      where: { id },
      data: { status },
    });
    return this.toPaymentEntity(payment);
  }

  private toPaymentEntity(prismaPayment: any): Payment {
    return new Payment(
      prismaPayment.id,
      prismaPayment.studentId,
      prismaPayment.amount,
      prismaPayment.razorpayOrderId,
      prismaPayment.razorpayPaymentId,
      prismaPayment.razorpaySignature,
      prismaPayment.status,
      prismaPayment.createdAt
    );
  }
}
