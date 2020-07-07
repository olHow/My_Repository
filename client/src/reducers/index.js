import { combineReducers } from 'redux';
import alert from './alert';

// Il s'agit ici d'un "root reducer".
// L'idée ici est d'avoir un fichier unique qui rassemble tous les reducers (alert, ...) grace à la fonction combineReducers
// on créera des pages pour chaque reducer (alert.js, ...)
// Chaque reducer aura besoin d'un state + d'une action provenant du folder action (elles mêmes déclenchées dans les pages)
export default combineReducers({
  alert,
});
