import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { InteractiveNotchDemo } from './components/InteractiveNotchDemo';
import { ValueProp } from './components/ValueProp';
import { Pricing } from './components/Pricing';
import { FAQ } from './components/FAQ';
import { Footer } from './components/Footer';

export function App() {
  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      {/* Floating 1:1 Black Notch Header */}
      <Navbar />

      <main className="relative">
        {/* Sky-Blue Hero Section */}
        <Hero />

        {/* Mac Sonoma Wallpaper & Notch Shelf Showcase */}
        <InteractiveNotchDemo />

        {/* 1:1 Apple Light Mode "Wherever you need it" Section */}
        <ValueProp />

        {/* FAQ Section */}
        <FAQ />

        {/* 1:1 Notched Pricing Card Section */}
        <Pricing />
      </main>

      {/* Inverted Notch Top Curve & Black Footer */}
      <Footer />
    </div>
  );
}

export default App;
