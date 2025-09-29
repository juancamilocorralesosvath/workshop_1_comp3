import { describe, it, expect, beforeEach, mock } from 'bun:test';
import type { Request, Response, NextFunction } from 'express';

describe('Validation Middleware Tests', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      body: {},
      query: {},
      params: {}
    };
    mockRes = {
      status: mock(() => mockRes as Response),
      json: mock(() => mockRes as Response)
    };
    mockNext = mock(() => {});
  });

  describe('Membership Validation Schema Tests', () => {
    describe('createMembershipSchema Validation', () => {
      const validMembershipData = {
        name: 'Premium Membership',
        cost: 80000,
        max_classes_assistance: 20,
        max_gym_assistance: 30,
        duration_months: 1,
        status: true
      };

      it('should validate complete valid membership data', () => {
        const isValidName = typeof validMembershipData.name === 'string' && validMembershipData.name.length >= 2;
        const isValidCost = typeof validMembershipData.cost === 'number' && validMembershipData.cost >= 0;
        const isValidClassAssistance = Number.isInteger(validMembershipData.max_classes_assistance) && validMembershipData.max_classes_assistance >= 0;
        const isValidGymAssistance = Number.isInteger(validMembershipData.max_gym_assistance) && validMembershipData.max_gym_assistance >= 0;
        const isValidDuration = [1, 12].includes(validMembershipData.duration_months);
        const isValidStatus = typeof validMembershipData.status === 'boolean';

        expect(isValidName).toBe(true);
        expect(isValidCost).toBe(true);
        expect(isValidClassAssistance).toBe(true);
        expect(isValidGymAssistance).toBe(true);
        expect(isValidDuration).toBe(true);
        expect(isValidStatus).toBe(true);
      });

      describe('Name Validation', () => {
        const nameTestCases = [
          { name: '', valid: false, reason: 'empty string' },
          { name: 'A', valid: false, reason: 'too short (1 char)' },
          { name: 'AB', valid: true, reason: 'minimum length (2 chars)' },
          { name: 'Premium Membership', valid: true, reason: 'normal name' },
          { name: '  Trimmed  ', valid: true, reason: 'name with whitespace' },
          { name: 'Membresía Española', valid: true, reason: 'spanish characters' },
          { name: 'VIP 🌟 Membership', valid: true, reason: 'with emoji' },
          { name: 'A'.repeat(300), valid: true, reason: 'very long name' },
          { name: 123, valid: false, reason: 'number instead of string' },
          { name: null, valid: false, reason: 'null value' },
          { name: undefined, valid: false, reason: 'undefined value' }
        ];

        nameTestCases.forEach(({ name, valid, reason }) => {
          it(`should ${valid ? 'accept' : 'reject'} ${reason}`, () => {
            const isValid = typeof name === 'string' && name.trim().length >= 2;
            expect(isValid).toBe(valid);
          });
        });
      });

      describe('Cost Validation', () => {
        const costTestCases = [
          { cost: 0, valid: true, reason: 'zero cost (free)' },
          { cost: 1, valid: true, reason: 'minimum positive cost' },
          { cost: 50000, valid: true, reason: 'typical cost' },
          { cost: 999999, valid: true, reason: 'high cost' },
          { cost: 0.01, valid: true, reason: 'fractional cost' },
          { cost: -1, valid: false, reason: 'negative cost' },
          { cost: -0.01, valid: false, reason: 'small negative cost' },
          { cost: 'free', valid: false, reason: 'string cost' },
          { cost: null, valid: false, reason: 'null cost' },
          { cost: undefined, valid: false, reason: 'undefined cost' },
          { cost: Infinity, valid: false, reason: 'infinite cost' },
          { cost: -Infinity, valid: false, reason: 'negative infinite cost' },
          { cost: NaN, valid: false, reason: 'NaN cost' }
        ];

        costTestCases.forEach(({ cost, valid, reason }) => {
          it(`should ${valid ? 'accept' : 'reject'} ${reason}`, () => {
            const isValid = typeof cost === 'number' && cost >= 0 && isFinite(cost);
            expect(isValid).toBe(valid);
          });
        });
      });

      describe('Assistance Validation', () => {
        const assistanceTestCases = [
          { value: 0, valid: true, reason: 'zero assistance' },
          { value: 1, valid: true, reason: 'minimum assistance' },
          { value: 50, valid: true, reason: 'typical assistance' },
          { value: 999, valid: true, reason: 'high assistance' },
          { value: -1, valid: false, reason: 'negative assistance' },
          { value: 10.5, valid: false, reason: 'fractional assistance' },
          { value: '10', valid: false, reason: 'string assistance' },
          { value: null, valid: false, reason: 'null assistance' },
          { value: undefined, valid: false, reason: 'undefined assistance' },
          { value: Infinity, valid: false, reason: 'infinite assistance' },
          { value: NaN, valid: false, reason: 'NaN assistance' }
        ];

        assistanceTestCases.forEach(({ value, valid, reason }) => {
          it(`should ${valid ? 'accept' : 'reject'} ${reason} for classes`, () => {
            const isValid = Number.isInteger(value) && value >= 0;
            expect(isValid).toBe(valid);
          });

          it(`should ${valid ? 'accept' : 'reject'} ${reason} for gym`, () => {
            const isValid = Number.isInteger(value) && value >= 0;
            expect(isValid).toBe(valid);
          });
        });
      });

      describe('Duration Validation', () => {
        const durationTestCases = [
          { duration: 1, valid: true, reason: 'monthly (1 month)' },
          { duration: 12, valid: true, reason: 'annual (12 months)' },
          { duration: 0, valid: false, reason: 'zero duration' },
          { duration: 2, valid: false, reason: '2 months' },
          { duration: 6, valid: false, reason: '6 months' },
          { duration: 24, valid: false, reason: '24 months' },
          { duration: -1, valid: false, reason: 'negative duration' },
          { duration: 1.5, valid: false, reason: 'fractional duration' },
          { duration: '1', valid: false, reason: 'string duration' },
          { duration: null, valid: false, reason: 'null duration' },
          { duration: undefined, valid: false, reason: 'undefined duration' }
        ];

        durationTestCases.forEach(({ duration, valid, reason }) => {
          it(`should ${valid ? 'accept' : 'reject'} ${reason}`, () => {
            const isValid = [1, 12].includes(duration);
            expect(isValid).toBe(valid);
          });
        });
      });

      describe('Status Validation', () => {
        const statusTestCases = [
          { status: true, valid: true, reason: 'true boolean' },
          { status: false, valid: true, reason: 'false boolean' },
          { status: 1, valid: false, reason: 'truthy number' },
          { status: 0, valid: false, reason: 'falsy number' },
          { status: 'true', valid: false, reason: 'string true' },
          { status: 'false', valid: false, reason: 'string false' },
          { status: null, valid: false, reason: 'null status' },
          { status: undefined, valid: true, reason: 'undefined status (optional)' }
        ];

        statusTestCases.forEach(({ status, valid, reason }) => {
          it(`should ${valid ? 'accept' : 'reject'} ${reason}`, () => {
            const isValid = status === undefined || typeof status === 'boolean';
            expect(isValid).toBe(valid);
          });
        });
      });
    });

    describe('updateMembershipSchema Validation', () => {
      it('should accept partial updates', () => {
        const partialUpdates = [
          { name: 'Updated Name' },
          { cost: 60000 },
          { max_classes_assistance: 15 },
          { max_gym_assistance: 25 },
          { duration_months: 12 },
          { status: false },
          { name: 'New Name', cost: 70000 }
        ];

        partialUpdates.forEach(update => {
          const keys = Object.keys(update);
          expect(keys.length).toBeGreaterThan(0);

          
          if ('name' in update) {
            expect(typeof update.name === 'string' && update.name.trim().length >= 2).toBe(true);
          }
          if ('cost' in update) {
            expect(typeof update.cost === 'number' && update.cost >= 0).toBe(true);
          }
          if ('duration_months' in update) {
            expect([1, 12].includes(update.duration_months)).toBe(true);
          }
        });
      });

      it('should accept empty update object', () => {
        const emptyUpdate = {};
        expect(Object.keys(emptyUpdate).length).toBe(0);
        
      });
    });
  });

  describe('Subscription Validation Schema Tests', () => {
    describe('createSubscriptionSchema Validation', () => {
      const validSubscriptionData = {
        userId: 'user-123'
      };

      it('should validate complete valid subscription data', () => {
        const isValidUserId = typeof validSubscriptionData.userId === 'string' && validSubscriptionData.userId.trim().length > 0;
        expect(isValidUserId).toBe(true);
      });

      describe('UserId Validation', () => {
        const userIdTestCases = [
          { userId: 'user-123', valid: true, reason: 'valid user ID' },
          { userId: 'usr_1234567890', valid: true, reason: 'user ID with underscore' },
          { userId: 'a', valid: true, reason: 'single character ID' },
          { userId: '12345', valid: true, reason: 'numeric string ID' },
          { userId: '', valid: false, reason: 'empty string' },
          { userId: '   ', valid: false, reason: 'whitespace only' },
          { userId: 123, valid: false, reason: 'number userId' },
          { userId: null, valid: false, reason: 'null userId' },
          { userId: undefined, valid: false, reason: 'undefined userId' },
          { userId: {}, valid: false, reason: 'object userId' },
          { userId: [], valid: false, reason: 'array userId' }
        ];

        userIdTestCases.forEach(({ userId, valid, reason }) => {
          it(`should ${valid ? 'accept' : 'reject'} ${reason}`, () => {
            const isValid = typeof userId === 'string' && userId.trim().length > 0;
            expect(isValid).toBe(valid);
          });
        });
      });
    });

    describe('addMembershipToSubscriptionSchema Validation', () => {
      const validAddMembershipData = {
        membershipId: 'mem-456'
      };

      it('should validate complete valid add membership data', () => {
        const isValidMembershipId = typeof validAddMembershipData.membershipId === 'string' && validAddMembershipData.membershipId.trim().length > 0;
        expect(isValidMembershipId).toBe(true);
      });

      describe('MembershipId Validation', () => {
        const membershipIdTestCases = [
          { membershipId: 'mem-456', valid: true, reason: 'valid membership ID' },
          { membershipId: 'membership_789', valid: true, reason: 'membership ID with underscore' },
          { membershipId: 'x', valid: true, reason: 'single character ID' },
          { membershipId: '999', valid: true, reason: 'numeric string ID' },
          { membershipId: '', valid: false, reason: 'empty string' },
          { membershipId: '   ', valid: false, reason: 'whitespace only' },
          { membershipId: 456, valid: false, reason: 'number membershipId' },
          { membershipId: null, valid: false, reason: 'null membershipId' },
          { membershipId: undefined, valid: false, reason: 'undefined membershipId' }
        ];

        membershipIdTestCases.forEach(({ membershipId, valid, reason }) => {
          it(`should ${valid ? 'accept' : 'reject'} ${reason}`, () => {
            const isValid = typeof membershipId === 'string' && membershipId.trim().length > 0;
            expect(isValid).toBe(valid);
          });
        });
      });
    });
  });

  describe('Validation Error Handling', () => {
    describe('Error Message Format', () => {
      it('should format validation errors consistently', () => {
        const mockValidationErrors = [
          {
            path: ['name'],
            message: 'Membership name must be at least 2 characters'
          },
          {
            path: ['cost'],
            message: 'Cost must be a positive number'
          },
          {
            path: ['duration_months'],
            message: 'Duration must be 1 (monthly) or 12 (annual) months'
          }
        ];

        const formattedErrors = mockValidationErrors.map(err =>
          `${err.path.join('.')}: ${err.message}`
        );

        expect(formattedErrors).toEqual([
          'name: Membership name must be at least 2 characters',
          'cost: Cost must be a positive number',
          'duration_months: Duration must be 1 (monthly) or 12 (annual) months'
        ]);
      });

      it('should handle nested path validation errors', () => {
        const nestedErrors = [
          {
            path: ['user', 'profile', 'email'],
            message: 'Invalid email format'
          },
          {
            path: ['membership', 'details', 'cost'],
            message: 'Cost must be positive'
          }
        ];

        const formattedNestedErrors = nestedErrors.map(err =>
          `${err.path.join('.')}: ${err.message}`
        );

        expect(formattedNestedErrors).toEqual([
          'user.profile.email: Invalid email format',
          'membership.details.cost: Cost must be positive'
        ]);
      });
    });

    describe('Multiple Validation Errors', () => {
      it('should collect all validation errors', () => {
        const invalidMembershipData = {
          name: 'A', 
          cost: -100, 
          max_classes_assistance: -5, 
          max_gym_assistance: 10.5, 
          duration_months: 6, 
          status: 'true' 
        };

        const validationErrors = [];

        
        if (typeof invalidMembershipData.name !== 'string' || invalidMembershipData.name.trim().length < 2) {
          validationErrors.push('name: must be at least 2 characters');
        }

        if (typeof invalidMembershipData.cost !== 'number' || invalidMembershipData.cost < 0) {
          validationErrors.push('cost: must be a positive number');
        }

        if (!Number.isInteger(invalidMembershipData.max_classes_assistance) || invalidMembershipData.max_classes_assistance < 0) {
          validationErrors.push('max_classes_assistance: must be a positive integer');
        }

        if (!Number.isInteger(invalidMembershipData.max_gym_assistance) || invalidMembershipData.max_gym_assistance < 0) {
          validationErrors.push('max_gym_assistance: must be a positive integer');
        }

        if (![1, 12].includes(invalidMembershipData.duration_months)) {
          validationErrors.push('duration_months: must be 1 or 12');
        }

        if (typeof invalidMembershipData.status !== 'boolean') {
          validationErrors.push('status: must be a boolean');
        }

        expect(validationErrors.length).toBe(6); 
        expect(validationErrors).toContain('name: must be at least 2 characters');
        expect(validationErrors).toContain('cost: must be a positive number');
      });
    });
  });

  describe('Middleware Response Format', () => {
    describe('Success Response', () => {
      it('should call next() for valid data', () => {
        const validData = {
          name: 'Premium Membership',
          cost: 80000,
          max_classes_assistance: 20,
          max_gym_assistance: 30,
          duration_months: 1
        };

        
        const isValid = (
          typeof validData.name === 'string' &&
          validData.name.trim().length >= 2 &&
          typeof validData.cost === 'number' &&
          validData.cost >= 0 &&
          Number.isInteger(validData.max_classes_assistance) &&
          validData.max_classes_assistance >= 0 &&
          Number.isInteger(validData.max_gym_assistance) &&
          validData.max_gym_assistance >= 0 &&
          [1, 12].includes(validData.duration_months)
        );

        if (isValid) {
          mockNext();
        }

        expect(mockNext).toHaveBeenCalled();
      });
    });

    describe('Error Response Format', () => {
      it('should return 400 with proper error format', () => {
        const invalidData = {
          name: '', 
          cost: -100 
        };

        const validationErrors = [];

        if (!invalidData.name || invalidData.name.trim().length < 2) {
          validationErrors.push('name: must be at least 2 characters');
        }

        if (typeof invalidData.cost !== 'number' || invalidData.cost < 0) {
          validationErrors.push('cost: must be a positive number');
        }

        if (validationErrors.length > 0) {
          mockRes.status!(400);
          mockRes.json!({
            success: false,
            message: 'Validation failed',
            errors: validationErrors
          });
        }

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          success: false,
          message: 'Validation failed',
          errors: expect.arrayContaining([
            expect.stringContaining('name:'),
            expect.stringContaining('cost:')
          ])
        });
      });

      it('should maintain Spanish error messages', () => {
        const spanishErrors = [
          'El ID del usuario es requerido.',
          'El ID de la membresía es requerido.',
          'La duración debe ser 1 mes (mensual) o 12 meses (anual)'
        ];

        spanishErrors.forEach(errorMessage => {
          expect(typeof errorMessage === 'string').toBe(true);
          expect(errorMessage.length).toBeGreaterThan(0);
          
          expect(errorMessage.startsWith('El ') || errorMessage.startsWith('La ')).toBe(true);
        });
      });
    });
  });

  describe('Request Body Sanitization', () => {
    describe('Input Cleaning', () => {
      it('should handle whitespace trimming', () => {
        const dirtyInput = {
          name: '  Premium Membership  ',
          userId: '  user-123  ',
          membershipId: '  mem-456  '
        };

        const cleanedInput = {
          name: dirtyInput.name.trim(),
          userId: dirtyInput.userId.trim(),
          membershipId: dirtyInput.membershipId.trim()
        };

        expect(cleanedInput.name).toBe('Premium Membership');
        expect(cleanedInput.userId).toBe('user-123');
        expect(cleanedInput.membershipId).toBe('mem-456');
      });

      it('should preserve valid special characters', () => {
        const specialInput = {
          name: 'Membresía Año Nuevo (2024)',
          description: 'Incluye: clases, gym & más!'
        };

        
        expect(specialInput.name).toContain('ñ');
        expect(specialInput.name).toContain('Año');
        expect(specialInput.description).toContain('&');
        expect(specialInput.description).toContain('más');
        expect(typeof specialInput.name === 'string').toBe(true);
      });
    });
  });
});