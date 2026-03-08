const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  description: { type: String, required: true },
  prix: { type: Number, required: true },
  taillesDisponibles: [{ type: String }], // ex: ["S", "M", "L"]
  image: { type: String }, // URL de l'image (Cloudinary/AWS)
  stylisteId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);