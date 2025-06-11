import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useLayoutEffect, useState, useRef } from 'react';

// store
import { useSelector, useDispatch } from 'react-redux';
import { setMessagesTo } from '../store/reducer';

// websocket context
import { useWebSocket } from "../contexts/webSocketContext";

function Message({ isReceived, datetime, content }: any) {
    const date = new Date(datetime);
    
    const formattedDatetime = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    }).format(date);

    return (
        <View style={[styles.container, isReceived ? styles.received : styles.sent]}>
            <Text style={styles.content}>{content}</Text>
            <Text style={styles.timestamp}>{formattedDatetime}</Text>
        </View>
    );
}

export default function Chat() {
    const navigation = useNavigation<any>();
    const scrollViewRef = useRef<ScrollView>(null);
    const [inputText, setInputText] = useState('');
    const dispatch = useDispatch();
    const { websocket } = useWebSocket();
    const state = useSelector((state: any) => state.general);

    // route params
    const route = useRoute<any>();

    // some attributes are not used yet, but they might be used later in advanced updates
    const { messagerID, yourID, name, age, gender, description } = route.params;

    // Filter messagesFrom and messagesTo by messagerID
    const messagesFrom = (state.messagesFrom).filter((message: any) => message.from === messagerID)
    .map((message: any) => ({
      ...message,
      isReceived: true,
      from: undefined,
      to: undefined
    }));
  
    const messagesTo = (state.messagesTo).filter((message: any) => message.to === messagerID)
    .map((message: any) => ({
        ...message,
        isReceived: false,
        from: undefined,
        to: undefined
      }));

    // final messages phase
    const combinedMessages = [...messagesFrom, ...messagesTo].sort((a, b) => a.datetime - b.datetime);

    useLayoutEffect(() => {
        navigation.setOptions({
            title: 'Chat with ' + name,
        });
    }, [navigation]);

    const handleSend = () => {
        if (inputText.trim()) {
            const message = {
                from: yourID,
                to: messagerID,
                datetime: Date.now(),
                content: inputText,
            };

            // set the message in store
            dispatch(setMessagesTo(message));

            // send the message to the user
            websocket?.send(JSON.stringify(message));

            // unset the input text value
            setInputText('');
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <ScrollView
                style={{ flex: 1 }}
                ref={scrollViewRef}
                contentContainerStyle={{ paddingBottom: 50 }}
                onContentSizeChange={() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                }}
            >
                <View style={{ padding: 10 }}>
                    {combinedMessages.length > 0 ? (
                        combinedMessages.map((msg: any, index: number) => (
                            <Message key={index} {...msg} />
                        ))
                    ) : (
                        <Text style={{ textAlign: 'center', color: 'gray', marginTop: 5 }}>No messages yet</Text>
                    )}
                </View>
            </ScrollView>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Type your message..."
                    value={inputText}
                    onChangeText={setInputText}
                />
                <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                    <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        maxWidth: '80%',
        padding: 10,
        borderRadius: 10,
        marginVertical: 5,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    received: {
        backgroundColor: '#C7D3FF',
        alignSelf: 'flex-start',
    },
    sent: {
        backgroundColor: '#E1FFC7',
        alignSelf: 'flex-end',
    },
    content: {
        fontSize: 16,
    },
    timestamp: {
        fontSize: 12,
        color: '#888',
        marginTop: 5,
        textAlign: 'right',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        backgroundColor: '#F9F9F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    input: {
        flex: 1,
        height: 45,
        padding: 10,
        marginRight: 10,
        borderColor: '#CED4DA',
        borderWidth: 1,
        borderRadius: 25,
        backgroundColor: '#FFFFFF',
    },
    sendButton: {
        backgroundColor: '#191970',
        paddingVertical: 12,
        borderRadius: 25,
        paddingHorizontal: 20,

    },
    sendButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
});