const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['client', 'styliste', 'admin'], 
    required: true 
  },
  taille: { type: String },
  adress: { type: String },
  phone: { type: String },
  

  nom_marque: { type: String }, 
  logo: { type: String },
  preferences: {
  style: { type: String, default: "casual" },
  couleurs: { type: String, default: "" },
  occasion: { type: String, default: "tous les jours" }
}, 

  
  estBloque: { type: Boolean, default: false } 
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);