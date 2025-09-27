import { Request, Response } from 'express';
import { membershipService } from '../services/membershipService';
import { CreateMembershipInput, UpdateMembershipInput } from '../dto/MembershipDTO';
import { ERROR_MESSAGES } from '../utils/errorMessages';

export class MembershipController {
  
  getAllMemberships = async (req: Request, res: Response) => {
    try {
      const memberships = await membershipService.findAll();
      return res.status(200).json(memberships);
    } catch (error: any) {
      return res.status(500).json({ message: 'Error retrieving memberships', error: error.message });
    }
  };

  getMembershipById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ message: 'Membership ID is required' });
      const membershipFound = await membershipService.findMembershipById(id);
      return res.status(200).json(membershipFound);
    } catch (error) {
      const err = error as Error;
      if (err.message === ERROR_MESSAGES.MEMBERSHIP_NOT_FOUND) {
        return res.status(404).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Error retrieving membership', error: err.message });
    }
  };

  createMembership = async (req: Request, res: Response) => {
    try {
      const newMembershipData = req.body as CreateMembershipInput;
      const createdMembership = await membershipService.createNewMembership(newMembershipData);
      return res.status(201).json(createdMembership);
    } catch (error) {
      const err = error as Error;
      if (err.message === ERROR_MESSAGES.MEMBERSHIP_NAME_ALREADY_EXISTS) {
        return res.status(409).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Error creating membership', error: err.message });
    }
  };

  updateMembership = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ message: 'Membership ID is required' });
      const updateData = req.body as UpdateMembershipInput;
      const updatedMembership = await membershipService.updateExistingMembership(id, updateData);
      return res.status(200).json(updatedMembership);
    } catch (error) {
      const err = error as Error;
      if (err.message === ERROR_MESSAGES.MEMBERSHIP_NOT_FOUND) {
        return res.status(404).json({ message: err.message });
      }
      if (err.message === ERROR_MESSAGES.MEMBERSHIP_NAME_ALREADY_EXISTS) {
        return res.status(409).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Error updating membership', error: err.message });
    }
  };

  deleteMembership = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ message: 'Membership ID is required' });
      await membershipService.removeMembership(id);
      return res.status(204).end();
    } catch (error) {
      const err = error as Error;
      if (err.message === ERROR_MESSAGES.MEMBERSHIP_NOT_FOUND) {
        return res.status(404).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Error deleting membership', error: err.message });
    }
  };

  toggleMembershipStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ message: 'Membership ID is required' });
      const updatedMembership = await membershipService.toggleMembershipStatus(id);
      return res.status(200).json(updatedMembership);
    } catch (error) {
      const err = error as Error;
      if (err.message === ERROR_MESSAGES.MEMBERSHIP_NOT_FOUND) {
        return res.status(404).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Error toggling membership status', error: err.message });
    }
  };
}
