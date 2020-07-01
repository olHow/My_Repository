import { SET_ALERT, REMOVE_ALERT } from '../actions/types';

const initialState = [];

export default function (state = initialState, action) {
  const { type, payload } = action; // revient à dire que maintenant on utilise type pour action.type et payload pour action.payload

  switch (type) {
    case SET_ALERT:
      return [...state, payload]; // copie le tableau en place et rajoute le payload de l'action
    case REMOVE_ALERT:
      return state.filter((alert) => alert.id !== payload); // retire l'alerte avec l'id concernée
    default:
      return state;
  }
}
