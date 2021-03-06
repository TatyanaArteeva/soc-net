import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './components/app/App';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import reducer from './reducer';
import { BrowserRouter as Router } from 'react-router-dom';
import ServiceContext from './components/servicesContext/servicesContext';
import Service from './service/service';
import ErrorBoundry from './components/errorBoundry/errorBoundry';
const store = createStore(reducer);

const service = new Service();

ReactDOM.render(
    <Provider store={store}>
        <ErrorBoundry>
            <ServiceContext.Provider value={service}>
                <Router getUserConfirmation={() => { }}>
                    <App />
                </Router>
            </ServiceContext.Provider>
        </ErrorBoundry>
    </Provider>
    , document.getElementById('root'));

