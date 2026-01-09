import { School } from "../entities/School.entity";

export interface CreateSchoolData {
  name: string;
  address: string;
  location: string;
  icon: string | null;
  pincode: string;
  district: string;
  state: string;
  city: string;
  subdomain: string | null;
}

export interface ISchoolRepository {
  create(data: CreateSchoolData): Promise<School>;
  findById(id: string): Promise<School | null>;
  findBySubdomain(subdomain: string): Promise<School | null>;
  findAll(): Promise<School[]>;
  update(id: string, data: Partial<CreateSchoolData>): Promise<School>;
  activate(id: string): Promise<School>;
  deactivate(id: string): Promise<School>;
  existsBySubdomain(subdomain: string): Promise<boolean>;
}
