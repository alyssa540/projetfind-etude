import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./userSlice/userSlice"; // Ton auth actuel
import cartReducer from "./cartSlice/cartSlice"; // <-- Nouvel import du panier

export const store = configureStore({
  reducer: {
    user: authReducer, 
    cart: cartReducer, // <-- On ajoute le panier au store global
  },
});