import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import Carousel from 'react-bootstrap/Carousel';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';

function Home() {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      if (direction === 'left') {
        scrollRef.current.scrollLeft -= 320;
      } else {
        scrollRef.current.scrollLeft += 320;
      }
    }
  };

  return (
    <div className="bg-[#faf9f7] text-[#2c2c2c] font-sans">
      {/* Hetha style sghir bech nkhabiw l'scrollbar mta3 l'caroussel loutani
        (Khatir Tailwind ma fihouch class officielle thezi l'scrollbar sans plugin)
      */}
      <style>
        {`
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}
      </style>

      {/* --- 1. MAIN CAROUSEL --- */}
         {/* --- 1. CAROUSEL --- */}

      <Carousel fade indicators={false} className="home-carousel">

        <Carousel.Item className="carousel-banner">

          <img

            className="d-block w-100 banner-img"

            src="https://i.pinimg.com/736x/af/1b/cd/af1bcdcc79dba00a5fc138911789b5ea.jpg"

            alt="Fashion"

          />

          <Carousel.Caption className="banner-caption">

            <h2>Bienvenue sur votre STYLIQUE</h2>

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

            <Link to="/register" className="btn-fashion-dark">Shopper le look</Link>

          </Carousel.Caption>

        </Carousel.Item>

      </Carousel>



      {/* --- 2. SECTION CARTES (SÉLECTION) --- */}
      <Container className="my-20">
        <div className="text-center mb-12">
          <h3 className="font-serif text-4xl font-bold text-[#1a1a1a] mb-2">Notre Sélection</h3>
          <p className="text-gray-500 tracking-wide">Les pièces les plus tendances du moment</p>
        </div>

        <Row>
          {/* Carte 1 */}
          <Col md={4} className="mb-8">
            <div className="group cursor-pointer">
              <div className="overflow-hidden rounded-xl bg-transparent">
                <img 
                  src="https://i.pinimg.com/736x/54/1c/bc/541cbcea66586f823db64eb0e429502a.jpg" 
                  alt="Long Dress" 
                  className="w-full h-[450px] object-cover transition-transform duration-700 ease-in-out group-hover:scale-105" 
                />
              </div>
              <div className="text-center pt-5">
                <h4 className="font-bold text-lg lowercase tracking-wide text-[#1a1a1a]">Long Dress</h4>
                <p className="text-gray-500 text-sm mt-1">White aesthetic long dress</p>
                <Link to="/catalogue" className="inline-block mt-3 text-[#1a1a1a] font-semibold text-sm uppercase tracking-wide border-b border-transparent transition-colors duration-300 group-hover:border-[#1a1a1a] no-underline pb-1">
                  Découvrir
                </Link>
              </div>
            </div>
          </Col>

          {/* Carte 2 */}
          <Col md={4} className="mb-8">
            <div className="group cursor-pointer">
              <div className="overflow-hidden rounded-xl bg-transparent">
                <img 
                  src="https://i.pinimg.com/1200x/f7/30/35/f730356f93b35eed7311102c295352a0.jpg" 
                  alt="Ballerina Dress" 
                  className="w-full h-[450px] object-cover transition-transform duration-700 ease-in-out group-hover:scale-105" 
                />
              </div>
              <div className="text-center pt-5">
                <h4 className="font-bold text-lg lowercase tracking-wide text-[#1a1a1a]">Ballerina Dress</h4>
                <p className="text-gray-500 text-sm mt-1">Baby pink mini dress</p>
                <Link to="/catalogue" className="inline-block mt-3 text-[#1a1a1a] font-semibold text-sm uppercase tracking-wide border-b border-transparent transition-colors duration-300 group-hover:border-[#1a1a1a] no-underline pb-1">
                  Découvrir
                </Link>
              </div>
            </div>
          </Col>

          {/* Carte 3 */}
          <Col md={4} className="mb-8">
            <div className="group cursor-pointer">
              <div className="overflow-hidden rounded-xl bg-transparent">
                <img 
                  src="https://i.pinimg.com/736x/93/27/35/932735d70a9b20f42fe9ba5936452d37.jpg" 
                  alt="Mini Dress" 
                  className="w-full h-[450px] object-cover transition-transform duration-700 ease-in-out group-hover:scale-105" 
                />
              </div>
              <div className="text-center pt-5">
                <h4 className="font-bold text-lg lowercase tracking-wide text-[#1a1a1a]">Mini Dress</h4>
                <p className="text-gray-500 text-sm mt-1">Pink mini dress details</p>
                <Link to="/catalogue" className="inline-block mt-3 text-[#1a1a1a] font-semibold text-sm uppercase tracking-wide border-b border-transparent transition-colors duration-300 group-hover:border-[#1a1a1a] no-underline pb-1">
                  Découvrir
                </Link>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      {/* --- 3. SECTION ABOUT / COMMUNITY --- */}
      <Container className="my-16 py-16 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center pl-[95px]">
        <Row className="justify-content-center mb-10">
          <Col md={9}>
            <h2 className="font-serif font-bold text-4xl text-[#1a1a1a] mb-6">Une communauté engagée</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              STYLIQUE est une marketplace globale, où les passionnés de mode se réunissent pour créer, vendre, et acheter des pièces uniques. Nous sommes aussi une communauté qui favorise un changement positif. <a href="#" className="text-[#1a1a1a] underline decoration-dashed underline-offset-4 font-semibold hover:text-gray-600">Découvrez notre impact.</a>
            </p>
          </Col>
        </Row>

        <Row className="justify-content-center mt-6 pl-[95px]" >
          <Col md={5} className="mb-6 px-6 text-left">
            <h4 className="font-semibold text-xl text-[#1a1a1a] mb-3">Soutenez les créateurs</h4>
            <p className="text-gray-500 leading-relaxed">
              Pas d'entrepôt géant – juste des milliers de passionnés. Nous vous connectons directement avec les stylistes pour des créations extraordinaires.
            </p>
          </Col>
          <Col md={5} className="mb-6 px-6 offset-md-1 text-left">
            <h4 className="font-semibold text-xl text-[#1a1a1a] mb-3">Achetez en toute sérénité</h4>
            <p className="text-gray-500 leading-relaxed">
              Votre sécurité et votre vie privée sont notre priorité absolue. Si vous avez besoin d'aide, notre équipe est toujours prête à vous accompagner.
            </p>
          </Col>
        </Row>
      </Container>

      {/* --- 3.5. SOCIAL CAROUSEL (rhode + you style) --- */}
      <div className="bg-[#f4f3ef] py-16 border-t border-gray-200 w-full">
        <Container>
          {/* Header Row */}
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-gray-600 m-0 tracking-wide text-2xl font-sans">
              stylique = stylish + unique
            </h3>
            <button className="bg-transparent border border-gray-500 rounded-full px-6 py-2 text-gray-600 text-xs font-bold tracking-widest hover:bg-gray-600 hover:text-white transition-all duration-300">
              FIND US ON SOCIAL
            </button>
          </div>

          {/* Horizontal Scroller */}
          <div 
            ref={scrollRef} 
            className="flex overflow-x-auto gap-4 scroll-smooth hide-scrollbar pb-4"
          >
            {[
              "https://i.pinimg.com/736x/07/15/eb/0715eb9d194439a1fd74a17faeb69325.jpg",
              "https://i.pinimg.com/1200x/ea/37/2f/ea372f8dc13c2c53ba8c164840110c0b.jpg",
              "https://i.pinimg.com/736x/dd/34/05/dd340514521e07b33c2e9f75ce7fa312.jpg",
              "https://i.pinimg.com/736x/36/1b/2c/361b2cc8979293390fac0066ea86d120.jpg",
              "https://i.pinimg.com/736x/06/5e/93/065e936ceeb651e3ce5bbfebc1756004.jpg"
            ].map((src, index) => (
              <div key={index} className="flex-none">
                <img 
                  src={src} 
                  alt={`Social ${index + 1}`} 
                  className="w-[280px] h-[280px] object-cover rounded-xl hover:opacity-85 transition-opacity duration-300 cursor-pointer" 
                />
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <div className="flex justify-end items-center mt-6 pt-6 border-t border-[#dcdad5]">
            <button 
              onClick={() => scroll('left')} 
              className="w-10 h-10 rounded-full border border-gray-400 flex justify-center items-center mr-3 text-gray-500 hover:bg-gray-400 hover:text-white transition-all duration-300"
            >
              &lt;
            </button>
            <button 
              onClick={() => scroll('right')} 
              className="w-10 h-10 rounded-full border border-gray-400 flex justify-center items-center text-gray-500 hover:bg-gray-400 hover:text-white transition-all duration-300"
            >
              &gt;
            </button>
          </div>
        </Container>
      </div>

      {/* --- 4. FOOTER --- */}
      <footer className="bg-white pt-16 pb-8 border-t border-gray-200">
        <Container>
          <Row>
            <Col md={4} className="mb-8">
              <h5 className="font-bold text-lg mb-4 text-[#1a1a1a] uppercase tracking-wider">STYLIQUE</h5>
              <p className="text-gray-500 leading-relaxed text-sm">La plateforme de référence pour découvrir des créateurs indépendants et des pièces uniques.</p>
            </Col>
            <Col md={4} className="mb-8">
              <h5 className="font-bold text-lg mb-4 text-[#1a1a1a] uppercase tracking-wider">Liens Rapides</h5>
              <ul className="list-none p-0 m-0 space-y-3">
                <li><a href="/" className="text-gray-500 hover:text-[#1a1a1a] transition-colors no-underline text-sm">Accueil</a></li>
                <li><a href="/catalogue" className="text-gray-500 hover:text-[#1a1a1a] transition-colors no-underline text-sm">Catalogue</a></li>
                <li><a href="/login" className="text-gray-500 hover:text-[#1a1a1a] transition-colors no-underline text-sm">Se connecter</a></li>
              </ul>
            </Col>
            <Col md={4} className="mb-8">
              <h5 className="font-bold text-lg mb-4 text-[#1a1a1a] uppercase tracking-wider">Nous Contacter</h5>
              <p className="text-gray-500 leading-relaxed text-sm">
                Email : contact@stylique.com<br/>
                Téléphone : +33 1 23 45 67 89
              </p>
            </Col>
          </Row>
          <div className="text-center pt-8 mt-8 border-t border-gray-100 text-gray-400 text-sm">
            <p className="m-0">&copy; 2026 STYLIQUE. Tous droits réservés.</p>
          </div>
        </Container>
      </footer>
    </div>
  );
}

export default Home;