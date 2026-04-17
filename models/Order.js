const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  produitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  tailleChoisie: { type: String, required: true },
  quantite: { type: Number, default: 1 },
  statut: { 
    type: String, 
    // 👇 ZEDNA 'annulee' LEL ENUM HOUNI
    enum: ['en_attente', 'confirmee', 'declinee', 'expediee', 'annulee'], 
    default: 'en_attente' 
  },
  adresseLivraison: {
    type: String,
    
  },
  telephoneContact: {
    type: String,
    
  },
  // 👇 ZEDNA HETHI LEL ARCHIVE
  estArchivee: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);