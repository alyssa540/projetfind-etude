import React from 'react';
import { Link } from 'react-router-dom';
import Carousel from 'react-bootstrap/Carousel';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';

function Home() {
  return (
    <div>
      {/* --- 1. SECTION CARROUSEL (INTRO) --- */}
      <Carousel fade indicators={false} className="home-carousel">
        <Carousel.Item className="carousel-banner">
          <img
            className="d-block w-100 banner-img"
            src="https://i.pinimg.com/736x/af/1b/cd/af1bcdcc79dba00a5fc138911789b5ea.jpg"
            alt="Fashion"
          />
          <Carousel.Caption className="banner-caption">
            <h2>Bienvenue sur votre Fashion Hub</h2>
            <p>Découvrez les dernières créations de nos stylistes indépendants.</p>
            <Link to="/catalogue" className="btn-fashion-dark">Voir le catalogue</Link>
          </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item className="carousel-banner carousel-banner-2">
          <img
            className="d-block w-100 banner-img"
            src="https://i.pinimg.com/1200x/1d/f1/84/1df1841c17ecec8068347a0da57a2e18.jpg"
            
            alt="Style"
          />
          <Carousel.Caption className="banner-caption">
            <h2>Exprimez votre style</h2>
            <p>Des pièces uniques qui vous ressemblent.</p>
            <Link to="/catalogue" className="btn-fashion-dark">Shopper le look</Link>
          </Carousel.Caption>
        </Carousel.Item>
      </Carousel>

      {/* --- 2. SECTION CARTES (SÉLECTION) --- */}
      <Container className="my-5 pt-4">
        <div className="text-center mb-5">
          <h3 className="section-title">Notre Sélection</h3>
          <p className="text-muted">Les pièces les plus tendances du moment</p>
        </div>

        <Row>
          {/* Carte 1 */}
          <Col md={4} className="mb-4">
            <Card className="fashion-card border-0">
              <div className="card-img-wrapper">
                <Card.Img variant="top" src="https://i.pinimg.com/736x/54/1c/bc/541cbcea66586f823db64eb0e429502a.jpg" className="card-image-zoom" />
              </div>
              <Card.Body className="text-center">
                <Card.Title className="card-fashion-title">long dress</Card.Title>
                <Card.Text className="text-muted small">white long dress</Card.Text>
                <Link to="/catalogue" className="card-link-fashion">Découvrir</Link>
              </Card.Body>
            </Card>
          </Col>

          {/* Carte 2 */}
          <Col md={4} className="mb-4">
            <Card className="fashion-card border-0">
              <div className="card-img-wrapper">
                <Card.Img variant="top" src="https://i.pinimg.com/1200x/f7/30/35/f730356f93b35eed7311102c295352a0.jpg" className="card-image-zoom" />
              </div>
              <Card.Body className="text-center">
                <Card.Title className="card-fashion-title">ballerina dress</Card.Title>
                <Card.Text className="text-muted small">baby pink mini dress</Card.Text>
                <Link to="/catalogue" className="card-link-fashion">Découvrir</Link>
              </Card.Body>
            </Card>
          </Col>

          {/* Carte 3 */}
          <Col md={4} className="mb-4">
            <Card className="fashion-card border-0">
              <div className="card-img-wrapper">
                <Card.Img variant="top" src="https://i.pinimg.com/736x/93/27/35/932735d70a9b20f42fe9ba5936452d37.jpg" className="card-image-zoom" />
              </div>
              <Card.Body className="text-center">
                <Card.Title className="card-fashion-title">mini dress </Card.Title>
                <Card.Text className="text-muted small">pink mini dress.</Card.Text>
                <Link to="/catalogue" className="card-link-fashion">Découvrir</Link>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      {/* --- 3. SECTION CTA (FOOTER) --- */}
      <footer className="fashion-footer">
      <Container>
        <Row>
          <Col md={4} className="mb-4">
            <h5 className="footer-title">Fashion Hub</h5>
            <p className="footer-text">La plateforme de référence pour découvrir des créateurs indépendants et des pièces uniques.</p>
          </Col>
          <Col md={4} className="mb-4">
            <h5 className="footer-title">Liens Rapides</h5>
            <ul className="footer-links">
              <li><a href="/">Accueil</a></li>
              <li><a href="/catalogue">Catalogue</a></li>
              <li><a href="/login">Se connecter</a></li>
            </ul>
          </Col>
          <Col md={4} className="mb-4">
            <h5 className="footer-title">Nous Contacter</h5>
            <p className="footer-text">Email : contact@fashionhub.com<br/>Téléphone : +33 1 23 45 67 89</p>
          </Col>
        </Row>
        <div className="footer-bottom text-center pt-3 mt-3 border-top border-secondary">
          <p className="small m-0 text-muted">&copy; 2026 Fashion Hub. Tous droits réservés.</p>
        </div>
      </Container>
    </footer>
    </div>
  );
}

export default Home;