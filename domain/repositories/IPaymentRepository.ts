import { Payment, PaymentStatus } from "../entities/Payment.entity";

export interface CreatePaymentData {
  studentId: string;
  amount: number;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  status: PaymentStatus;
}

export interface IPaymentRepository {
  create(data: CreatePaymentData): Promise<Payment>;
  findById(id: string): Promise<Payment | null>;
  findByStudent(studentId: string): Promise<Payment[]>;
  findByOrderId(orderId: string): Promise<Payment | null>;
  updateStatus(id: string, status: PaymentStatus): Promise<Payment>;
}
