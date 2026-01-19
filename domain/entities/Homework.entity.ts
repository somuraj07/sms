/**
 * Domain Entity - Homework
 */
export class Homework {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string,
    public readonly subject: string,
    public readonly dueDate: Date | null,
    public readonly classId: string,
    public readonly teacherId: string,
    public readonly schoolId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Domain method: Check if homework is overdue
   */
  isOverdue(): boolean {
    if (!this.dueDate) return false;
    return new Date() > this.dueDate;
  }

  /**
   * Domain method: Check if homework is due soon (within 24 hours)
   */
  isDueSoon(): boolean {
    if (!this.dueDate) return false;
    const hoursUntilDue = (this.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60);
    return hoursUntilDue > 0 && hoursUntilDue <= 24;
  }
}
