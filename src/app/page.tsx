import Link from 'next/link';
import { ArrowRight, Box, Hammer, ShoppingBag, Truck, ShieldCheck, Phone, Star } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-primary-500 selection:text-white overflow-x-hidden">

      {/* Hero Section */}
      <section className="relative h-[95vh] w-full flex items-center justify-center overflow-hidden">
        {/* Background */}
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center z-0 scale-105 animate-ken-burns"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/50 to-black"></div>
        </div>

        {/* Floating Abstract Elements */}
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-primary-600/20 blur-[100px] rounded-full animate-pulse-glow"></div>
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-primary-500/10 blur-[120px] rounded-full animate-pulse-glow" style={{ animationDelay: '2s' }}></div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-6 py-2 rounded-full border border-primary-500/30 bg-black/40 backdrop-blur-md shadow-[0_0_15px_rgba(249,115,22,0.1)]">
            <Star className="w-4 h-4 text-primary-500 fill-primary-500 animate-pulse" />
            <span className="text-primary-100 font-medium text-sm tracking-widest uppercase">Premium Fittings & Tools</span>
          </div>

          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter mb-8 drop-shadow-2xl animate-scale-in">
            DHA
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary-400 to-primary-600 animate-pulse"></span>
          </h1>

          <p className="text-lg md:text-2xl text-zinc-300 mb-12 max-w-3xl mx-auto font-light leading-relaxed animate-slide-up bg-black/30 backdrop-blur-sm p-4 rounded-xl border border-white/5">
            Elevate your space with our curated collection of <span className="text-white font-medium">furniture accessories</span>, architectural hardware, and professional power tools.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link
              href="/retail"
              className="group relative px-8 py-5 bg-primary-600 text-white font-bold text-lg rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] w-64 uppercase tracking-widest"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-500"></div>
              <span className="relative z-10 flex items-center justify-center gap-3">
                Shop Retail <ShoppingBag className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              {/* Shine effect */}
              <div className="absolute top-0 -left-full w-full h-full bg-white/20 transform skew-x-12 group-hover:left-full transition-all duration-700 ease-in-out"></div>
            </Link>

            <Link
              href="/wholesale"
              className="group px-8 py-5 bg-black/50 border border-zinc-700 text-zinc-300 font-bold text-lg rounded-full hover:bg-zinc-900 hover:text-white hover:border-primary-500/50 transition-all w-64 uppercase tracking-widest backdrop-blur-md"
            >
              <span className="flex items-center justify-center gap-3">
                Wholesale <Box className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
              </span>
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 opacity-60">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500">Scroll</span>
          <div className="w-[1px] h-16 bg-gradient-to-b from-primary-500 to-transparent"></div>
        </div>
      </section>

      {/* Split Section - Seamless Dark Transition */}
      <section className="py-0 grid md:grid-cols-2 min-h-[600px] border-t border-zinc-900">
        {/* Retail Tile */}
        <div className="relative group overflow-hidden bg-black flex flex-col items-center justify-center p-16 text-center border-b md:border-b-0 md:border-r border-zinc-900">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

          <div className="relative z-10 transform group-hover:-translate-y-2 transition-transform duration-500">
            <div className="w-24 h-24 mx-auto bg-zinc-950 rounded-2xl flex items-center justify-center mb-8 shadow-2xl border border-zinc-800 group-hover:border-primary-500/30 group-hover:shadow-[0_0_20px_rgba(249,115,22,0.1)] transition-all duration-500">
              <ShoppingBag className="w-12 h-12 text-zinc-400 group-hover:text-primary-500 transition-colors duration-500" />
            </div>
            <h3 className="text-4xl font-bold mb-4 text-white group-hover:text-glow transition-all">Retail Store</h3>
            <p className="text-zinc-500 max-w-sm mx-auto mb-10 text-lg font-light leading-relaxed">
              Browse our extensive catalog of individual furniture fittings and tools. Perfect for homeowners.
            </p>
            <Link href="/retail" className="inline-flex items-center text-primary-500 font-bold uppercase tracking-widest text-sm hover:text-primary-400 transition-colors border-b border-primary-500/30 hover:border-primary-500 pb-1">
              Browse Catalog <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Wholesale Tile */}
        <div className="relative group overflow-hidden bg-black flex flex-col items-center justify-center p-16 text-center">
          {/* Orange burst on hover */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-900/10 via-black to-black opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

          <div className="relative z-10 transform group-hover:-translate-y-2 transition-transform duration-500">
            <div className="w-24 h-24 mx-auto bg-zinc-950 rounded-2xl flex items-center justify-center mb-8 shadow-2xl border border-zinc-800 group-hover:border-primary-500/30 group-hover:shadow-[0_0_20px_rgba(249,115,22,0.1)] transition-all duration-500">
              <Box className="w-12 h-12 text-zinc-400 group-hover:text-primary-500 transition-colors duration-500" />
            </div>
            <h3 className="text-4xl font-bold mb-4 text-white group-hover:text-glow transition-all">Wholesale</h3>
            <p className="text-zinc-500 max-w-sm mx-auto mb-10 text-lg font-light leading-relaxed">
              Bulk ordering solutions for contractors, interior designers, and hardware retailers.
            </p>
            <Link href="/wholesale" className="inline-flex items-center text-primary-500 font-bold uppercase tracking-widest text-sm hover:text-primary-400 transition-colors border-b border-primary-500/30 hover:border-primary-500 pb-1">
              Partner With Us <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Decorative Divider */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary-500/50 to-transparent"></div>

      {/* Features Grid - Black Theme */}
      <section className="py-32 px-4 bg-black relative">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-zinc-900/20 to-transparent pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-24">
            <span className="text-primary-500 font-bold tracking-[0.2em] uppercase text-sm mb-4 block">Excellence in Hardware</span>
            <h2 className="text-5xl md:text-6xl font-black mb-6 text-white tracking-tight">Why Choose <span className="text-zinc-600">Dhanuka?</span></h2>
            <div className="w-24 h-1.5 bg-primary-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <ShieldCheck className="w-8 h-8" />,
                title: "Quality Guarantee",
                desc: "Every product is vetted for durability and finish excellence."
              },
              {
                icon: <Truck className="w-8 h-8" />,
                title: "Fast Delivery",
                desc: "Same-day dispatch for orders placed before 2 PM."
              },
              {
                icon: <Phone className="w-8 h-8" />,
                title: "Expert Support",
                desc: "Technical guidance from our experienced hardware specialists."
              }
            ].map((feature, idx) => (
              <div key={idx} className="group p-10 border border-zinc-800 bg-zinc-950/50 rounded-2xl hover:bg-zinc-900 hover:border-primary-500/30 transition-all duration-300 hover:transform hover:-translate-y-1 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>

                <div className="w-16 h-16 bg-black border border-zinc-800 rounded-xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 text-primary-500 shadow-lg group-hover:shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-primary-400 transition-colors">{feature.title}</h3>
                <p className="text-zinc-500 leading-relaxed group-hover:text-zinc-300 transition-colors">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer - Deepest Black */}
      <footer className="bg-black text-white py-20 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-3xl font-black mb-8 tracking-tighter">DHA<span className="text-primary-500"></span></h2>
            <p className="text-zinc-500 max-w-sm mb-8 text-lg font-light">
              Setting the standard for furniture fittings and architectural hardware since 2010.
            </p>
            <div className="flex gap-4">
              {['IG', 'FB', 'LN'].map((social) => (
                <div key={social} className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-400 hover:bg-primary-600 hover:text-white transition-all cursor-pointer border border-zinc-800 hover:border-primary-500">
                  <span className="text-xs font-bold">{social}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-8 uppercase tracking-widest text-zinc-300">Shop</h4>
            <ul className="space-y-4 text-zinc-500">
              <li><Link href="/retail" className="hover:text-primary-500 transition-colors hover:pl-2 duration-300 block">New Arrivals</Link></li>
              <li><Link href="/retail?cat=fittings" className="hover:text-primary-500 transition-colors hover:pl-2 duration-300 block">Furniture Fittings</Link></li>
              <li><Link href="/retail?cat=kitchen" className="hover:text-primary-500 transition-colors hover:pl-2 duration-300 block">Kitchen Accessories</Link></li>
              <li><Link href="/tools" className="hover:text-primary-500 transition-colors hover:pl-2 duration-300 block">Power Tools</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-8 uppercase tracking-widest text-zinc-300">Contact</h4>
            <ul className="space-y-6 text-zinc-500">
              <li className="flex items-start gap-4">
                <span className="text-primary-500 mt-1">📍</span>
                <span className="leading-snug">123 Market Street,<br />Colombo 00700, Sri Lanka</span>
              </li>
              <li className="flex items-center gap-4">
                <span className="text-primary-500">📞</span>
                <span>+94 77 123 4567</span>
              </li>
              <li className="flex items-center gap-4">
                <span className="text-primary-500">✉️</span>
                <span>hello@dhanuka.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 mt-20 pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center text-zinc-600 text-sm">
          <p>&copy; {new Date().getFullYear()} Dhanuka Enterprises. All rights reserved.</p>
          <div className="flex gap-8 mt-4 md:mt-0">
            <span className="hover:text-zinc-400 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-zinc-400 cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
