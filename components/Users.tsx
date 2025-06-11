import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Alert } from "react-native";
import { useLayoutEffect } from 'react';
import { useNavigation } from "@react-navigation/native";
import { useWebSocket } from '../contexts/webSocketContext';

// store
import { useSelector, useDispatch } from 'react-redux';
import { close, unsetNotification } from '../store/reducer';

function MiniUser({ user }: any) {
    const navigation = useNavigation<any>();
    const dispatch = useDispatch();
    let isDisabled;

    if (user.self) {
        isDisabled = true;
    } else {
        isDisabled = false;
    }

    return (
        <TouchableOpacity
            style={[styles.container, isDisabled ? styles.self : null]}
            disabled={isDisabled}
            onPress={() => {
                if (!isDisabled) {
                    dispatch(unsetNotification(user));
                    navigation.navigate('Chat', user);
                }
            }}
        >
            <Image
                source={user.gender === 'male' ? require('../assets/img/male-user.png') : require('../assets/img/female-user.png')}
                style={styles.image}
            />
            <View style={styles.infoContainer}>
                <Text style={styles.name}>{user.name}</Text>
                <Text style={styles.age}>{user.age} years old</Text>
                <Text style={styles.description}>{user.description}</Text>
            </View>
            {isDisabled ?
                <TouchableOpacity>
                    <Image source={require('../assets/img/settings.png')} style={styles.settings} />
                </TouchableOpacity>
                :
                (user.notification > 0)?
                <View style={styles.new}><Text style={styles.newText}>{user.notification}</Text></View>
                : ''
            }
        </TouchableOpacity>
    );
};

export default function Users() {
    const navigation = useNavigation<any>();
    const { websocket } = useWebSocket();
    const dispatch = useDispatch();
    const state = useSelector((state: any) => state.general);

    const logout = () => {
        Alert.alert(
            'Your account will be deleted',
            'Are you sure you want to continue?',
            [
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                {
                    text: 'Continue',
                    onPress: () => {
                        websocket?.close();
                        dispatch(close());
                        navigation.navigate('Register');
                    },
                    style: 'default',
                },
            ],
            { cancelable: false }
        );
    }

    useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: () => false,
            headerRight: () => (
                <TouchableOpacity
                    onPress={logout}
                    style={styles.logoutButton}
                >
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
            ),
        });
    }, [navigation]);


    return (
        <ScrollView>
            <View style={{ padding: 10 }}>
                <MiniUser key={-1} user={{ ...state.yourInfo, self: true }} />
                {((state.people).length === 0) ? (
                    <Text style={{ textAlign: 'center', color: 'gray', marginTop: 5 }}>No online users</Text>
                ) : (
                    (state.people).map((person: any, index: Number) => {
                        const notification = (state.notification).find((notification:any) => notification.currentGuy === person.messagerID);
                        return <MiniUser key={index} user={{...person, yourID:state.yourID, notification:(notification)? notification.number_msg : 0}} />
                    })
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        marginVertical: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 1,
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    infoContainer: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    age: {
        fontSize: 14,
        color: '#555',
    },
    description: {
        fontSize: 12,
        color: '#777',
    },
    settings: {
        width: 20,
        height: 20,
        marginRight: 5,
    },
    new: {
        width: 22,
        height: 22,
        marginRight: 5,
        backgroundColor:'#0d6efd',
        borderRadius: 50,
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
    },
    newText: {
        color:'#FFFF',
        fontWeight:'bold',
    },
    self: {
        backgroundColor: '#F0FFF0',
    },
    logoutButton: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: '#FF3B30',
        borderRadius: 5,
        marginRight: 10,
    },
    logoutButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
});
