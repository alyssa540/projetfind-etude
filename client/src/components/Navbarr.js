import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from "react-redux";
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

function Navbarr() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user?.user);
  
  const handleLogout = () => {
    // Si tu utilises le localStorage pour le token, n'oublie pas de le vider ici :
    localStorage.removeItem("token");
    navigate("/login"); 
  };

  return (
   <Navbar expand="lg" className="custom-navbar">
      <Container fluid>
        <Navbar.Brand as={Link} to="/">
          FashionHubStyle
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="navbarScroll" />
        
        <Navbar.Collapse id="navbarScroll">
          <Nav className="me-auto my-2 my-lg-0" navbarScroll>
            <Nav.Link as={Link} to="/">Accueil</Nav.Link>
            
            {/* SI NON CONNECTÉ : On affiche Register / Login */}
            {!user && (
              <>
                <Nav.Link as={Link} to="/register">S'inscrire</Nav.Link>
                <Nav.Link as={Link} to="/login">Se connecter</Nav.Link>
              </>
            )}

            {/* Liens spécifiques au CLIENT */}
            {user?.role === "client" && (
              <>
                <Nav.Link as={Link} to="/panier">Panier</Nav.Link>
                <Nav.Link as={Link} to="/mes-commandes">Mes Achats</Nav.Link>
              </>
            )}

            {/* Liens spécifiques au STYLISTE */}
            {user?.role === "styliste" && (
              <>
                <Nav.Link as={Link} to="/mes-ventes">  Mes Ventes</Nav.Link>
                <Nav.Link as={Link} to="/add-product" className="text-success fw-bold">+ Création</Nav.Link>
              </>
            )}

            {/* Liens spécifiques à l'ADMIN */}
            {user?.role === "admin" && (
              <Nav.Link as={Link} to="/admin-dashboard"> Dashboard Admin</Nav.Link>
            )}
          </Nav>

          {/* Barre de recherche (toujours visible) */}
         {/* Barre de recherche (Minimaliste et alignée) */}
          <Form className="d-flex align-items-center ms-auto my-2 my-lg-0">
            <Form.Control
              type="search"
              placeholder="Rechercher..."
              className="search-chic"
              aria-label="Search"
            />
            <button type="button" className="btn-search-chic">Chercher</button>
          </Form>

          {/* Profil et Déconnexion (visible seulement si connecté) */}
          {user && (
            <Nav className="d-flex align-items-center">
              <Nav.Link as={Link} to="/profil" className="fw-bold me-2"> Profil</Nav.Link>
              <Button variant="danger" size="sm" onClick={handleLogout}>Déconnexion</Button>
            </Nav>
          )}

        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navbarr;