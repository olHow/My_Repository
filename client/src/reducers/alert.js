import { SET_ALERT, REMOVE_ALERT } from '../actions/types';

const initialState = [];
// NB : chaque alerte aura la forme d'un objet avec un id, un msg, et un alert type.
// Rappel : chaque reducer a besoin d'un etat et d'une action.
// Une action contient deux choses : un type (mandatory, ce qui sera évalué), et un payload (la donnée)

export default function (state = initialState, action) {
  const { type, payload } = action; // destructuring -- revient à dire que maintenant on utilise type pour action.type et payload pour action.payload

  switch (type) {
    case SET_ALERT:
      return [...state, payload]; // copie le tableau en place et rajoute le payload/data de l'action
    case REMOVE_ALERT:
      return state.filter((alert) => alert.id !== payload); // retire l'alerte avec l'id concernée
    default:
      return state;
  }
}
