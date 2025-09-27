import { CreateMembershipInput, UpdateMembershipInput } from '../dto/MembershipDTO';

export interface IMembershipService {
  findMembershipById(membershipId: string): Promise<any>;
  findAll(): Promise<any>;
  createNewMembership(membershipData: CreateMembershipInput): Promise<any>;
  updateExistingMembership(membershipId: string, updateData: UpdateMembershipInput): Promise<any>;
  removeMembership(membershipId: string): Promise<void>;
  toggleMembershipStatus(membershipId: string): Promise<any>;
}
