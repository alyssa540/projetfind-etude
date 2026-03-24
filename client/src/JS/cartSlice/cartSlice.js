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

      // On vérifie si l'article existe déjà avec la MÊME taille
      const existingItem = state.items.find(
        (item) => item._id === produit._id && item.tailleChoisie === tailleChoisie
      );

      if (existingItem) {
        existingItem.quantite += 1;
      } else {
        // S'il n'existe pas, on l'ajoute avec une quantité initiale de 1
        state.items.push({ ...produit, tailleChoisie, quantite: 1 });
      }
      
      // On met à jour le montant total
      state.montantTotal += Number(produit.prix);
    },

    // Action pour mettre à jour la quantité depuis le panier
    updateItemQuantity: (state, action) => {
      const { index, quantite } = action.payload;
      const item = state.items[index];
      
      if (item) {
        // On calcule la différence pour mettre à jour le prix total proprement
        const differenceQuantite = quantite - item.quantite;
        state.montantTotal += differenceQuantite * Number(item.prix);
        
        // On assigne la nouvelle quantité
        item.quantite = quantite;
      }
    },

    // Action pour changer la taille d'un article depuis le panier
    updateItemSize: (state, action) => {
      const { index, tailleChoisie } = action.payload;
      if (state.items[index]) {
        state.items[index].tailleChoisie = tailleChoisie;
      }
    },

    // Action pour supprimer complètement une ligne du panier
    removeItem: (state, action) => {
      const index = action.payload;
      const item = state.items[index];
      
      if (item) {
        // On déduit la valeur totale de cet article du montant total
        state.montantTotal -= Number(item.prix) * Number(item.quantite);
        // On le retire du tableau
        state.items.splice(index, 1);
      }
    },
    
    // Action pour vider le panier une fois la commande validée
    clearCart: (state) => {
      state.items = [];
      state.montantTotal = 0;
    }
  },
});

// N'oubliez pas d'exporter toutes les nouvelles actions !
export const { 
  addToCart, 
  clearCart, 
  updateItemQuantity, 
  updateItemSize, 
  removeItem 
} = cartSlice.actions;

export default cartSlice.reducer;