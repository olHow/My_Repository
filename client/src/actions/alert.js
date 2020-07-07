import { v4 as uuid } from 'uuid';
import { SET_ALERT, REMOVE_ALERT } from './types';

export const setAlert = (msg, alertType, timeout = 5000) => (dispatch) => {
  //time out = 5000 signifie que par défaut ça sera 5000 mais on peut le configurer autrement quand on appelle la fonction setAlert
  //middleware thunk permet de mettre dispatch comme cela et dispatcher plus qu'un type d'action de cette fonction
  //Lorsqu'une action est appelée dans une page, le dispatch va faire le lien avec le reducer et lui fournir l'action et la donnée.
  // rappel : le reducer grâce à action + état va alimenter le store pour MàJ les données
  const id = uuid();
  dispatch({
    type: SET_ALERT,
    payload: { msg, alertType, id },
  });

  setTimeout(() => dispatch({ type: REMOVE_ALERT, payload: id }), timeout);
  // permet de faire disparitre l'alerte après un certain temps.
};
