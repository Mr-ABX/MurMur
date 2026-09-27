import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ValueProp } from './components/ValueProp';
import { RevoneShowcase } from './components/RevoneShowcase';
import { Pricing } from './components/Pricing';
import { FAQ } from './components/FAQ';
import { OtherProducts } from './components/OtherProducts';
import { Footer } from './components/Footer';

export function App() {
  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      {/* Floating 1:1 Black Notch Header */}
      <Navbar />

      <main className="relative">
        {/* Unified Continuous Hero & Frosted Glass Mac Showcase */}
        <Hero />

        {/* 1:1 Supaste-Inspired Showcase & 2-Column Categories/Filters Section */}
        <ValueProp />

        {/* 1:1 Revone-Inspired Dark Mode 2-Column Workflow Showcase Section */}
        <RevoneShowcase />

        {/* 1:1 Notched Pricing Card Section */}
        <Pricing />

        {/* 1:1 2-Column FAQ Section */}
        <FAQ />

        {/* 1:1 Companion Apps & CoolDock Showcase Section */}
        <OtherProducts />
      </main>

      {/* Inverted Notch Top Curve & Black Footer */}
      <Footer />
    </div>
  );
}

export default App;
