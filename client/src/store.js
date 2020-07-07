import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import rootReducer from './reducers'; //Comme on appellera le fichier index.js, pas besoin de le nommer, le folder suffit

const initialState = {};

const middleware = [thunk];

const store = createStore(
  rootReducer,
  initialState,
  composeWithDevTools(applyMiddleware(...middleware))
);

export default store;

//Fonctionnement redux : tout part du store. Dans le store on a les states
// Le rootreducer (reducer/index.js ) contient l'ensemble des reducers.
// Lorsqu'une action est déclenchée dans une page, le dispatch permet de faire le lien avec le reducer.
// Le reducer qui contient (état et action)  alimente et met à jour le store
