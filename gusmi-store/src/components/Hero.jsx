import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRight, ShieldCheck, Clock, Headphones, Wrench, Award, PhoneCall, ChevronLeft, ChevronRight } from 'lucide-react';

const WHATSAPP_URL = "https://wa.me/51995876300";

const banners = [
    {
        id: 1,
        badge: "Importación Directa desde Fábrica",
        title: "Transforma tu cosecha con tecnología de precisión",
        subtitle: "Importación directa, resultados garantizados. Ahorra hasta 40% en agua con nuestros sistemas de riego.",
        cta: "Ver Catálogo en Stock",
        ctaAction: () => document.getElementById('productos-stock')?.scrollIntoView({ behavior: 'smooth' }),
        ctaSecondary: "Asesoría Gratuita",
        ctaSecondaryAction: () => window.open(WHATSAPP_URL, '_blank'),
        socialProof: "+500 agricultores confían en nosotros",
        gradient: "from-[#1b5e20] via-[#2e7d32] to-[#43a047]",
        badgeColor: "bg-white/15 text-white border-white/25",
    },
    {
        id: 2,
        badge: "Cupos Limitados - Pre-Venta",
        title: "¡No esperes a que se agoten!",
        subtitle: "Asegura tu sistema de riego en ruta con precio especial de Pre-Venta. Llegadas mensuales directo de fábrica.",
        cta: "Ver Pre-Ventas",
        ctaAction: () => document.getElementById('productos-preventa')?.scrollIntoView({ behavior: 'smooth' }),
        urgency: "Precio especial por tiempo limitado",
        gradient: "from-[#e65100] via-[#f57c00] to-[#ffa726]",
        badgeColor: "bg-white/20 text-white border-white/30",
    },
    {
        id: 3,
        badge: "Soporte Técnico Especializado",
        title: "Más que productos, soluciones",
        subtitle: "Asesoría técnica en cada importación. Te acompañamos desde la selección hasta la instalación.",
        cta: "Contactar Asesor",
        ctaAction: () => window.open(WHATSAPP_URL, '_blank'),
        cards: [
            { icon: Wrench, label: "Instalación guiada" },
            { icon: Award, label: "Garantía directa" },
            { icon: Headphones, label: "Soporte post-venta" },
        ],
        gradient: "from-[#1b5e20] via-[#334155] to-[#1e293b]",
        badgeColor: "bg-primary-500/20 text-primary-200 border-primary-400/30",
    },
];

export const Hero = () => {
    const [current, setCurrent] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const goTo = useCallback((index) => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrent(index);
        setTimeout(() => setIsTransitioning(false), 600);
    }, [isTransitioning]);

    const next = useCallback(() => {
        goTo((current + 1) % banners.length);
    }, [current, goTo]);

    const prev = useCallback(() => {
        goTo((current - 1 + banners.length) % banners.length);
    }, [current, goTo]);

    useEffect(() => {
        const timer = setInterval(next, 6000);
        return () => clearInterval(timer);
    }, [next]);

    const banner = banners[current];

    return (
        <div className="relative w-full overflow-hidden font-['Outfit']">
            {/* Background */}
            <div
                className={`absolute inset-0 bg-gradient-to-br ${banner.gradient} transition-all duration-700 ease-in-out`}
            />

            {/* Decorative circles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full" />
                <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-white/5 rounded-full" />
                <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-white/3 rounded-full" />
            </div>

            {/* Content */}
            <div className="relative min-h-[480px] md:min-h-[500px] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center py-16">
                <div
                    key={banner.id}
                    className="max-w-2xl animate-fade-in-up"
                >
                    {/* Badge */}
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-5 border ${banner.badgeColor}`}>
                        <ShieldCheck className="w-4 h-4 mr-2" />
                        {banner.badge}
                    </span>

                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-5 leading-[1.1] tracking-tight">
                        {banner.title}
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg md:text-xl text-white/80 mb-8 max-w-xl leading-relaxed">
                        {banner.subtitle}
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-wrap gap-4 mb-8">
                        <button onClick={banner.ctaAction} className="bg-white text-gray-900 px-8 py-3.5 rounded-full font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center space-x-2 group">
                            <span>{banner.cta}</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        {banner.ctaSecondary && (
                            <button onClick={banner.ctaSecondaryAction} className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-8 py-3.5 rounded-full font-bold transition-all flex items-center space-x-2">
                                <PhoneCall className="w-4 h-4" />
                                <span>{banner.ctaSecondary}</span>
                            </button>
                        )}
                    </div>

                    {/* Social Proof (Banner 1) */}
                    {banner.socialProof && (
                        <div className="flex items-center space-x-3 text-white/60 text-sm font-medium">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white/20 bg-white/10 flex items-center justify-center text-white text-xs font-bold">
                                        {String.fromCharCode(64 + i)}
                                    </div>
                                ))}
                            </div>
                            <span>{banner.socialProof}</span>
                        </div>
                    )}

                    {/* Urgency (Banner 2) */}
                    {banner.urgency && (
                        <div className="inline-flex items-center space-x-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                            <Clock className="w-4 h-4 text-yellow-300 animate-pulse" />
                            <span className="text-sm font-bold text-white">{banner.urgency}</span>
                        </div>
                    )}

                    {/* Mini Cards (Banner 3) */}
                    {banner.cards && (
                        <div className="flex flex-wrap gap-3">
                            {banner.cards.map((card, i) => (
                                <div key={i} className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/15">
                                    <card.icon className="w-4 h-4 text-primary-300" />
                                    <span className="text-sm font-bold text-white">{card.label}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation arrows */}
            <button
                onClick={prev}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-all border border-white/10"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>
            <button
                onClick={next}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-all border border-white/10"
            >
                <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dots navigation */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center space-x-2">
                {banners.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => goTo(i)}
                        className={`rounded-full transition-all duration-300 ${
                            i === current
                                ? 'w-8 h-3 bg-white'
                                : 'w-3 h-3 bg-white/40 hover:bg-white/60'
                        }`}
                    />
                ))}
            </div>
        </div>
    );
};
