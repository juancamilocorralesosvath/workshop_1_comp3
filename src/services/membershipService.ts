import { Membership } from '../models/Membership';
import { generateMembershipId } from '../utils/generateId';
import { ERROR_MESSAGES } from '../utils/errorMessages';

import { IMembershipService } from '../interfaces/IMembershipService';
import { CreateMembershipInput, UpdateMembershipInput } from '../dto/MembershipDTO';

class MembershipService implements IMembershipService {
 
  async findMembershipById(membershipId: string): Promise<any> {
    const membership = await Membership.findOne({ id: membershipId });

    if (!membership) {
      throw new Error(ERROR_MESSAGES.MEMBERSHIP_NOT_FOUND);
    }

    return membership;
  }

  async findAll(): Promise<any> {
    try {
      const memberships = await Membership.find();
      return memberships;
    } catch (error) {
      throw error;
    }
  }

  async createNewMembership(membershipData: CreateMembershipInput): Promise<any> {
    await this.validateNameIsUnique(membershipData.name);

    const uniqueMembershipId = generateMembershipId();

    const newMembership = await this.buildAndSaveMembership(membershipData, uniqueMembershipId);

    return await this.getMembershipById(newMembership.id);
  }

  async updateExistingMembership(membershipId: string, updateData: UpdateMembershipInput): Promise<any> {
    const existingMembership = await this.findMembershipEntityById(membershipId);

    if (updateData.name && updateData.name !== existingMembership.name) {
      await this.validateNameIsUnique(updateData.name);
    }

    this.applyUpdatesToMembership(existingMembership, updateData);
    await existingMembership.save();

    return await this.getMembershipById(existingMembership.id);
  }

  async removeMembership(membershipId: string): Promise<void> {
    const membershipToDelete = await this.findMembershipEntityById(membershipId);
    await Membership.findByIdAndDelete(membershipToDelete._id);
  }

  async toggleMembershipStatus(membershipId: string): Promise<any> {
    const membershipToToggle = await this.findMembershipEntityById(membershipId);

    membershipToToggle.status = !membershipToToggle.status;
    await membershipToToggle.save();

    return await this.getMembershipById(membershipToToggle.id);
  }

  private async validateNameIsUnique(name: string): Promise<void> {
    const existingMembership = await Membership.findOne({ name });
    if (existingMembership) {
      throw new Error(ERROR_MESSAGES.MEMBERSHIP_NAME_ALREADY_EXISTS);
    }
  }

  private async buildAndSaveMembership(membershipData: CreateMembershipInput, membershipId: string) {
    const newMembership = new Membership({
      id: membershipId,
      name: membershipData.name,
      cost: membershipData.cost,
      status: membershipData.status ?? true,
      max_classes_assistance: membershipData.max_classes_assistance,
      max_gym_assistance: membershipData.max_gym_assistance,
      duration_months: membershipData.duration_months
    });

    await newMembership.save();
    return newMembership;
  }

  private async findMembershipEntityById(membershipId: string) {
    const membership = await Membership.findOne({ id: membershipId });
    if (!membership) {
      throw new Error(ERROR_MESSAGES.MEMBERSHIP_NOT_FOUND);
    }
    return membership;
  }

  private async getMembershipById(membershipId: string) {
    return await Membership.findOne({ id: membershipId });
  }

  private applyUpdatesToMembership(membership: any, updateData: UpdateMembershipInput): void {
    if (updateData.name) membership.name = updateData.name;
    if (updateData.cost !== undefined) membership.cost = updateData.cost;
    if (updateData.status !== undefined) membership.status = updateData.status;
    if (updateData.max_classes_assistance !== undefined) membership.max_classes_assistance = updateData.max_classes_assistance;
    if (updateData.max_gym_assistance !== undefined) membership.max_gym_assistance = updateData.max_gym_assistance;
    if (updateData.duration_months !== undefined) membership.duration_months = updateData.duration_months;
  }
}

export const membershipService = new MembershipService();
