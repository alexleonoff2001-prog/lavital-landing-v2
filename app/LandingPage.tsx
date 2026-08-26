'use client';

import { FormEvent, useRef, useState } from 'react';

declare global {
  interface Window { dataLayer?: Array<Record<string, string>>; }
}

const benefits = [
  ['↗', 'Apoyo al metabolismo', 'Pensado para acompañar un estilo de vida consciente.'],
  ['◎', 'Hábitos saludables', 'Un complemento dentro de una rutina equilibrada.'],
  ['30', 'Presentación práctica', 'Frasco con 30 unidades para tenerlo presente cada día.'],
  ['✓', 'Fácil de integrar', 'Una presentación sencilla que cabe en tu rutina.'],
  ['∞', 'Bienestar integral', 'El foco está en la constancia, no en soluciones instantáneas.'],
];

const faqs = [
  ['¿Qué es Lavital?', 'Lavital es un suplemento dietario de 30 unidades orientado al bienestar y al acompañamiento de hábitos saludables. No es un medicamento.'],
  ['¿Cuántas unidades contiene?', 'La presentación suministrada muestra 30 unidades. Verifica siempre la etiqueta del producto que recibas.'],
  ['¿Cómo se integra en una rutina saludable?', 'Como complemento de una alimentación equilibrada, actividad física, descanso y constancia. Sigue las indicaciones de la etiqueta y la orientación de un profesional competente.'],
  ['¿Los resultados son iguales para todas las personas?', 'No. Cada persona, sus hábitos y su contexto son diferentes; por eso los resultados pueden variar.'],
  ['¿Quién debería consultar a un profesional antes de consumirlo?', 'Personas embarazadas o en lactancia, menores de edad, quienes tengan una condición de salud o usen medicamentos deberían consultar a un profesional competente antes de consumir cualquier suplemento.'],
  ['¿Cómo puedo solicitar información?', 'Completa el formulario con tu nombre y teléfono. El equipo comercial podrá contactarte cuando se confirme el canal oficial de atención.'],
];

function track(event: 'cta_click' | 'form_start' | 'lead_success') {
  const payload = { event, product: 'lavital', page: 'landing' };
  window.dataLayer?.push(payload);
  window.dispatchEvent(new CustomEvent('lavital:analytics', { detail: payload }));
}

const githubPagesHost = 'alexleonoff2001-prog.github.io';
const githubPagesBase = '/lavital-landing-v2';
const hostedApiUrl = 'https://lavital-bienestar-colombia.alexleonoff2001.chatgpt.site/api/leads';

function assetUrl(path: string) {
  return typeof window !== 'undefined' && window.location.hostname === githubPagesHost
    ? `${githubPagesBase}${path}`
    : path;
}

function leadsApiUrl() {
  return typeof window !== 'undefined' && window.location.hostname === githubPagesHost
    ? hostedApiUrl
    : '/api/leads';
}

function CtaLink({ children, className = 'button', location }: { children: React.ReactNode; className?: string; location: string }) {
  return <a className={className} href="#contacto" onClick={() => track('cta_click')} data-cta-location={location}>{children}</a>;
}

export default function LandingPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const formStarted = useRef(false);
  const startedAt = useRef(0);

  function beginForm() {
    if (!formStarted.current) {
      formStarted.current = true;
      startedAt.current = Date.now();
      track('form_start');
    }
  }

  async function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    setStatus('loading');
    setMessage('');
    const data = new FormData(form);
    try {
      const response = await fetch(leadsApiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          phone: data.get('phone'),
          consent: data.get('consent') === 'on',
          website: data.get('website'),
          startedAt: startedAt.current,
        }),
      });
      const result = await response.json() as { message?: string };
      if (!response.ok) throw new Error(result.message || 'No fue posible enviar tus datos.');
      form.reset();
      setStatus('success');
      setMessage('¡Gracias! Recibimos tu solicitud y te contactaremos cuando el canal comercial esté confirmado.');
      track('lead_success');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Ocurrió un error. Intenta de nuevo.');
    }
  }

  return (
    <main>
      <a className="skip-link" href="#contenido">Saltar al contenido</a>
      <header className="site-header" aria-label="Navegación principal">
        <a className="brand" href="#inicio" aria-label="Lavital, ir al inicio">LAVITAL<span>•</span></a>
        <nav>
          <a href="#beneficios">Beneficios</a>
          <a href="#proceso">Tu proceso</a>
          <a href="#preguntas">Preguntas</a>
        </nav>
        <CtaLink className="button button-small" location="header">QUIERO CONOCER LAVITAL</CtaLink>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-copy" id="contenido">
          <p className="eyebrow">BIENESTAR QUE SE MUEVE CONTIGO</p>
          <h1>ACTIVA TU<br /><span>BIENESTAR</span></h1>
          <p className="hero-subtitle">Lavital acompaña tu rutina saludable y apoya tu metabolismo.</p>
          <div className="hero-actions">
            <CtaLink location="hero">QUIERO MÁS INFORMACIÓN</CtaLink>
            <a className="text-link" href="#beneficios">DESCUBRIR BENEFICIOS <span aria-hidden="true">↓</span></a>
          </div>
          <div className="product-facts" aria-label="Información del producto">
            <span><strong>30</strong> unidades</span><span>Suplemento dietario</span>
          </div>
          <p className="disclaimer">Los resultados pueden variar.</p>
        </div>
        <div className="hero-visual">
          <div className="image-frame">
            <img src={assetUrl('/images/lavital-frascoycaja.jpg')} alt="Frasco y caja de Lavital, presentación de 30 unidades" fetchPriority="high" />
          </div>
          <div className="orbit orbit-one" aria-hidden="true" /><div className="orbit orbit-two" aria-hidden="true" />
          <span className="floating-note">Tu rutina.<br /><strong>Tu ritmo.</strong></span>
        </div>
      </section>

      <section className="benefits section" id="beneficios">
        <div className="section-heading"><p className="eyebrow">UN PASO QUE SUMA</p><h2>BIENESTAR QUE SE<br />INTEGRA A TU VIDA</h2><p>Lavital no reemplaza tus hábitos: los acompaña. Una propuesta clara, práctica y responsable para tu día a día.</p></div>
        <div className="benefit-grid">
          {benefits.map(([icon, title, copy], index) => <article className={`benefit-card ${index === 0 ? 'featured' : ''}`} key={title}><span className="benefit-icon" aria-hidden="true">{icon}</span><h3>{title}</h3><p>{copy}</p></article>)}
        </div>
      </section>

      <section className="compare section" id="comparacion">
        <div className="section-heading narrow"><p className="eyebrow">ELIGE CON CLARIDAD</p><h2>¿POR QUÉ ELEGIR LAVITAL?</h2><p>Comparamos únicamente lo que puede verificarse con el empaque suministrado y esta propuesta de acompañamiento.</p></div>
        <div className="compare-table" role="table" aria-label="Comparación entre Lavital y una alternativa por confirmar">
          <div className="compare-row compare-head" role="row"><span role="columnheader">Aspecto</span><strong role="columnheader">LAVITAL</strong><span role="columnheader">Alternativa específica</span></div>
          {[
            ['Presentación', '30 unidades', 'Pendiente de comparar'],
            ['Identidad del producto', 'Frasco y caja con identidad azul/turquesa', 'Pendiente de comparar'],
            ['Comunicación', 'Enfoque responsable de acompañamiento', 'Pendiente de confirmar'],
            ['Practicidad', 'Presentación en frasco', 'Pendiente de comparar'],
          ].map(row => <div className="compare-row" role="row" key={row[0]}><span role="cell">{row[0]}</span><strong role="cell"><i aria-hidden="true">✓</i>{row[1]}</strong><span className="pending" role="cell">{row[2]}</span></div>)}
        </div>
        <p className="marker-note">Marcadores pendientes: el propietario debe indicar una alternativa concreta y aportar datos verificables antes de publicar una comparación comercial.</p>
      </section>

      <section className="lifestyle section" aria-labelledby="lifestyle-title">
        <div className="lifestyle-photo">
          <img src={assetUrl('/images/lavital-en-rutina.jpg')} alt="Persona sosteniendo Lavital en un entorno natural" loading="lazy" />
          <span>CONSTANCIA<br /><strong>SE SIENTE.</strong></span>
        </div>
        <div className="lifestyle-copy">
          <p className="eyebrow">ENERGÍA PARA TU DÍA</p><h2 id="lifestyle-title">MUÉVETE A<br />TU MANERA</h2>
          <p>No existe una única forma de cuidarte. Una caminata, tomar agua y elegir alimentos variados son pequeñas decisiones que construyen bienestar.</p>
          <div className="habit-list"><span><b aria-hidden="true">🚶</b> Movimiento cotidiano</span><span><b aria-hidden="true">💧</b> Hidratación</span><span><b aria-hidden="true">🍎</b> Alimentación equilibrada</span></div>
        </div>
      </section>

      <section className="process section" id="proceso">
        <div className="process-copy"><p className="eyebrow">TU PROCESO, TU RITMO</p><h2>LAVITAL ACOMPAÑA<br />TU PROCESO</h2><p>Los hábitos sostenibles se construyen con tiempo. Integra el producto a una rutina que también cuide lo que comes, cuánto te mueves y cómo descansas.</p><div className="label-warning"><strong>Importante</strong><span>La dosis no ha sido confirmada. Sigue siempre la etiqueta y la orientación de un profesional competente.</span></div></div>
        <ol className="process-steps"><li><span>01</span><div><h3>Alimentación equilibrada</h3><p>Prioriza variedad y decisiones que se adapten a tu contexto.</p></div></li><li><span>02</span><div><h3>Actividad física</h3><p>Encuentra una forma de movimiento que puedas sostener.</p></div></li><li><span>03</span><div><h3>Descanso y constancia</h3><p>Dale espacio a la recuperación y celebra la continuidad.</p></div></li></ol>
      </section>

      <section className="testimonials section" aria-labelledby="testimonials-title">
        <div className="section-heading"><p className="eyebrow">VOCES REALES, CUANDO ESTÉN LISTAS</p><h2 id="testimonials-title">EXPERIENCIAS POR COMPARTIR</h2><p>Este espacio está preparado para publicar únicamente experiencias auténticas y autorizadas.</p></div>
        <div className="testimonial-grid">{[1,2,3].map(n => <article key={n}><span className="quote">“</span><p>Testimonio verificado pendiente.</p><small>Nombre, fotografía y experiencia pendientes de autorización.</small></article>)}</div>
      </section>

      <section className="faq section" id="preguntas">
        <div className="faq-intro"><p className="eyebrow">RESPUESTAS CLARAS</p><h2>PREGUNTAS<br />FRECUENTES</h2><p>Información responsable para tomar una decisión con calma.</p></div>
        <div className="faq-list">{faqs.map(([question, answer], index) => <details key={question} open={index === 0}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div>
      </section>

      <section className="lead-section section" id="contacto">
        <div className="lead-copy"><p className="eyebrow light">CONOCE MÁS SOBRE LAVITAL</p><h2>DA EL<br /><span>PRIMER PASO</span></h2><p>Déjanos tus datos y recibe información responsable sobre el producto. Te tomará menos de un minuto.</p><div className="mini-proof"><span>✓ Datos protegidos</span><span>✓ Sin promesas irreales</span></div></div>
        <form className="lead-form" onSubmit={submitLead} onFocus={beginForm} noValidate>
          <div><label htmlFor="name">Nombre completo *</label><input id="name" name="name" type="text" autoComplete="name" minLength={3} maxLength={80} required placeholder="¿Cómo te llamas?" /></div>
          <div><label htmlFor="phone">Teléfono *</label><input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" minLength={7} maxLength={20} pattern="[0-9+() .-]{7,20}" required placeholder="Ej. 300 123 4567" /></div>
          <div className="honeypot" aria-hidden="true"><label htmlFor="website">Sitio web</label><input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" /></div>
          <label className="consent"><input name="consent" type="checkbox" required /><span>Acepto el <a href="#privacidad">tratamiento de mis datos</a> y el contacto comercial sobre Lavital. *</span></label>
          <button className="button submit" type="submit" disabled={status === 'loading'}>{status === 'loading' ? 'ENVIANDO…' : 'QUIERO QUE ME CONTACTEN'}<span aria-hidden="true">→</span></button>
          <p className={`form-status ${status}`} aria-live="polite">{message}</p>
          <small>Al enviar, confirmas que la información es tuya. Nunca enviamos tu nombre o teléfono a herramientas de analítica.</small>
        </form>
      </section>

      <section className="final-cta section"><div><p className="eyebrow light">EMPIEZA A TU MANERA</p><h2>TU BIENESTAR EMPIEZA<br />CON UNA <span>DECISIÓN</span></h2><p>Déjanos tus datos y recibe información sobre Lavital.</p></div><CtaLink className="button button-white" location="final">IR AL FORMULARIO <span aria-hidden="true">↑</span></CtaLink></section>

      <section className="legal section" id="privacidad" aria-labelledby="privacy-title"><div><p className="eyebrow">TRANSPARENCIA</p><h2 id="privacy-title">Privacidad y condiciones</h2></div><div><details><summary>Política de privacidad</summary><p>Lavital recolectará nombre y teléfono únicamente para responder solicitudes de información y contacto comercial autorizado. Responsable, canales para ejercer derechos, periodo de conservación y versión legal completa: <strong>[PENDIENTE DE CONFIRMAR POR EL PROPIETARIO]</strong>.</p></details><details id="terminos"><summary>Términos y condiciones</summary><p>Información comercial, cobertura, disponibilidad, precios, entregas y devoluciones: <strong>[PENDIENTE DE CONFIRMAR POR EL PROPIETARIO]</strong>.</p></details></div></section>

      <footer><div className="footer-brand">LAVITAL<span>•</span><small>Suplemento dietario · 30 unidades</small></div><div className="footer-links"><a href="#privacidad">Política de privacidad</a><a href="#terminos">Términos y condiciones</a><span>Empresa / NIT / dirección / contacto: [PENDIENTE]</span></div><p>Este producto no reemplaza una alimentación equilibrada ni la orientación de un profesional de la salud. Los resultados pueden variar.</p></footer>
      <CtaLink className="mobile-cta" location="mobile_sticky">QUIERO MÁS INFORMACIÓN <span aria-hidden="true">→</span></CtaLink>
    </main>
  );
}
