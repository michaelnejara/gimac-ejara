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
    const entities = { ...state.entities };
    const newIds: number[] = [];

    response.data.forEach(partner => {
      newIds.push(partner.id);
      entities[partner.id] = {
        data: partner as any, // Partner type from listing
        loading: false,
        error: null,
        loadedAt: Date.now()
      };
    });

    return {
      ...state,
      entities,
      ids: [...new Set([...state.ids, ...newIds])],
      currentPagePartners: response.data,
      total: response.meta.total,
      limit: response.meta.limit,
      offset: response.meta.offset,
      loading: false,
      error: null
    };
  }),

  on(PartnersActions.loadPartnersFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Load Single Partner
  on(PartnersActions.loadPartner, (state, { partnerId }) => {
    const entity = state.entities[partnerId];
    return {
      ...state,
      entities: {
        ...state.entities,
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
    entities: {
      ...state.entities,
      [partner.id]: {
        data: partner as any, // PartnerDetail type from get by id
        loading: false,
        error: null,
        loadedAt: Date.now()
      }
    },
    ids: state.ids.includes(partner.id) ? state.ids : [...state.ids, partner.id]
  })),

  on(PartnersActions.loadPartnerFailure, (state, { partnerId, error }) => {
    const entity = state.entities[partnerId];
    return {
      ...state,
      entities: {
        ...state.entities,
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
  on(PartnersActions.updatePartner, (state, { partnerId }) => ({
    ...state,
    updating: true,
    error: null
  })),

  on(PartnersActions.updatePartnerSuccess, (state, { response }) => {
    const entity = state.entities[response.data.id];
    if (!entity) return { ...state, updating: false };

    return {
      ...state,
      entities: {
        ...state.entities,
        [response.data.id]: {
          ...entity,
          data: {
            ...entity.data,
            name: response.data.name,
            updatedAt: response.data.dateUpdated
          },
          loading: false,
          error: null,
          loadedAt: Date.now()
        }
      },
      updating: false,
      error: null
    };
  }),

  on(PartnersActions.updatePartnerFailure, (state, { error }) => ({
    ...state,
    updating: false,
    error
  })),

  // Update Partner Status
  on(PartnersActions.updatePartnerStatus, (state, { partnerId }) => {
    const entity = state.entities[partnerId];
    return {
      ...state,
      entities: {
        ...state.entities,
        [partnerId]: {
          ...entity,
          loading: true,
          error: null
        }
      }
    };
  }),

  on(PartnersActions.updatePartnerStatusSuccess, (state, { partnerId, response }) => {
    const entity = state.entities[partnerId];
    if (!entity) return state;

    return {
      ...state,
      entities: {
        ...state.entities,
        [partnerId]: {
          ...entity,
          loading: false,
          error: null
        }
      }
    };
  }),

  on(PartnersActions.updatePartnerStatusFailure, (state, { partnerId, error }) => {
    const entity = state.entities[partnerId];
    return {
      ...state,
      entities: {
        ...state.entities,
        [partnerId]: {
          ...entity,
          loading: false,
          error
        }
      }
    };
  }),

  // Delete Partner
  on(PartnersActions.deletePartner, (state) => ({
    ...state,
    deleting: true,
    error: null
  })),

  on(PartnersActions.deletePartnerSuccess, (state, { partnerId }) => {
    const { [partnerId]: removed, ...remainingEntities } = state.entities;
    return {
      ...state,
      entities: remainingEntities,
      ids: state.ids.filter(id => id !== partnerId),
      deleting: false,
      error: null
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

  on(PartnersActions.changePageSize, (state, { limit }) => ({
    ...state,
    filters: {
      ...state.filters,
      limit,
      offset: 0
    }
  })),

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

  // Assign Bonds to Partner
  on(PartnersActions.assignBonds, (state, { partnerId }) => {
    const entity = state.entities[partnerId];
    return {
      ...state,
      entities: {
        ...state.entities,
        [partnerId]: {
          ...entity,
          loading: true,
          error: null
        }
      }
    };
  }),

  on(PartnersActions.assignBondsSuccess, (state, { partnerId, response }) => {
    const entity = state.entities[partnerId];
    if (!entity) return state;

    return {
      ...state,
      entities: {
        ...state.entities,
        [partnerId]: {
          ...entity,
          loading: false,
          error: null
        }
      }
    };
  }),

  on(PartnersActions.assignBondsFailure, (state, { partnerId, error }) => {
    const entity = state.entities[partnerId];
    return {
      ...state,
      entities: {
        ...state.entities,
        [partnerId]: {
          ...entity,
          loading: false,
          error
        }
      }
    };
  }),

  // Remove Bonds from Partner
  on(PartnersActions.removeBonds, (state, { partnerId }) => {
    const entity = state.entities[partnerId];
    return {
      ...state,
      entities: {
        ...state.entities,
        [partnerId]: {
          ...entity,
          loading: true,
          error: null
        }
      }
    };
  }),

  on(PartnersActions.removeBondsSuccess, (state, { partnerId, response }) => {
    const entity = state.entities[partnerId];
    if (!entity) return state;

    return {
      ...state,
      entities: {
        ...state.entities,
        [partnerId]: {
          ...entity,
          loading: false,
          error: null
        }
      }
    };
  }),

  on(PartnersActions.removeBondsFailure, (state, { partnerId, error }) => {
    const entity = state.entities[partnerId];
    return {
      ...state,
      entities: {
        ...state.entities,
        [partnerId]: {
          ...entity,
          loading: false,
          error
        }
      }
    };
  }),
);