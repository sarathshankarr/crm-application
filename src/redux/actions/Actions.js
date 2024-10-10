import {ADD_SELECTED_IMAGE, ADD_TO_CART, ADD_TO_PENDING, DELETE_NOTE, REMOVE_FROM_CART, REMOVE_SELECTED_IMAGE, SET_NOTE_DETAILS, UPDATE_CART_ITEM,SET_NOTE_TITLE,SET_NOTE_DESCRIPTION, SET_NOTE_SAVED, CLEAR_CART, SET_USER_ROLE, SET_LOGGED_IN_USER, SET_SELECTED_COMPANY, STORE_CATEGORY_IDS, SET_CURRENT_SCREEN, SET_SOURCE_SCREEN} from '../ActionTypes';

export const addItemToCart = (data) => ({
  type: ADD_TO_CART,
  payload: data,
});


export const removeFromCart = (index) => ({
  type: REMOVE_FROM_CART,
  payload: index,
});

export const updateCartItem = (index, updatedItem) => ({
  type: UPDATE_CART_ITEM,
  payload: { index, updatedItem },
});
export const addSelectedImage = (imageUri) => ({
  type: ADD_SELECTED_IMAGE,
  payload: imageUri,
});

export const removeSelectedImage = (imageUri) => ({
  type: REMOVE_SELECTED_IMAGE,
  payload: imageUri,
});
export const addToPending = (cartItems) => {
  
  return {
    type: ADD_TO_PENDING,
    payload: cartItems,
  };
};
export const setNoteDetails = ({ title, description }) => {
  return {
    type: SET_NOTE_DETAILS,
    payload: { title, description }
  };
};
export const deleteNoteAction = () => {
  return {
    type: DELETE_NOTE,
  };
};
export const setNoteTitle = (title) => ({
  type: SET_NOTE_TITLE,
  payload: title,
});

export const setNoteDescription = (description) => ({
  type: SET_NOTE_DESCRIPTION,
  payload: description,
});
export const setNoteSaved = (isSaved) => ({
  type: SET_NOTE_SAVED,
  payload: isSaved,
});
export const clearCart = () => ({
  type: CLEAR_CART,
});

export const setUserRole = (role) => ({
  type: SET_USER_ROLE,
  payload: role,
});

export const setLoggedInUser = (user) => ({
  type: SET_LOGGED_IN_USER,
  payload: user,
});
export const setSelectedCompany = (company) => ({
  type: SET_SELECTED_COMPANY,
  payload: company,
});
export const storeCategoryIds = (categoryIds) => ({
  type: STORE_CATEGORY_IDS,
  payload: categoryIds,
});

export const setSourceScreen = (sourceScreen) => ({
  type: SET_SOURCE_SCREEN,
  payload: sourceScreen,
});
