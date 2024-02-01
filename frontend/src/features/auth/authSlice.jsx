import { createSlice } from "@reduxjs/toolkit";

import {
    fetchUser,
    verifyAuthentication,
    loginUserRequest,
} from "@/features/auth/authActions";

const initialState = {
    accessToken: localStorage.getItem("accessToken") || null,
    refreshToken: localStorage.getItem("refreshToken") || null,
    isAuthenticated: null,
    user: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        authenticatedSuccess: (state) => {
            state.isAuthenticated = true;
        },
        authenticatedFail: (state) => {
            state.isAuthenticated = false;
        },
        loginSuccess: (state, action) => {
            const { accessToken, refreshToken } = action.payload;
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);
            state.isAuthenticated = true;
            state.accessToken = accessToken;
            state.refreshToken = refreshToken;
        },
        loginFail: (state) => {
            state.isAuthenticated = false;
        },
        signupSuccess: (state) => {
            state.isAuthenticated = false;
        },
        userLoadedSuccess: (state, action) => {
            state.user = action.payload;
        },
        userLoadedFail: (state) => {
            state.user = null;
        },
        logout: (state) => {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            state.accessToken = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            state.user = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUser.fulfilled, (state, action) => {
                state.isAuthenticated = true;
                state.user = action.payload;
            })
            .addCase(fetchUser.rejected, (state) => {
                state.isAuthenticated = false;
                state.user = null;
            })
            .addCase(verifyAuthentication.fulfilled, (state, action) => {
                state.isAuthenticated = action.payload;
            })
            .addCase(verifyAuthentication.rejected, (state) => {
                state.isAuthenticated = false;
            })
            .addCase(loginUserRequest.rejected, (state) => {
                state.isAuthenticated = false;
            });
    },
});

export const {
    authenticatedSuccess,
    authenticatedFail,
    loginSuccess,
    loginFail,
    signupSuccess,
    userLoadedSuccess,
    userLoadedFail,
    logout,
} = authSlice.actions;

export default authSlice.reducer;
