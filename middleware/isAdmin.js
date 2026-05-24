const isAdmin = (req, res, next) => {
  // L'isAuth mte3ek bech ykharej l'user w y7ottou fi req.user
  // Lhne nverifiw ken l'role mte3ou admin
  if (req.user && req.user.role === "admin") {
    next(); // Jawou behi, yet3adda lel route
  } else {
    res.status(403).json({ msg: "Accès refusé. Réservé uniquement aux administrateurs." });
  }
};

module.exports = isAdmin;