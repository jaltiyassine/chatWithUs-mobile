import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setID, setInfo, setPeople, setMessagesFrom, setNotification } from '../store/reducer';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';

interface WebSocketContextType {
    websocket: WebSocket | null;
    connectWebsocket: (name: string, age: number, gender: 'male' | 'female', description?: string | null) => void;
}

const defaultWebSocketContext: WebSocketContextType = {
    websocket: null,
    connectWebsocket: () => {},
};

const WebSocketContext = createContext<WebSocketContextType>(defaultWebSocketContext);

export const useWebSocket = () => {
    return useContext(WebSocketContext);
};

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [websocket, setWebsocket] = useState<WebSocket | null>(null);
    const dispatch = useDispatch();
    const navigation = useNavigation<any>();

    const connectWebsocket = (name: string, age: number, gender: 'male' | 'female', description: string | null = null) => {
        if (websocket) {
            navigation.navigate('Users');
            return;
        }

        const newWebSocket = new WebSocket('wss://robust-deluxe-pansy.glitch.me');
        setWebsocket(newWebSocket);

        newWebSocket.onopen = () => {
            console.log('Connected to WebSocket server');
            if (newWebSocket.readyState === WebSocket.OPEN) {
                newWebSocket.send(JSON.stringify({ 
                    name, 
                    age, 
                    gender, 
                    description, 
                    giveMeId: true 
                }));

                dispatch(setInfo({ name, age, gender, description }));
            }
        };

        newWebSocket.onmessage = (event: MessageEvent) => {
            const parsedMessage = JSON.parse(event.data);
            if (parsedMessage.yourID) {
                dispatch(setID({ yourID: parsedMessage.yourID }));
                dispatch(setPeople({ people: parsedMessage.currentPeople }));

                navigation.navigate('Users');

                const interval = setInterval(() => {
                    newWebSocket.send(JSON.stringify({ giveMeId: false }));
                }, 5000);

                newWebSocket.onclose = () => {
                    clearInterval(interval);
                    setWebsocket(null);
                };
                return;
            }

            if (parsedMessage.update) {
                dispatch(setPeople({ people: parsedMessage.currentPeople }));
            }

            if (parsedMessage.from) {
                dispatch(setMessagesFrom(parsedMessage));

                // notification setting
                dispatch(setNotification(parsedMessage));

            }
        };

        newWebSocket.onerror = (error: Event) => {
            navigation.navigate('Users');
            Alert.alert('Disconnected', 'This user is currently offline. Please try again later.', [{ text: 'Understood' }]);
        };

        newWebSocket.onclose = () => {
            console.log('WebSocket connection closed');
            setWebsocket(null);
        };
    };

    useEffect(() => {
        return () => {
            if (websocket) {
                websocket.close();
            }
        };
    }, [websocket]);

    return (
        <WebSocketContext.Provider value={{ websocket, connectWebsocket }}>
            {children}
        </WebSocketContext.Provider>
    );
};
