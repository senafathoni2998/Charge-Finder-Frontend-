import {createSlice, PayloadAction} from '@reduxjs/toolkit';

type AppState = {
  isSidebarOpen: boolean;
  isMdMode: boolean;
};

const initialState: AppState = {
  isSidebarOpen: true,
  isMdMode: false,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.isSidebarOpen = action.payload;
    },
    setMdMode(state, action: PayloadAction<boolean>) {
      state.isMdMode = action.payload;
    },
  },
});

export const { setSidebarOpen, setMdMode } = appSlice.actions;
export default appSlice.reducer;