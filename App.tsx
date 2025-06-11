import { WebSocketProvider } from './contexts/webSocketContext';

// store
import { Provider } from 'react-redux';
import store from './store/store';

// navigation
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

// components
import Register from './components/Register';
import Chat from './components/Chat';
import Users from './components/Users';

function App() {
  return (
    <NavigationContainer>
      <WebSocketProvider>
        <Stack.Navigator initialRouteName='Register'>
          <Stack.Screen name='Register' component={Register} />
          <Stack.Screen name='Chat' component={Chat} />
          <Stack.Screen name='Users' component={Users} />
        </Stack.Navigator>
      </WebSocketProvider>
    </NavigationContainer>
  );
}

export default function entryPoint() {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}