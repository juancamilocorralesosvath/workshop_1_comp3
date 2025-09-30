export const validSubscriptionData = {
  userId: 'test-user-id',
  memberships: ['membership-id-1', 'membership-id-2']
};

export const invalidSubscriptionData = {
  // Missing required userId
  memberships: ['membership-id-1']
};

export const addMembershipToSubscriptionData = {
  membershipId: 'new-membership-id'
};

export const invalidAddMembershipData = {
  // Missing membershipId
  someField: 'invalid'
};

export const subscriptionWithoutMemberships = {
  userId: 'test-user-id',
  memberships: []
};