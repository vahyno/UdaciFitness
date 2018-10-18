import React from 'react';
import { View } from 'react-native';
import AddEntry from './components/AddEntry';
import {createStore} from 'redux';
import {Provider} from 'react-redux';
import reducer from './reducers';

const store = createStore(reducer);

export default class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <View style={{flex: 1}}>
          <AddEntry/>
        </View>
      </Provider>
    );
  }
}