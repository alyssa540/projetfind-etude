import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const userRegister = createAsyncThunk("user/register", async (user) => {
  try {
    // 👇 1. Nsajlou l'données lkol fi FormData bech ta9bel l'fichier (Logo)
    const formData = new FormData();
    Object.keys(user).forEach((key) => {
      // Nsobou ken les champs li fihom ktiba walla fichier
      if (user[key] !== null && user[key] !== undefined && user[key] !== "") {
        formData.append(key, user[key]);
      }
    });

    // 👇 2. Nab3thou l'formData lel Backend
    let response = await axios.post(
      "http://localhost:5000/user/register",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data", // 🚨 Très important bech Node.js yefhem li fama fichier
        },
      }
    );
   
    return response.data; 
  } catch (error) {
    console.log(error);
  }
});

export const userlogin = createAsyncThunk("user/logi", async (user) => {
  try {
    let response = await axios.post("http://localhost:5000/user/login", user);
    console.log(response.data);
 
    return response.data; 
  } catch (error) {
    console.log(error);
  }
});

export const userCurrent = createAsyncThunk("user/current", async () => {
  try {
    const token = localStorage.getItem("token");

    let response = await axios.get("http://localhost:5000/user/current", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.log(error);
  }
});

const initialState = {
  user: null,
  status: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout: (state, action) => {
      state.user = null;
      localStorage.removeItem("token");
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(userRegister.pending, (state) => {
        state.status = "pending";
      })
      .addCase(userRegister.fulfilled, (state, action) => {
        state.status = "successsss";
        // Ken l'backend traja3 fih newUserToken, tetsajjel houni
        if (action.payload) {
            state.user = action.payload.newUserToken; 
            localStorage.setItem("token", action.payload.token);
        }
      })
      .addCase(userRegister.rejected, (state) => {
        state.status = "fail";
      })
      .addCase(userlogin.pending, (state) => {
        state.status = "pending";
      })
      .addCase(userlogin.fulfilled, (state, action) => {
        state.status = "successsss";
        if (action.payload) {
            state.user = action.payload.user;
            localStorage.setItem("token", action.payload.token);
        }
      })
      .addCase(userlogin.rejected, (state) => {
        state.status = "fail";
      })
      .addCase(userCurrent.pending, (state) => {
        state.status = "pending";
      })
      .addCase(userCurrent.fulfilled, (state, action) => {
        state.status = "successsss";
        state.user = action.payload?.user;
      })
      .addCase(userCurrent.rejected, (state) => {
        state.status = "fail";
      });
  },
});

export const { logout } = userSlice.actions;

export default userSlice.reducer;