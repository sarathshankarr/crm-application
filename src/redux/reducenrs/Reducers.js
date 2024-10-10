import {
  ADD_SELECTED_IMAGE,
  ADD_TO_CART,
  ADD_TO_PENDING,
  CLEAR_CART,
  DELETE_NOTE,
  REMOVE_FROM_CART,
  REMOVE_SELECTED_IMAGE,
  SET_CURRENT_SCREEN,
  SET_LOGGED_IN_USER,
  SET_NOTE_DETAILS,
  SET_NOTE_SAVED,
  SET_SELECTED_COMPANY,
  SET_SOURCE_SCREEN,
  SET_USER_ROLE,
  STORE_CATEGORY_IDS,
  UPDATE_CART_ITEM,
} from '../ActionTypes';

const initialState = {
  cartItems: [],
  selectedImages: [],
  pendingItems: [],
  noteDetails: {
    title: '',
    description: '',
  },
  notes: [],
  noteSaved: false,
  userRole: null,
  loggedInUser: null,
  selectedCompany: null,
  categoryIds: [],
  currentSourceScreen: null,
};

const reducers = (state = initialState, action) => {
    switch (action.type) {
      case ADD_TO_CART:
        console.log('Attempting to add to cart:', action.payload);
        const existingItemFromOtherScreen = state.cartItems.find(
          item => item.sourceScreen && item.sourceScreen !== action.payload.sourceScreen
        );
        if (existingItemFromOtherScreen) {
          alert('You can only add items from one screen at a time!');
          return state; 
        }
        return {
          ...state,
          cartItems: [...state.cartItems, action.payload],
        };
    
  
        case REMOVE_FROM_CART:
          // Check if action.payload is a number (index) or an object with styleId, colorId, and sizeId
          if (typeof action.payload === 'number') {
            // Remove full item based on index
            return {
              ...state,
              cartItems: state.cartItems.filter((_, index) => index !== action.payload),
            };
          } else if (
            action.payload.styleId !== undefined &&
            action.payload.colorId !== undefined &&
            action.payload.sizeId !== undefined
          ) {
            // Remove specific size within an item
            const updatedCartItems = state.cartItems.map(item => {
              if (
                item.styleId === action.payload.styleId &&
                item.colorId === action.payload.colorId &&
                item.sizeId === action.payload.sizeId
              ) {
                // Modify item properties as needed before returning
                // For now, let's just remove the size from the item
                return {
                  ...item,
                  sizeId: null, // or remove other properties as needed
                };
              }
              return item;
            });
            return {
              ...state,
              cartItems: updatedCartItems,
            };
          } else {
            return state;
          }

          case UPDATE_CART_ITEM:
            return {
              ...state,
              cartItems: state.cartItems.map((item, index) => 
                index === action.payload.index ? 
                { ...item, ...action.payload.updatedItem, companyId: action.payload.updatedItem.companyId } 
                : item
              ),
            };

    case ADD_SELECTED_IMAGE:
      return {
        ...state,
        selectedImages: [...state.selectedImages, action.payload],
      };

    case REMOVE_SELECTED_IMAGE:
      return {
        ...state,
        selectedImages: state.selectedImages.filter(
          image => image !== action.payload,
        ),
      };

    case ADD_TO_PENDING:
      return {
        ...state,
        pendingItems: [...state.pendingItems, action.payload],
      };

    case SET_NOTE_DETAILS:
      return {
        ...state,
        noteDetails: {
          ...state.noteDetails,
          ...action.payload,
        },
      };

    case DELETE_NOTE:
      return {
        ...state,
        noteDetails: {
          title: '',
          description: '',
        },
      };

    case SET_NOTE_SAVED:
      return {
        ...state,
        noteSaved: action.payload,
      };

    case CLEAR_CART:
      return {
        ...state,
        cartItems: [],
      };

    case SET_USER_ROLE:
      return {
        ...state,
        userRole: action.payload,
      };

    case SET_LOGGED_IN_USER:
      return {
        ...state,
        loggedInUser: action.payload,
      };

    case SET_SELECTED_COMPANY:
      return {
        ...state,
        selectedCompany: action.payload,
      };

    case STORE_CATEGORY_IDS:
      return {
        ...state,
        categoryIds: action.payload,
      };
      case SET_SOURCE_SCREEN:
        return {
          ...state,
          currentSourceScreen: action.payload,
        };  
    default:
      return state;
  }
};

export default reducers;
