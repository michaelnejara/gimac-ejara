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
    const entities = { ...state.entities };
    const newIds: number[] = [];

    bonds.forEach(bond => {
      newIds.push(bond.id);
      entities[bond.id] = {
        data: bond,
        loading: false,
        error: null,
        loadedAt: Date.now()
      };
    });

    return {
      ...state,
      entities,
      ids: [...new Set([...state.ids, ...newIds])],
      currentPageBonds: bonds,
      total,
      limit,
      offset,
      loading: false,
      error: null
    };
  }),

  on(BondsActions.loadBondsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Load Single Bond
  on(BondsActions.loadBond, (state, { bondId }) => {
    const entity = state.entities[bondId];
    return {
      ...state,
      entities: {
        ...state.entities,
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
    entities: {
      ...state.entities,
      [bond.id]: {
        data: bond,
        loading: false,
        error: null,
        loadedAt: Date.now()
      }
    },
    ids: state.ids.includes(bond.id) ? state.ids : [...state.ids, bond.id]
  })),

  on(BondsActions.loadBondFailure, (state, { bondId, error }) => {
    const entity = state.entities[bondId];
    return {
      ...state,
      entities: {
        ...state.entities,
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
    creating: false,
    error: null
    // Note: Bond will be added when list is reloaded
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
    updating: false,
    error: null
    // Note: Bond will be updated when list is reloaded
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
    const { [bondId]: removed, ...remainingEntities } = state.entities;
    return {
      ...state,
      entities: remainingEntities,
      ids: state.ids.filter(id => id !== bondId),
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
    const entities = { ...state.entities };
    const newIds: number[] = [];

    bonds.forEach((bond: any) => {
      // Partner bonds have bondId instead of id
      const id = bond.bondId || bond.id;
      if (id) {
        newIds.push(id);
        entities[id] = {
          data: bond,
          loading: false,
          error: null,
          loadedAt: Date.now()
        };
      }
    });

    return {
      ...state,
      entities,
      ids: [...new Set([...state.ids, ...newIds])],
      currentPageBonds: bonds,
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

  on(BondsActions.loadCustomerBondsSuccess, (state, { customerBonds, total, limit, offset }) => ({
    ...state,
    customerBonds,
    total,
    limit,
    offset,
    loading: false,
    error: null
  })),

  on(BondsActions.loadCustomerBondsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Filters
  on(BondsActions.applyFilters, (state, { filters }) => ({
    ...state,
    filters: {
      ...state.filters,
      ...filters,
      offset: 0
    }
  })),

  on(BondsActions.clearFilters, (state) => ({
    ...state,
    filters: {
      limit: state.filters.limit,
      offset: 0
    }
  })),

  on(BondsActions.setSearchKeyword, (state, { keyword }) => ({
    ...state,
    filters: {
      ...state.filters,
      keyword,
      offset: 0
    }
  })),

  // Pagination
  on(BondsActions.changePage, (state, { offset }) => ({
    ...state,
    filters: {
      ...state.filters,
      offset
    }
  })),

  on(BondsActions.changePageSize, (state, { limit }) => ({
    ...state,
    filters: {
      ...state.filters,
      limit,
      offset: 0
    }
  })),

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

  // UI State
  on(BondsActions.setLoading, (state, { loading }) => ({
    ...state,
    loading
  })),

  on(BondsActions.clearErrors, (state) => ({
    ...state,
    error: null
  })),

  on(BondsActions.resetState, () => initialState)
);