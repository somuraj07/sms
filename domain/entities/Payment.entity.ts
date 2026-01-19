/**
 * Domain Entity - Payment
 */
export type PaymentStatus = "SUCCESS" | "FAILED" | "PENDING";

export class Payment {
  constructor(
    public readonly id: string,
    public readonly studentId: string,
    public readonly amount: number,
    public readonly razorpayOrderId: string,
    public readonly razorpayPaymentId: string,
    public readonly razorpaySignature: string,
    public readonly status: PaymentStatus,
    public readonly createdAt: Date
  ) {}

  /**
   * Domain method: Check if payment is successful
   */
  isSuccessful(): boolean {
    return this.status === "SUCCESS";
  }

  /**
   * Domain method: Check if payment is pending
   */
  isPending(): boolean {
    return this.status === "PENDING";
  }
}
