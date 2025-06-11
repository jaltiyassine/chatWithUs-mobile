import { createSlice } from '@reduxjs/toolkit';

const generalSlice = createSlice({
  name: 'general',
  initialState: {
      yourID: null,
      yourInfo: null,
      people: [],
      messagesFrom: [],
      messagesTo: [],
      notification: [],
  },
  reducers: {
    setID: (state, action) => {
      state.yourID = (action.payload).yourID;
    },
    setInfo: (state, action) => {
      state.yourInfo = (action.payload);
    },
    setPeople: (state, action) => {
      state.people = (action.payload).people;
    },
    setMessagesFrom: (state, action) => {
      (state.messagesFrom).push(action.payload as never);
      
    },
    setMessagesTo: (state, action) => {
      (state.messagesTo).push(action.payload as never);

    },
    setNotification: (state, action) => {
      const currentGuy = (action.payload).from;

      // Check if the notification for currentGuy exists
      const existingNotification = (state.notification).find((notification:any) => notification.currentGuy === currentGuy);
    
      if (existingNotification) {
        existingNotification.number_msg += 1;
        
      } else {
        state.notification.push({
          currentGuy: currentGuy,
          number_msg: 1,
        } as never);
      }
    },
    unsetNotification: (state, action) => {
      const currentGuy = (action.payload).messagerID;
    
      // Check if the notification for currentGuy exists
      const existingNotification = state.notification.find((notification: any) => notification.currentGuy === currentGuy);
    
      if (existingNotification) {
        existingNotification.number_msg = 0;

      } else {
        state.notification.push({
          currentGuy: currentGuy,
          number_msg: 0,
        } as never);
      }
    },
    close: (state) => {
      state.yourID = null;
      state.yourInfo = null;
      state.people = [];
      state.messagesFrom = [];
      state.messagesTo = [];
      state.notification = [];
    },
  },
});

export const { setID, setInfo, setPeople, close, setMessagesFrom, setMessagesTo, setNotification, unsetNotification } = generalSlice.actions;

export default generalSlice.reducer;