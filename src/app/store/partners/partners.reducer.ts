// src/app/store/partners/partners.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { PartnersActions } from './partners.actions';
import { initialState, PartnerEntity } from './partners.state';

/**
 * Partners Reducer
 */
export const partnersReducer = createReducer(
  initialState,

  // Load Partners List
  on(PartnersActions.loadPartners, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(PartnersActions.loadPartnersSuccess, (state, { response }) => {
    // Calculate page number from offset and limit
    const pageNumber = Math.floor(response.meta.offset / response.meta.limit) + 1;

    // Update page cache
    const newPageCache = { ...state.pageCache };
    newPageCache[pageNumber] = response.data;

    return {
      ...state,
      pageCache: newPageCache,
      activePage: pageNumber,
      total: response.meta.total,
      limit: response.meta.limit,
      offset: response.meta.offset,
      previousPageSize: response.meta.limit,
      loading: false,
      error: null
    };
  }),

  on(PartnersActions.loadPartnersFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Load Single Partner (stores in singleEntities cache)
  on(PartnersActions.loadPartner, (state, { partnerId }) => {
    const entity = state.singleEntities[partnerId];
    return {
      ...state,
      singleEntities: {
        ...state.singleEntities,
        [partnerId]: {
          ...entity,
          data: entity?.data || {} as any,
          loading: true,
          error: null,
          loadedAt: entity?.loadedAt || 0
        }
      }
    };
  }),

  on(PartnersActions.loadPartnerSuccess, (state, { partner }) => ({
    ...state,
    singleEntities: {
      ...state.singleEntities,
      [partner.id]: {
        data: partner as any, // PartnerDetail type from get by id
        loading: false,
        error: null,
        loadedAt: Date.now()
      }
    }
  })),

  on(PartnersActions.loadPartnerFailure, (state, { partnerId, error }) => {
    const entity = state.singleEntities[partnerId];
    return {
      ...state,
      singleEntities: {
        ...state.singleEntities,
        [partnerId]: {
          ...entity,
          data: entity?.data || {} as any,
          loading: false,
          error,
          loadedAt: entity?.loadedAt || 0
        }
      }
    };
  }),

  // Create Partner
  on(PartnersActions.createPartner, (state) => ({
    ...state,
    creating: true,
    error: null
  })),

  on(PartnersActions.createPartnerSuccess, (state, { response }) => {
    // Note: We only get partnerId, name, code, and status from the create response
    // We won't add to entities until we do a full load/refresh
    return {
      ...state,
      creating: false,
      error: null
    };
  }),

  on(PartnersActions.createPartnerFailure, (state, { error }) => ({
    ...state,
    creating: false,
    error
  })),

  // Update Partner
  on(PartnersActions.updatePartner, (state) => ({
    ...state,
    updating: true,
    error: null
  })),

  on(PartnersActions.updatePartnerSuccess, (state) => ({
    ...state,
    // Clear page cache (force reload to show updated data)
    pageCache: {},
    updating: false,
    error: null
  })),

  on(PartnersActions.updatePartnerFailure, (state, { error }) => ({
    ...state,
    updating: false,
    error
  })),

  // Update Partner Status
  on(PartnersActions.updatePartnerStatus, (state) => ({
    ...state,
    updating: true,
    error: null
  })),

  on(PartnersActions.updatePartnerStatusSuccess, (state) => ({
    ...state,
    // Clear page cache (force reload to show updated status)
    pageCache: {},
    updating: false,
    error: null
  })),

  on(PartnersActions.updatePartnerStatusFailure, (state, { error }) => ({
    ...state,
    updating: false,
    error
  })),

  // Delete Partner
  on(PartnersActions.deletePartner, (state) => ({
    ...state,
    deleting: true,
    error: null
  })),

  on(PartnersActions.deletePartnerSuccess, (state, { partnerId }) => {
    // Remove from single entities cache
    const { [partnerId]: removed, ...remainingSingleEntities } = state.singleEntities;

    return {
      ...state,
      singleEntities: remainingSingleEntities,
      // Clear page cache (force reload)
      pageCache: {},
      deleting: false,
      error: null,
      selectedId: state.selectedId === partnerId ? null : state.selectedId
    };
  }),

  on(PartnersActions.deletePartnerFailure, (state, { error }) => ({
    ...state,
    deleting: false,
    error
  })),

  // Filters
  on(PartnersActions.applyFilters, (state, { filters }) => ({
    ...state,
    filters: {
      ...state.filters,
      ...filters,
      offset: 0 // Reset to first page
    }
  })),

  on(PartnersActions.clearFilters, (state) => ({
    ...state,
    filters: {
      limit: state.filters.limit,
      offset: 0,
      sortBy: 'dateCreated',
      sortOrder: 'desc'
    }
  })),

  on(PartnersActions.setSearchKeyword, (state, { keyword }) => ({
    ...state,
    filters: {
      ...state.filters,
      keyword,
      offset: 0
    }
  })),

  // Pagination
  on(PartnersActions.changePage, (state, { offset }) => ({
    ...state,
    filters: {
      ...state.filters,
      offset
    }
  })),

  on(PartnersActions.changePageSize, (state, { limit }) => {
    // Clear page cache when page size changes
    const shouldClearCache = state.previousPageSize !== limit;

    return {
      ...state,
      filters: {
        ...state.filters,
        limit,
        offset: 0
      },
      limit,
      offset: 0,
      activePage: 1,
      // Clear page cache when page size changes
      pageCache: shouldClearCache ? {} : state.pageCache,
      previousPageSize: limit
    };
  }),

  // Selection
  on(PartnersActions.selectPartner, (state, { partnerId }) => ({
    ...state,
    selectedId: partnerId
  })),

  on(PartnersActions.selectMultiplePartners, (state, { partnerIds }) => ({
    ...state,
    selectedIds: partnerIds
  })),

  on(PartnersActions.clearSelection, (state) => ({
    ...state,
    selectedId: null,
    selectedIds: []
  })),

  // UI State
  on(PartnersActions.setLoading, (state, { loading }) => ({
    ...state,
    loading
  })),

  on(PartnersActions.clearErrors, (state) => ({
    ...state,
    error: null
  })),

  on(PartnersActions.resetState, () => initialState),

  // Reset to first page
  on(PartnersActions.resetToFirstPage, (state) => ({
    ...state,
    activePage: 1,
    offset: 0,
    filters: {
      ...state.filters,
      offset: 0
    }
  })),

  // Assign Bonds to Partner
  on(PartnersActions.assignBonds, (state) => ({
    ...state,
    updating: true,
    error: null
  })),

  on(PartnersActions.assignBondsSuccess, (state) => ({
    ...state,
    // Clear page cache (force reload to show updated bonds)
    pageCache: {},
    updating: false,
    error: null
  })),

  on(PartnersActions.assignBondsFailure, (state, { error }) => ({
    ...state,
    updating: false,
    error
  })),

  // Remove Bonds from Partner
  on(PartnersActions.removeBonds, (state) => ({
    ...state,
    updating: true,
    error: null
  })),

  on(PartnersActions.removeBondsSuccess, (state) => ({
    ...state,
    // Clear page cache (force reload to show updated bonds)
    pageCache: {},
    updating: false,
    error: null
  })),

  on(PartnersActions.removeBondsFailure, (state, { error }) => ({
    ...state,
    updating: false,
    error
  }))
);