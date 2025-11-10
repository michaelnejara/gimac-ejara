// src/app/store/bonds/bonds.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { BondsActions } from './bonds.actions';
import { initialState } from './bonds.state';

/**
 * Bonds Reducer
 */
export const bondsReducer = createReducer(
  initialState,

  // Load All Bonds (Admin)
  on(BondsActions.loadBonds, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(BondsActions.loadBondsSuccess, (state, { bonds, total, limit, offset }) => {
    // Calculate page number from offset and limit
    const pageNumber = Math.floor(offset / limit) + 1;

    // Update page cache
    const newPageCache = { ...state.pageCache };
    newPageCache[pageNumber] = bonds;

    return {
      ...state,
      pageCache: newPageCache,
      activePage: pageNumber,
      total,
      limit,
      offset,
      previousPageSize: limit,
      loading: false,
      error: null
    };
  }),

  on(BondsActions.loadBondsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Load Single Bond (stores in singleEntities cache)
  on(BondsActions.loadBond, (state, { bondId }) => {
    const entity = state.singleEntities[bondId];
    return {
      ...state,
      singleEntities: {
        ...state.singleEntities,
        [bondId]: {
          ...entity,
          data: entity?.data || {} as any,
          loading: true,
          error: null,
          loadedAt: entity?.loadedAt || 0
        }
      }
    };
  }),

  on(BondsActions.loadBondSuccess, (state, { bond }) => ({
    ...state,
    singleEntities: {
      ...state.singleEntities,
      [bond.id]: {
        data: bond,
        loading: false,
        error: null,
        loadedAt: Date.now()
      }
    }
  })),

  on(BondsActions.loadBondFailure, (state, { bondId, error }) => {
    const entity = state.singleEntities[bondId];
    return {
      ...state,
      singleEntities: {
        ...state.singleEntities,
        [bondId]: {
          ...entity,
          data: entity?.data || {} as any,
          loading: false,
          error,
          loadedAt: entity?.loadedAt || 0
        }
      }
    };
  }),

  // Create Bond
  on(BondsActions.createBond, (state) => ({
    ...state,
    creating: true,
    error: null
  })),

  on(BondsActions.createBondSuccess, (state) => ({
    ...state,
    pageCache: {}, // Clear page cache to force reload
    creating: false,
    error: null
  })),

  on(BondsActions.createBondFailure, (state, { error }) => ({
    ...state,
    creating: false,
    error
  })),

  // Update Bond
  on(BondsActions.updateBond, (state) => ({
    ...state,
    updating: true,
    error: null
  })),

  on(BondsActions.updateBondSuccess, (state) => ({
    ...state,
    pageCache: {}, // Clear page cache to force reload
    updating: false,
    error: null
  })),

  on(BondsActions.updateBondFailure, (state, { error }) => ({
    ...state,
    updating: false,
    error
  })),

  // Delete Bond
  on(BondsActions.deleteBond, (state) => ({
    ...state,
    deleting: true,
    error: null
  })),

  on(BondsActions.deleteBondSuccess, (state, { bondId }) => {
    // Remove from single entities cache
    const { [bondId]: removed, ...remainingSingleEntities } = state.singleEntities;

    // Clear page cache (force reload)
    return {
      ...state,
      singleEntities: remainingSingleEntities,
      pageCache: {},
      customerBondsPageCache: {},
      partnerBondsPageCache: {},
      deleting: false,
      error: null,
      selectedId: state.selectedId === bondId ? null : state.selectedId
    };
  }),

  on(BondsActions.deleteBondFailure, (state, { error }) => ({
    ...state,
    deleting: false,
    error
  })),

  // Load Partner Bonds
  on(BondsActions.loadPartnerBonds, (state, { filters }) => ({
    ...state,
    loading: true,
    error: null,
    activePartnerId: filters.partnerId,
    viewMode: 'partner' as const
  })),

  on(BondsActions.loadPartnerBondsSuccess, (state, { partnerId, bonds, total, limit, offset }) => {
    // Calculate page number from offset and limit
    const pageNumber = Math.floor(offset / limit) + 1;

    // Update partner-specific page cache (DEEP COPY for nested structure)
    const newPartnerBondsPageCache = {
      ...state.partnerBondsPageCache,
      [partnerId]: {
        ...state.partnerBondsPageCache[partnerId], // Copy existing pages for this partner
        [pageNumber]: bonds // Add/update the current page
      }
    };

    return {
      ...state,
      partnerBondsPageCache: newPartnerBondsPageCache,
      activePage: pageNumber,
      total,
      limit,
      offset,
      loading: false,
      error: null,
      activePartnerId: partnerId
    };
  }),

  on(BondsActions.loadPartnerBondsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Load Customer Bonds
  on(BondsActions.loadCustomerBonds, (state) => ({
    ...state,
    loading: true,
    error: null,
    viewMode: 'customer' as const
  })),

  on(BondsActions.loadCustomerBondsSuccess, (state, { customerBonds, total, limit, offset }) => {
    // Calculate page number from offset and limit
    const pageNumber = Math.floor(offset / limit) + 1;

    // Update customer bonds page cache
    const newCustomerBondsPageCache = { ...state.customerBondsPageCache };
    newCustomerBondsPageCache[pageNumber] = customerBonds;

    return {
      ...state,
      customerBondsPageCache: newCustomerBondsPageCache,
      activePage: pageNumber,
      total,
      limit,
      offset,
      loading: false,
      error: null
    };
  }),

  on(BondsActions.loadCustomerBondsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Pagination
  on(BondsActions.changePage, (state, { offset }) => ({
    ...state,
    offset
  })),

  on(BondsActions.changePageSize, (state, { limit }) => {
    // Clear page cache when page size changes
    const shouldClearCache = state.previousPageSize !== limit;

    return {
      ...state,
      limit,
      offset: 0,
      activePage: 1,
      // Clear all caches when page size changes
      pageCache: shouldClearCache ? {} : state.pageCache,
      customerBondsPageCache: shouldClearCache ? {} : state.customerBondsPageCache,
      partnerBondsPageCache: shouldClearCache ? {} : state.partnerBondsPageCache,
      previousPageSize: limit
    };
  }),

  // Selection
  on(BondsActions.selectBond, (state, { bondId }) => ({
    ...state,
    selectedId: bondId
  })),

  on(BondsActions.selectMultipleBonds, (state, { bondIds }) => ({
    ...state,
    selectedIds: bondIds
  })),

  on(BondsActions.clearSelection, (state) => ({
    ...state,
    selectedId: null,
    selectedIds: []
  })),

  // View Mode
  on(BondsActions.setViewMode, (state, { mode }) => ({
    ...state,
    viewMode: mode
  })),

  on(BondsActions.setActivePartner, (state, { partnerId }) => ({
    ...state,
    activePartnerId: partnerId
  })),

  on(BondsActions.setBondsContext, (state, { context }) => ({
    ...state,
    context
  })),

  // UI State
  on(BondsActions.setLoading, (state, { loading }) => ({
    ...state,
    loading
  })),

  on(BondsActions.clearErrors, (state) => ({
    ...state,
    error: null
  })),

  on(BondsActions.resetState, () => initialState),

  // Reset to first page
  on(BondsActions.resetToFirstPage, (state) => ({
    ...state,
    activePage: 1,
    offset: 0
  })),

  // Reset for context view (partner/customer)
  // Clears all caches when entering from partner/customer context
  on(BondsActions.resetForContextView, (state) => ({
    ...state,
    // Clear all page caches
    pageCache: {},
    customerBondsPageCache: {},
    partnerBondsPageCache: {},
    // Reset pagination to avoid showing stale totals from previous context
    activePage: 1,
    offset: 0,
    total: 0, // Reset total to prevent showing incorrect count from previous context
    // Reset context to default when clearing
    context: {
      page: 'default'
    }
  }))
);