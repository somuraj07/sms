/**
 * Domain Entity - Student
 */
import { Gender } from "./Hostel.entity";

export class Student {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly schoolId: string,
    public readonly classId: string | null,
    public readonly admissionNo: string,
    public readonly fatherName: string,
    public readonly aadhaarNo: string,
    public readonly phoneNo: string,
    public readonly rollNo: string | null,
    public readonly dob: Date,
    public readonly address: string | null,
    public readonly gender: Gender,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Domain method: Check if student is assigned to a class
   */
  isAssignedToClass(): boolean {
    return this.classId !== null;
  }
}
