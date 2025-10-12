// src/app/store/bonds/bonds.state.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Bond, BondFilterParams, CustomerBondHolding } from '@core/models/bond.models';

/**
 * Bond Entity
 */
export interface BondEntity {
  data: Bond;
  loading: boolean;
  error: string | null;
  loadedAt: number;
}

/**
 * View Mode Type
 */
export type BondViewMode = 'all' | 'partner' | 'customer';

/**
 * Bonds State Interface
 */
export interface BondsState {
  // Entities (normalized by ID)
  entities: Record<number, BondEntity>;
  ids: number[];
  
  // Current list view
  currentPageBonds: Bond[];
  
  // Customer bonds (separate from main bonds)
  customerBonds: CustomerBondHolding[];
  
  // Selection
  selectedId: number | null;
  selectedIds: number[];
  
  // Filters & Search
  filters: BondFilterParams;
  
  // View mode and context
  viewMode: BondViewMode;
  activePartnerId: number | null;
  
  // Pagination
  total: number;
  limit: number;
  offset: number;
  
  // UI State
  loading: boolean;
  error: string | null;
  
  // Operation states
  creating: boolean;
  updating: boolean;
  deleting: boolean;
}

/**
 * Initial State
 */
export const initialState: BondsState = {
  entities: {},
  ids: [],
  currentPageBonds: [],
  customerBonds: [],
  selectedId: null,
  selectedIds: [],
  filters: {
    limit: 20,
    offset: 0
  },
  viewMode: 'all',
  activePartnerId: null,
  total: 0,
  limit: 20,
  offset: 0,
  loading: false,
  error: null,
  creating: false,
  updating: false,
  deleting: false
};

/**
 * Feature Selector
 */
export const selectBondsState = createFeatureSelector<BondsState>('bonds');

/**
 * Entity Selectors
 */
export const selectBondEntities = createSelector(
  selectBondsState,
  (state) => state.entities
);

export const selectBondIds = createSelector(
  selectBondsState,
  (state) => state.ids
);

export const selectAllBonds = createSelector(
  selectBondEntities,
  selectBondIds,
  (entities, ids) => ids.map(id => entities[id]?.data).filter(Boolean)
);

export const selectCurrentPageBonds = createSelector(
  selectBondsState,
  (state) => state.currentPageBonds
);

/**
 * Single Bond Selectors
 */
export const selectBondById = (bondId: number) => createSelector(
  selectBondEntities,
  (entities) => entities[bondId]?.data
);

export const selectBondEntityById = (bondId: number) => createSelector(
  selectBondEntities,
  (entities) => entities[bondId]
);

export const selectBondLoading = (bondId: number) => createSelector(
  selectBondEntityById(bondId),
  (entity) => entity?.loading || false
);

export const selectBondError = (bondId: number) => createSelector(
  selectBondEntityById(bondId),
  (entity) => entity?.error || null
);

/**
 * Customer Bonds Selectors
 */
export const selectCustomerBonds = createSelector(
  selectBondsState,
  (state) => state.customerBonds
);

export const selectCustomerBondsByPartner = (partnerId: number) => createSelector(
  selectCustomerBonds,
  (bonds) => bonds.filter(b => b.partnerId === partnerId)
);

export const selectCustomerBondsByCustomer = (customerId: number) => createSelector(
  selectCustomerBonds,
  (bonds) => bonds.filter(b => b.customerId === customerId)
);

/**
 * Selection Selectors
 */
export const selectSelectedBondId = createSelector(
  selectBondsState,
  (state) => state.selectedId
);

export const selectSelectedBond = createSelector(
  selectBondEntities,
  selectSelectedBondId,
  (entities, selectedId) => selectedId ? entities[selectedId]?.data : null
);

export const selectSelectedBondIds = createSelector(
  selectBondsState,
  (state) => state.selectedIds
);

export const selectSelectedBonds = createSelector(
  selectBondEntities,
  selectSelectedBondIds,
  (entities, ids) => ids.map(id => entities[id]?.data).filter(Boolean)
);

/**
 * View Mode Selectors
 */
export const selectViewMode = createSelector(
  selectBondsState,
  (state) => state.viewMode
);

export const selectActivePartnerId = createSelector(
  selectBondsState,
  (state) => state.activePartnerId
);

/**
 * Filter & Pagination Selectors
 */
export const selectFilters = createSelector(
  selectBondsState,
  (state) => state.filters
);

export const selectTotal = createSelector(
  selectBondsState,
  (state) => state.total
);

export const selectLimit = createSelector(
  selectBondsState,
  (state) => state.limit
);

export const selectOffset = createSelector(
  selectBondsState,
  (state) => state.offset
);

export const selectPagination = createSelector(
  selectTotal,
  selectLimit,
  selectOffset,
  (total, limit, offset) => ({
    total,
    limit,
    offset,
    currentPage: Math.floor(offset / limit) + 1,
    totalPages: Math.ceil(total / limit)
  })
);

/**
 * UI State Selectors
 */
export const selectLoading = createSelector(
  selectBondsState,
  (state) => state.loading
);

export const selectError = createSelector(
  selectBondsState,
  (state) => state.error
);

export const selectCreating = createSelector(
  selectBondsState,
  (state) => state.creating
);

export const selectUpdating = createSelector(
  selectBondsState,
  (state) => state.updating
);

export const selectDeleting = createSelector(
  selectBondsState,
  (state) => state.deleting
);

/**
 * Derived Selectors
 */
export const selectActiveBonds = createSelector(
  selectAllBonds,
  (bonds) => bonds.filter(b => b.status === 'active')
);

export const selectInactiveBonds = createSelector(
  selectAllBonds,
  (bonds) => bonds.filter(b => b.status === 'inactive')
);

export const selectMaturedBonds = createSelector(
  selectAllBonds,
  (bonds) => bonds.filter(b => b.status === 'matured')
);

export const selectBondsByStatus = (status: string) => createSelector(
  selectAllBonds,
  (bonds) => bonds.filter(b => b.status === status)
);

export const selectBondsByCurrency = (currency: string) => createSelector(
  selectAllBonds,
  (bonds) => bonds.filter(b => b.fiatCurrency === currency)
);

export const selectBondsByIssuer = (issuer: string) => createSelector(
  selectAllBonds,
  (bonds) => bonds.filter(b => b.issuer.toLowerCase().includes(issuer.toLowerCase()))
);

export const selectHasFilters = createSelector(
  selectFilters,
  (filters) => !!(
    filters.status || 
    filters.keyword || 
    filters.bondName || 
    filters.bondCode ||
    filters.fiatCurrency ||
    filters.issuer
  )
);

export const selectBondCount = createSelector(
  selectBondIds,
  (ids) => ids.length
);