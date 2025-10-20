// src/app/store/partners/partners.state.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Partner, PartnerDetail, PartnerFilterParams } from '@core/models/partner.models';

/**
 * Partner Entity
 * Wraps partner with metadata
 * Can store either Partner (from listing) or PartnerDetail (from get by id)
 */
export interface PartnerEntity {
  data: Partner | PartnerDetail;
  loading: boolean;
  error: string | null;
  loadedAt: number;
}

/**
 * Page Cache - Stores paginated data by page number
 */
export interface PageCache<T> {
  [pageNumber: number]: T[];
}

/**
 * Partners State Interface
 */
export interface PartnersState {
  // Single Entity Cache (for detail views)
  // Populated when getPartnerById is called
  singleEntities: Record<number, PartnerEntity>;

  // List Entities (for list views - deprecated, will migrate to pageCache)
  entities: Record<number, PartnerEntity>;
  ids: number[];

  // Page-based Cache (NEW)
  // Structure: { 1: [...partners], 2: [...partners], ... }
  pageCache: PageCache<Partner>;

  // Current active page number
  activePage: number;

  // Current list view (deprecated - use pageCache instead)
  currentPagePartners: Partner[];

  // Selection
  selectedId: number | null;
  selectedIds: number[];

  // Filters & Search
  filters: PartnerFilterParams;
  previousPageSize: number; // Track page size changes

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
export const initialState: PartnersState = {
  // Single entity cache
  singleEntities: {},

  // List entities (deprecated)
  entities: {},
  ids: [],

  // Page-based cache
  pageCache: {},
  activePage: 1,

  // Current list view (deprecated)
  currentPagePartners: [],

  selectedId: null,
  selectedIds: [],
  filters: {
    limit: 20,
    offset: 0,
    sortBy: 'dateCreated',
    sortOrder: 'desc'
  },
  previousPageSize: 20,
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
export const selectPartnersState = createFeatureSelector<PartnersState>('partners');

/**
 * Entity Selectors
 */
export const selectPartnerEntities = createSelector(
  selectPartnersState,
  (state) => state.entities
);

export const selectPartnerIds = createSelector(
  selectPartnersState,
  (state) => state.ids
);

export const selectAllPartners = createSelector(
  selectPartnerEntities,
  selectPartnerIds,
  (entities, ids) => ids.map(id => entities[id]?.data).filter(Boolean)
);

export const selectCurrentPagePartners = createSelector(
  selectPartnersState,
  (state) => {
    // Use page cache if available, otherwise fall back to currentPagePartners
    const currentPage = state.activePage;
    return state.pageCache[currentPage] || state.currentPagePartners;
  }
);

/**
 * Page Cache Selectors
 */
export const selectPageCache = createSelector(
  selectPartnersState,
  (state) => state.pageCache
);

export const selectActivePage = createSelector(
  selectPartnersState,
  (state) => state.activePage
);

export const selectCurrentPageFromCache = createSelector(
  selectPageCache,
  selectActivePage,
  (cache, activePage) => cache[activePage] || []
);

export const selectIsPageCached = (pageNumber: number) => createSelector(
  selectPageCache,
  (cache) => !!cache[pageNumber]
);

export const selectPreviousPageSize = createSelector(
  selectPartnersState,
  (state) => state.previousPageSize
);

/**
 * Single Partner Selectors (from singleEntities cache)
 */
export const selectSinglePartnerEntities = createSelector(
  selectPartnersState,
  (state) => state.singleEntities
);

export const selectPartnerById = (partnerId: number) => createSelector(
  selectSinglePartnerEntities,
  (entities) => entities[partnerId]?.data
);

export const selectPartnerEntityById = (partnerId: number) => createSelector(
  selectSinglePartnerEntities,
  (entities) => entities[partnerId]
);

export const selectPartnerLoading = (partnerId: number) => createSelector(
  selectPartnerEntityById(partnerId),
  (entity) => entity?.loading || false
);

export const selectPartnerError = (partnerId: number) => createSelector(
  selectPartnerEntityById(partnerId),
  (entity) => entity?.error || null
);

export const selectIsPartnerCached = (partnerId: number) => createSelector(
  selectSinglePartnerEntities,
  (entities) => !!entities[partnerId]?.data
);

/**
 * Selection Selectors
 */
export const selectSelectedPartnerId = createSelector(
  selectPartnersState,
  (state) => state.selectedId
);

export const selectSelectedPartner = createSelector(
  selectPartnerEntities,
  selectSelectedPartnerId,
  (entities, selectedId) => selectedId ? entities[selectedId]?.data : null
);

export const selectSelectedPartnerIds = createSelector(
  selectPartnersState,
  (state) => state.selectedIds
);

export const selectSelectedPartners = createSelector(
  selectPartnerEntities,
  selectSelectedPartnerIds,
  (entities, ids) => ids.map(id => entities[id]?.data).filter(Boolean)
);

/**
 * Filter & Pagination Selectors
 */
export const selectFilters = createSelector(
  selectPartnersState,
  (state) => state.filters
);

export const selectTotal = createSelector(
  selectPartnersState,
  (state) => state.total
);

export const selectLimit = createSelector(
  selectPartnersState,
  (state) => state.limit
);

export const selectOffset = createSelector(
  selectPartnersState,
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
  selectPartnersState,
  (state) => state.loading
);

export const selectError = createSelector(
  selectPartnersState,
  (state) => state.error
);

export const selectCreating = createSelector(
  selectPartnersState,
  (state) => state.creating
);

export const selectUpdating = createSelector(
  selectPartnersState,
  (state) => state.updating
);

export const selectDeleting = createSelector(
  selectPartnersState,
  (state) => state.deleting
);

/**
 * Derived Selectors
 */
export const selectActivePartners = createSelector(
  selectAllPartners,
  (partners) => partners.filter(p => p.status === 'active')
);

export const selectSuspendedPartners = createSelector(
  selectAllPartners,
  (partners) => partners.filter(p => p.status === 'suspended')
);

export const selectInactivePartners = createSelector(
  selectAllPartners,
  (partners) => partners.filter(p => p.status === 'inactive')
);

export const selectPartnersByStatus = (status: string) => createSelector(
  selectAllPartners,
  (partners) => partners.filter(p => p.status === status)
);

export const selectHasFilters = createSelector(
  selectFilters,
  (filters) => !!(filters.status || filters.keyword || filters.code || filters.name)
);

export const selectPartnerCount = createSelector(
  selectPartnerIds,
  (ids) => ids.length
);