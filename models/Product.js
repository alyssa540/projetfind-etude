const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  description: { type: String, required: true },
  prix: { type: Number, required: true },
  taillesDisponibles: [{ type: String }], // ex: ["S", "M", "L"]
  image: { type: String }, 
  
  // 👇 LES NOUVEAUX CHAMPS POUR L'IA 👇
  categorie: { type: String, required: true },
  style: { type: String, required: true }, 
  couleurs: [{ type: String, required: true }],
  occasion: { type: String, required: true }, 
  // 👆 ---------------------------- 👆

  isArchived: { type: Boolean, default: false },
  stylisteId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);