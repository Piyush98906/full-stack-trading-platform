import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import Pricing from './pages/Pricing';
import About from './pages/About';
import Support from './pages/Support';

function App() {
  return (
    <div className="site-shell">
      <Navbar />
      <main className="site-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/support" element={<Support />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
