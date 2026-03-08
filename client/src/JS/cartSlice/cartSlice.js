import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [], // La liste des produits ajoutés au panier
    montantTotal: 0, // Le prix total
  },
  reducers: {
    // Action pour ajouter un produit
    addToCart: (state, action) => {
      const produit = action.payload.produit;
      const tailleChoisie = action.payload.taille;

      state.items.push({ ...produit, tailleChoisie });
      state.montantTotal += Number(produit.prix);
    },
    
    // Action pour vider le panier une fois la commande validée
    clearCart: (state) => {
      state.items = [];
      state.montantTotal = 0;
    }
  },
});

export const { addToCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;