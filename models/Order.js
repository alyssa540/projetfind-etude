const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  produitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  tailleChoisie: { type: String, required: true },
  quantite: { type: Number, default: 1 },
  statut: { 
    type: String, 
    enum: ['en_attente', 'confirmee', 'declinee'], 
    default: 'en_attente' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);