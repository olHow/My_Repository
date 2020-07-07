import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const Alert = ({ alerts }) =>
  // alerts est le destructuré de props.alerts
  alerts !== null &&
  alerts.length > 0 &&
  alerts.map((alert) => (
    <div key={alert.id} className={`alert alert-${alert.alertType}`}>
      {alert.msg}
    </div>
  ));

Alert.propTypes = {
  alerts: PropTypes.array.isRequired,
};

const mapStateToProps = (state) => ({
  alerts: state.alert,
});
// mapStateToProps permet d'aller chercher les états dans redux et les utiliser en tant que props dans le component.
// donne acces à props.alerts ou en destructuré, alerts

export default connect(mapStateToProps)(Alert);
// each time we want to interact with redux : connect
//1er paramètre de connect (optionnel) : State we want to map (from alert profile, etc...)
//2nd paramètre (optionnel) : object avec l'action que l'on veut utiliser
