import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

function Home() {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      if (direction === 'left') {
        scrollRef.current.scrollLeft -= 350;
      } else {
        scrollRef.current.scrollLeft += 350;
      }
    }
  };

  return (
    <div className="bg-[#FAF9F7] text-[#111] font-sans overflow-x-hidden">
      
      {/* --- CUSTOM CSS FOR SCROLLBARS & MARQUEE --- */}
      <style>
        {`
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            display: inline-block;
            white-space: nowrap;
            animation: marquee 12s linear infinite;
          }
          
          /* Overriding standard bootstrap carousel to make it raw and editorial */
          .carousel-caption {
            bottom: 15% !important;
            left: 5% !important;
            right: auto !important;
            text-align: left !important;
            padding: 0 !important;
          }
        `}
      </style>

      {/* --- 1. HERO — full-screen image --- */}
      <div className="relative w-full h-screen overflow-hidden">
        <img
          src="https://i.pinimg.com/1200x/48/e0/a4/48e0a4ceae9fc6eb9065f8961bf82823.jpg"
          alt="Fashion"
          className="w-full h-full object-cover"
        />

        {/* Text overlay — bottom-left, matching original caption style */}
        <div className="absolute bottom-[12%] left-[5%] z-10">
          <h2 className="text-[12vw] md:text-[8vw] font-black leading-[0.8] tracking-tighter uppercase text-white drop-shadow-2xl mix-blend-difference">
            Bienvenue<br/>
            <span className="font-serif italic text-[14vw] md:text-[10vw] font-light lowercase">stylique</span>
          </h2>
          <div className="mt-8">
            <Link
              to="/catalogue"
              className="bg-[#e6ff00] text-black font-bold uppercase tracking-widest text-sm px-8 py-4 hover:bg-black hover:text-[#e6ff00] transition-colors duration-300 transform -rotate-2 inline-block"
            >
              Voir le catalogue
            </Link>
          </div>
        </div>
      </div>


      {/* --- SCROLLING MARQUEE --- */}
      <div className="bg-[#111] text-[#FAF9F7] py-4 overflow-hidden border-y-4 border-[#e6ff00] mt-12 md:mt-20 transform -rotate-1 origin-left w-[110vw] -ml-[5vw]">
        <div className="animate-marquee font-serif italic text-2xl md:text-4xl tracking-widest">
          {Array(10).fill("STYLIQUE = STYLISH + UNIQUE • SHOP NOW • ").join(" ")}
        </div>
      </div>


      {/* --- 2. SECTION CARTES (ASYMMETRICAL & OVERLAPPING) --- */}
      <Container className="my-24">
        <div className="mb-16 md:mb-24 flex flex-col md:flex-row justify-between items-end">
          <h3 className="font-sans text-[3rem] md:text-[5rem] font-black leading-[0.85] tracking-tighter uppercase">
            Notre<br/>
            <span className="font-serif italic text-gray-500 font-light lowercase">Sélection</span>
          </h3>
          <p className="text-gray-500 tracking-widest uppercase text-xs font-bold mt-4 md:mt-0 max-w-[200px] text-right">
            Les pièces les plus tendances du moment
          </p>
        </div>

        <Row className="relative">
          {/* Carte 1 - Normal position */}
          <Col md={4} className="mb-16 md:mb-0 z-10">
            <div className="group cursor-pointer relative">
              <img 
                src="https://i.pinimg.com/736x/54/1c/bc/541cbcea66586f823db64eb0e429502a.jpg" 
                alt="Long Dress" 
                className="w-full h-[500px] object-cover filter contrast-125" 
              />
              <div className="absolute -bottom-8 -right-4 md:-left-4 bg-[#FAF9F7] p-5 w-[85%] border-2 border-black transition-transform duration-300 group-hover:-translate-y-2 group-hover:translate-x-2">
                <h4 className="font-serif italic text-2xl text-black">Long Dress</h4>
                <p className="text-gray-500 text-xs uppercase tracking-widest mt-2 mb-4">White aesthetic</p>
                <Link to="/catalogue" className="font-black text-sm uppercase tracking-wide border-b-2 border-black pb-1 hover:text-[#e6ff00] hover:bg-black transition-all">Découvrir</Link>
              </div>
            </div>
          </Col>

          {/* Carte 2 - Pushed Down */}
          <Col md={4} className="mb-16 md:mb-0 md:mt-32 z-20">
            <div className="group cursor-pointer relative">
              <img 
                src="https://i.pinimg.com/1200x/f7/30/35/f730356f93b35eed7311102c295352a0.jpg" 
                alt="Ballerina Dress" 
                className="w-full h-[550px] object-cover" 
              />
              <div className="absolute -bottom-10 right-4 bg-black text-white p-5 w-[90%] transition-transform duration-300 group-hover:-rotate-2 group-hover:scale-105">
                <h4 className="font-serif italic text-2xl">Ballerina Dress</h4>
                <p className="text-gray-400 text-xs uppercase tracking-widest mt-2 mb-4">Baby pink mini</p>
                <Link to="/catalogue" className="text-[#e6ff00] font-black text-sm uppercase tracking-wide border-b-2 border-[#e6ff00] pb-1 hover:text-white transition-all">Découvrir</Link>
              </div>
            </div>
          </Col>

          {/* Carte 3 - Staggered Middle */}
          <Col md={4} className="mb-16 md:mb-0 md:mt-12 z-10">
            <div className="group cursor-pointer relative">
              <img 
                src="https://i.pinimg.com/736x/93/27/35/932735d70a9b20f42fe9ba5936452d37.jpg" 
                alt="Mini Dress" 
                className="w-full h-[450px] object-cover filter sepia-[20%]" 
              />
              <div className="absolute top-10 -left-8 bg-[#FAF9F7] p-5 w-[85%] border-2 border-black transition-transform duration-300 group-hover:translate-x-4">
                <h4 className="font-serif italic text-2xl text-black">Mini Dress</h4>
                <p className="text-gray-500 text-xs uppercase tracking-widest mt-2 mb-4">Pink details</p>
                <Link to="/catalogue" className="font-black text-sm uppercase tracking-wide border-b-2 border-black pb-1 hover:text-[#e6ff00] hover:bg-black transition-all">Découvrir</Link>
              </div>
            </div>
          </Col>
        </Row>
      </Container>


      {/* --- 3. SECTION ABOUT / COMMUNITY (BRUTALIST BLOCK) --- */}
      <div className="bg-[#EAE8E3] py-24 border-y border-black mt-32 relative">
        <Container>
          <Row className="justify-content-center text-center md:text-left">
            <Col md={10}>
              <h2 className="font-sans font-black text-[3rem] md:text-[5rem] uppercase leading-[0.8] tracking-tighter mb-12">
                Une communauté <br/><span className="font-serif italic font-light lowercase text-gray-500">engagée</span>
              </h2>
              
              <div className="grid md:grid-cols-2 gap-12 border-t-2 border-black pt-12">
                <div>
                  <p className="text-xl md:text-3xl font-serif italic leading-snug mb-6">
                    STYLIQUE est une marketplace globale, où les passionnés de mode se réunissent.
                  </p>
                  <a href="#" className="inline-block bg-black text-white px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-[#e6ff00] hover:text-black transition-colors">
                    Découvrez notre impact
                  </a>
                </div>
                
                <div className="flex flex-col gap-8">
                  <div>
                    <h4 className="font-bold text-sm uppercase tracking-widest mb-2 border-l-4 border-[#e6ff00] pl-3">Soutenez les créateurs</h4>
                    <p className="text-gray-600">Pas d'entrepôt géant – juste des milliers de passionnés. Nous vous connectons directement avec les stylistes.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm uppercase tracking-widest mb-2 border-l-4 border-black pl-3">Achetez en toute sérénité</h4>
                    <p className="text-gray-600">Votre sécurité et votre vie privée sont notre priorité absolue. L'équipe est toujours prête à vous accompagner.</p>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* --- 3.5. SOCIAL CAROUSEL (RAW & FUN) --- */}
      <div className="bg-[#FAF9F7] py-24 overflow-hidden relative">
        {/* Decorative background text */}
        <div className="absolute top-10 left-0 text-[15vw] font-black text-gray-100 whitespace-nowrap z-0 pointer-events-none select-none">
          STYLISH + UNIQUE
        </div>

        <Container className="relative z-10">
          <div className="flex justify-between items-end mb-12 border-b-2 border-black pb-4">
            <h3 className="font-serif italic text-4xl m-0 text-black">
              socials
            </h3>
            <button className="text-black text-xs font-black uppercase tracking-widest hover:text-[#e6ff00] transition-colors bg-white px-4 py-2 border-2 border-black">
              @stylique
            </button>
          </div>

          <div 
            ref={scrollRef} 
            className="flex overflow-x-auto gap-8 scroll-smooth hide-scrollbar pb-8 pt-4 items-center"
          >
            {[
              "https://i.pinimg.com/736x/07/15/eb/0715eb9d194439a1fd74a17faeb69325.jpg",
              "https://i.pinimg.com/1200x/ea/37/2f/ea372f8dc13c2c53ba8c164840110c0b.jpg",
              "https://i.pinimg.com/736x/dd/34/05/dd340514521e07b33c2e9f75ce7fa312.jpg",
              "https://i.pinimg.com/736x/36/1b/2c/361b2cc8979293390fac0066ea86d120.jpg",
              "https://i.pinimg.com/736x/06/5e/93/065e936ceeb651e3ce5bbfebc1756004.jpg"
            ].map((src, index) => (
              <div key={index} className="flex-none group">
                <img 
                  src={src} 
                  alt={`Social ${index + 1}`} 
                  /* Making the heights alternate slightly for that collage look */
                  className={`w-[280px] object-cover transition-all duration-500 cursor-pointer filter grayscale hover:grayscale-0 
                    ${index % 2 === 0 ? 'h-[350px] group-hover:rotate-2' : 'h-[300px] mt-12 group-hover:-rotate-2'}
                  `} 
                />
              </div>
            ))}
          </div>

          <div className="flex justify-start gap-4 mt-8">
            <button 
              onClick={() => scroll('left')} 
              className="w-16 h-16 bg-black text-white flex justify-center items-center text-2xl font-light hover:bg-[#e6ff00] hover:text-black transition-colors"
            >
              ←
            </button>
            <button 
              onClick={() => scroll('right')} 
              className="w-16 h-16 bg-black text-white flex justify-center items-center text-2xl font-light hover:bg-[#e6ff00] hover:text-black transition-colors"
            >
              →
            </button>
          </div>
        </Container>
      </div>

      {/* --- 4. FOOTER (CHUNKY & BOLD) --- */}
      <footer className="bg-black text-white pt-24 pb-8">
        <Container>
          <Row>
            <Col md={12} className="mb-12">
              {/* Massive Footer Logo */}
              <h1 className="text-[15vw] md:text-[12vw] font-black leading-[0.7] tracking-tighter text-center md:text-left text-[#e6ff00] mb-8">
                STYLIQUE
              </h1>
            </Col>
          </Row>

          <Row className="border-t border-gray-800 pt-12">
            <Col md={4} className="mb-8">
              <p className="text-gray-400 leading-relaxed font-serif italic text-xl pr-8">
                La plateforme de référence pour découvrir des créateurs indépendants et des pièces uniques.
              </p>
            </Col>
            <Col md={4} className="mb-8">
              <h5 className="font-bold text-xs mb-6 text-white uppercase tracking-widest">Liens Rapides</h5>
              <ul className="list-none p-0 m-0 space-y-4">
                <li><a href="/" className="font-serif italic text-lg text-gray-400 hover:text-[#e6ff00] transition-colors no-underline">Accueil</a></li>
                <li><a href="/catalogue" className="font-serif italic text-lg text-gray-400 hover:text-[#e6ff00] transition-colors no-underline">Catalogue</a></li>
                <li><a href="/login" className="font-serif italic text-lg text-gray-400 hover:text-[#e6ff00] transition-colors no-underline">Se connecter</a></li>
              </ul>
            </Col>
            <Col md={4} className="mb-8">
              <h5 className="font-bold text-xs mb-6 text-white uppercase tracking-widest">Nous Contacter</h5>
              <p className="font-serif italic text-lg text-gray-400 mb-2">contact@stylique.com</p>
              <p className="font-serif italic text-lg text-gray-400">+33 1 23 45 67 89</p>
            </Col>
          </Row>
          
          <div className="text-center md:text-left pt-16 text-gray-600 text-xs font-bold tracking-widest uppercase">
            <p className="m-0">&copy; 2026 STYLIQUE. Tous droits réservés.</p>
          </div>
        </Container>
      </footer>
    </div>
  );
}

export default Home;