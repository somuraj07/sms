/**
 * Domain Entity - School/College
 * Pure business logic, no dependencies on infrastructure
 */
export class School {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly address: string,
    public readonly location: string,
    public readonly icon: string | null,
    public readonly pincode: string,
    public readonly district: string,
    public readonly state: string,
    public readonly city: string,
    public readonly subdomain: string | null,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Domain method: Check if school is active
   */
  isActiveSchool(): boolean {
    return this.isActive;
  }

  /**
   * Domain method: Get subdomain URL format
   */
  getSubdomainUrl(baseDomain: string): string | null {
    if (!this.subdomain) return null;
    return `${this.subdomain}.${baseDomain}`;
  }

  /**
   * Domain method: Validate subdomain format
   */
  static isValidSubdomain(subdomain: string): boolean {
    // Subdomain should be lowercase, alphanumeric with hyphens
    const subdomainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
    return subdomainRegex.test(subdomain) && subdomain.length >= 3 && subdomain.length <= 63;
  }
}
