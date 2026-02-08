import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import heroImage from '../assets/images/hero-banner.png';

export const Hero = () => {
    return (
        <div className="relative h-[450px] w-full overflow-hidden bg-slate-900">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
                <img
                    src={heroImage}
                    alt="Store Banner"
                    className="h-full w-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/40 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
                <div className="max-w-2xl animate-fade-in-up">
                    <span className="inline-block px-3 py-1 rounded-full bg-primary-500/20 text-primary-300 text-xs font-bold uppercase tracking-wider mb-4 border border-primary-500/30">
                        Importación Digital Directa
                    </span>
                    <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight font-['Outfit']">
                        Traemos lo mejor del mundo a <br />
                        <span className="bg-gradient-to-r from-primary-400 to-primary-200 bg-clip-text text-transparent">
                            Tus Manos
                        </span>
                    </h1>
                    <p className="text-lg text-slate-300 mb-8 max-w-lg leading-relaxed">
                        Explora nuestro catálogo de productos importados con logística inteligente y precios competitivos.
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <button
                            className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3.5 rounded-full font-bold transition-all shadow-lg hover:shadow-primary-600/20 flex items-center space-x-2 group"
                        >
                            <span>Comprar Ahora</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button
                            className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-8 py-3.5 rounded-full font-bold transition-all"
                        >
                            Ver Detalles
                        </button>
                    </div>
                </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute bottom-0 right-0 p-8 hidden lg:block">
                <div className="flex items-center space-x-4 text-white/40 text-sm font-medium">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden">
                                <img src={`https://i.pravatar.cc/32?img=${i + 10}`} alt="user" />
                            </div>
                        ))}
                    </div>
                    <span>+500 clientes satisfechos</span>
                </div>
            </div>
        </div>
    );
};
