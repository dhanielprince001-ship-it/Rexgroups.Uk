import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Menu, X, Truck, Hotel, Plane, ArrowUpRight, ArrowRight, Phone, Mail, MapPin, ShieldCheck, Clock3, CreditCard, UserRound, LogOut, LayoutDashboard, Send, CheckCircle2, AlertCircle, Camera, ChevronDown, ArrowUp, MessageCircle, ClipboardList, PhoneCall, ThumbsUp, Search, Package, Star, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { contact, services } from './data.js';
import { supabase, backendReady } from './lib/supabase.js';
import { privacy, terms } from './legal.js';

const iconMap = { truck: Truck, hotel: Hotel, plane: Plane };

function WhatsApp() {
  return <a className="whatsapp-float" href={`https://wa.me/${contact.whatsapp}?text=${encodeURIComponent('Hello Rex Groups, I would like to make an enquiry.')}`} target="_blank" rel="noreferrer" aria-label="Chat with Rex Groups on WhatsApp"><MessageCircle size={26}/></a>;
}

function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > 600);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return <button type="button" className={show ? 'to-top show' : 'to-top'} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top"><ArrowUp size={20}/></button>;
}

const faqs = [
  ['How do I make an enquiry?', 'Use the contact form, send us a WhatsApp message, call or email. Tell us what you need and our team will follow up.'],
  ['Which services does Rex Groups offer?', 'We help with logistics, hotel and restaurant services, and vacation planning.'],
  ['Do I need an account to contact you?', 'No. You can send an enquiry without signing in. An account gives you a personal area with your name and profile picture.'],
  ['Can I pay online on this website?', 'Online payments are not available on this website yet. Our team will guide you on the next steps when you make an enquiry.'],
  ['What should I include in my message?', 'Share your name, the service you are interested in and key details such as dates, locations or the number of people, so we can help faster.']
];

function FAQ() {
  const [open, setOpen] = useState(0);
  return <div className="faq-list">{faqs.map(([q, a], i) => <div key={q} className={open === i ? 'faq-item open' : 'faq-item'}>
    <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}><span>{q}</span><ChevronDown size={18}/></button>
    {open === i && <p>{a}</p>}
  </div>)}</div>;
}

function displayNameOf(session, profile) {
  const meta = session?.user?.user_metadata?.full_name;
  return (profile?.full_name || meta || session?.user?.email?.split('@')[0] || '').trim();
}

// Shared sign-in state: the session, the user's profile row (name, picture, admin flag).
function useAuth() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [ready, setReady] = useState(!supabase);

  const loadProfile = useCallback(async (s) => {
    if (!supabase || !s) { setProfile(null); return; }
    const { data } = await supabase.from('profiles').select('full_name,avatar_url,is_admin').eq('id', s.user.id).maybeSingle();
    setProfile(data || null);
  }, []);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session); setReady(true); loadProfile(data.session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setTimeout(() => loadProfile(s), 0);
    });
    const refresh = () => supabase.auth.getSession().then(({ data }) => loadProfile(data.session));
    window.addEventListener('profile-updated', refresh);
    return () => { active = false; listener.subscription.unsubscribe(); window.removeEventListener('profile-updated', refresh); };
  }, [loadProfile]);

  return { session, profile, ready };
}

function Avatar({ url, name, size = 36 }) {
  const initial = (name || '?').trim().charAt(0).toUpperCase() || '?';
  return <span className="avatar" style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}>{url ? <img src={url} alt="" /> : initial}</span>;
}

// Centre-crops to a square and shrinks, so phone photos upload quickly and stay small.
function resizeImage(file, max = 512) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const src = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(src);
      const side = Math.min(img.width, img.height);
      const out = Math.min(max, side);
      const canvas = document.createElement('canvas');
      canvas.width = out; canvas.height = out;
      canvas.getContext('2d').drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, out, out);
      canvas.toBlob(b => b ? resolve(b) : reject(new Error('Could not process image')), 'image/jpeg', 0.88);
    };
    img.onerror = () => { URL.revokeObjectURL(src); reject(new Error('Could not read image')); };
    img.src = src;
  });
}

// Keeps the whole photo (no cropping), just makes it smaller so uploads are quick.
function shrinkImage(file, max = 1600) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const src = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(src);
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(b => b ? resolve(b) : reject(new Error('Could not process image')), 'image/jpeg', 0.85);
    };
    img.onerror = () => { URL.revokeObjectURL(src); reject(new Error('Could not read image')); };
    img.src = src;
  });
}

function Header() {
  const [open, setOpen] = useState(false);
  const { session, profile } = useAuth();
  const location = useLocation();
  useEffect(() => { setOpen(false); }, [location.pathname]);
  const name = displayNameOf(session, profile);
  const nav = [['Home','/'],['Services','/services'],['Track','/track'],['About','/about'],['Contact','/contact']];
  return <header className="site-header">
    <div className="container nav-wrap">
      <Link to="/" className="brand" aria-label="Rex Groups home"><span className="brand-mark">R<span>↗</span></span><span className="brand-copy"><b>REX</b><small>GROUPS</small></span></Link>
      <button className="menu-toggle" onClick={() => setOpen(!open)} aria-label={open ? 'Close menu' : 'Open menu'}>{open ? <X/> : <Menu/>}</button>
      <nav className={open ? 'main-nav open' : 'main-nav'}>
        {nav.map(([label,path]) => <NavLink key={path} to={path} end={path === '/'}>{label}</NavLink>)}
        <div className="nav-actions">
          {session
            ? <Link className="nav-user" to="/dashboard" aria-label="Open my account"><Avatar url={profile?.avatar_url} name={name} size={34}/><span>{name}</span></Link>
            : <>
                <Link className="nav-login" to="/login">Login</Link>
                <Link className="button button-small" to="/register">Get started <ArrowUpRight size={15}/></Link>
              </>}
        </div>
      </nav>
    </div>
  </header>;
}

function Footer() {
  return <footer className="footer">
    <div className="container footer-grid">
      <div><Link to="/" className="brand footer-brand"><span className="brand-mark">R<span>↗</span></span><span className="brand-copy"><b>REX</b><small>GROUPS</small></span></Link><p>Logistics · Hospitality · Vacations</p><p className="muted">More than just services. We help you move, stay, dine and explore.</p></div>
      <div><h4>Explore</h4><Link to="/">Home</Link><Link to="/services">Our services</Link><Link to="/track">Track a package</Link><Link to="/gallery">Gallery</Link><Link to="/about">About us</Link><Link to="/contact">Contact</Link></div>
      <div><h4>Our services</h4><Link to="/logistics">Logistics</Link><Link to="/hospitality">Hotel & Restaurant</Link><Link to="/vacations">Vacations</Link></div>
      <div><h4>Get in touch</h4><a href={`mailto:${contact.email}`}><Mail size={15}/>{contact.email}</a><a href={`tel:${contact.phone}`}><Phone size={15}/>{contact.phone}</a><a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noreferrer">WhatsApp support <ArrowUpRight size={14}/></a></div>
    </div>
    <div className="container footer-bottom"><span>© {new Date().getFullYear()} Rex Groups. All rights reserved.</span><span><Link to="/privacy">Privacy Policy</Link> · <Link to="/terms">Terms of Service</Link></span></div>
  </footer>;
}

function Layout({ children }) {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, left: 0 }); }, [pathname]);
  useEffect(() => {
    const els = document.querySelectorAll('.reveal:not(.in)');
    if (!('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('in')); return; }
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    }), { threshold: 0.12 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);
  return <><Header/><main>{children}</main><Footer/><BackToTop/><WhatsApp/></>;
}

function ServiceCard({ service }) {
  const Icon = iconMap[service.icon] || ArrowRight;
  const path = service.title === 'Logistics' ? '/logistics' : service.title === 'Vacations' ? '/vacations' : '/hospitality';
  return <article className="service-card reveal">
    <Link to={path} className="service-image"><img src={service.image} alt={service.title}/><span className="image-arrow"><ArrowUpRight size={19}/></span></Link>
    <div className="service-card-body"><span className="icon-tile"><Icon size={21}/></span><p className="eyebrow">{service.eyebrow}</p><h3>{service.title}</h3><p>{service.description}</p><Link className="text-link" to={path}>Explore service <ArrowRight size={16}/></Link></div>
  </article>;
}

function Home() {
  const { reviews, photos } = usePublicContent();
  return <Layout>
    <section className="hero">
      <div className="hero-image"></div><div className="container hero-content">
        <span className="eyebrow light-eyebrow"><span className="eyebrow-dot"></span> One group. Many ways to help.</span>
        <h1>Good journeys<br/>start with <em>Rex.</em></h1>
        <p>From dependable logistics to welcoming stays, great food and memorable vacations — let us help make the details easier.</p>
        <div className="hero-actions"><Link className="button" to="/services">Discover our services <ArrowUpRight size={17}/></Link><Link className="button button-outline" to="/contact">Talk to our team</Link></div>
        <div className="hero-note"><ShieldCheck size={18}/> Helpful service. Clear communication. One point of contact.</div>
      </div>
      <div className="hero-side-label">LOGISTICS · HOSPITALITY · VACATIONS</div>
    </section>
    <section className="trust-strip"><div className="container trust-items"><span><Truck/> Logistics support</span><span><Hotel/> Hospitality enquiries</span><span><Plane/> Vacation planning</span><span><ShieldCheck/> Customer-first service</span></div></section>
    <TrackStrip/>
    <section className="section container">
      <div className="section-heading"><div><p className="eyebrow">What we do</p><h2>Different needs.<br/><em>One trusted team.</em></h2></div><p>Whether you are sending a package, arranging a stay or planning time away, start with the service that fits your needs.</p></div>
      <div className="service-grid">{services.map(s => <ServiceCard key={s.title} service={s}/>)}</div>
    </section>
    <section className="steps-section"><div className="container">
      <div className="section-heading reveal"><div><p className="eyebrow">How it works</p><h2>Three simple steps.<br/><em>No complicated process.</em></h2></div><p>Getting started should be easy. Here is what to expect when you contact Rex Groups.</p></div>
      <div className="steps-grid">{[[ClipboardList,'Tell us what you need','Choose a service and share a few details through the form, WhatsApp, phone or email.'],[PhoneCall,'We get back to you','Our team reviews your enquiry and contacts you to talk through the options.'],[ThumbsUp,'Move forward with confidence','Once the details are clear, we help you take the next step.']].map(([Icon, t, d], i) => <article className="step-card reveal" style={{'--d': `${i * 0.09}s`}} key={t}><span className="step-num">0{i + 1}</span><span className="icon-tile"><Icon size={21}/></span><h3>{t}</h3><p>{d}</p></article>)}</div>
    </div></section>
    <ReviewsSection reviews={reviews}/>
    {photos.length > 0 && <section className="section container gallery-preview"><div className="section-heading"><div><p className="eyebrow">Gallery</p><h2>See us<br/><em>in pictures.</em></h2></div><Link className="text-link" to="/gallery">View all photos <ArrowRight size={16}/></Link></div><div className="gallery-strip">{photos.slice(0, 6).map(ph => <Link to="/gallery" key={ph.id} className="gallery-item"><img src={ph.url} alt={ph.caption || 'Rex Groups photo'} loading="lazy"/></Link>)}</div></section>}
    <section className="section container faq-section reveal"><div className="section-heading"><div><p className="eyebrow">Questions</p><h2>Good to know<br/><em>before you reach out.</em></h2></div><p>Quick answers to the things people ask us most.</p></div><FAQ/></section>
    <section className="feature-band"><div className="container feature-inner"><div><p className="eyebrow light-eyebrow">A simpler way forward</p><h2>Tell us what you need.<br/><em>We’ll help with the next step.</em></h2><p>Reach out to our team for service details, availability and tailored enquiries.</p><Link className="button button-gold" to="/contact">Contact Rex Groups <ArrowUpRight size={17}/></Link></div><div className="feature-visual"><div className="feature-stat"><span>01</span><b>One team</b><small>Easy enquiries</small></div><div className="feature-stat"><span>02</span><b>Three services</b><small>More ways to help</small></div><div className="feature-stat"><span>03</span><b>Human support</b><small>Clear communication</small></div></div></div></section>
  </Layout>;
}

function ServicesPage() {
  return <Layout><PageHero eyebrow="Our services" title={<>Made for the way<br/><em>you live and travel.</em></>} image={services[0].image} description="Explore our three service areas and contact us to discuss what you need."/><section className="section container"><div className="service-grid">{services.map(s=><ServiceCard key={s.title} service={s}/>)}</div></section></Layout>;
}

function PageHero({ eyebrow, title, image, description }) {
  return <section className="page-hero" style={{'--page-image': `url("${image}")`}}><div className="container page-hero-content"><p className="eyebrow light-eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div></section>;
}

function ServiceDetail({ type }) {
  const service = services.find(s => s.title === type) || services[0];
  const Icon = iconMap[service.icon] || Truck;
  return <Layout><PageHero eyebrow={service.eyebrow} title={<>{service.title === 'Hotel & Restaurant' ? <>Stay well.<br/><em>Eat well.</em></> : service.title === 'Vacations' ? <>Make room for<br/><em>new memories.</em></> : <>Move with<br/><em>confidence.</em></>}</>} image={service.image} description={service.description}/><section className="section container detail-layout"><div className="detail-copy"><p className="eyebrow">How we can help</p><h2>Thoughtful support,<br/><em>from the first enquiry.</em></h2><p>{service.description} Contact our team to discuss your requirements, timelines and available options.</p><ul className="check-list">{service.bullets.map(b=><li key={b}><CheckCircle2 size={19}/>{b}</li>)}</ul><div className="detail-actions"><Link to={`/contact?service=${encodeURIComponent(service.title)}`} className="button">Make an enquiry <ArrowUpRight size={17}/></Link>{service.title === 'Logistics' && <Link to="/track" className="button button-outline-dark"><Package size={16}/> Track a package</Link>}</div></div><div className="detail-photo"><img src={service.image} alt={service.title}/><div className="photo-caption"><span className="icon-tile"><Icon/></span><div><b>{service.title}</b><small>Personal service, practical solutions</small></div></div></div></section><section className="mini-cta"><div className="container mini-cta-inner"><div><h2>Need help with {service.title.toLowerCase()}?</h2><p>Tell us a little about what you have in mind.</p></div><Link to={`/contact?service=${encodeURIComponent(service.title)}`} className="button button-gold">Contact our team <ArrowRight size={16}/></Link></div></section></Layout>;
}

function About() {
  return <Layout><PageHero eyebrow="About Rex Groups" title={<>Built around people.<br/><em>Ready for what’s next.</em></>} image="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1800&q=85" description="A multi-service group bringing logistics, hospitality and vacation enquiries together in one place."/><section className="section container about-grid"><div><p className="eyebrow">Who we are</p><h2>One place to start<br/><em>your next journey.</em></h2></div><div className="about-copy"><p>Rex Groups brings together three everyday needs: moving items, arranging places to stay and eat, and planning time away. We want it to be simple for customers to find the right service and get in touch with a real person.</p><p>Our approach is straightforward: listen carefully, communicate clearly and help customers understand their next steps.</p><Link to="/contact" className="text-link">Get in touch <ArrowRight size={16}/></Link></div></section><section className="values-section"><div className="container values-grid">{[['01','Customer first','Helpful, respectful communication at every step.'],['02','Practical solutions','Clear information to help you make decisions.'],['03','Connected services','Different service areas, accessible from one website.']].map(v=><article className="value-card reveal" key={v[0]}><span>{v[0]}</span><h3>{v[1]}</h3><p>{v[2]}</p></article>)}</div></section></Layout>;
}

const DETAIL_LABELS = { stay_type: 'Type', check_in: 'Check-in', check_out: 'Check-out', date: 'Date', guests: 'Guests', rooms: 'Rooms', destination: 'Destination', depart: 'Departure', return: 'Return', adults: 'Adults', children: 'Children', budget: 'Budget' };

function formatDetails(details) {
  if (!details || typeof details !== 'object') return '';
  return Object.entries(details).map(([k, v]) => `${DETAIL_LABELS[k] || k}: ${v}`).join(' · ');
}

function Contact() {
  const { session } = useAuth();
  const [params] = useSearchParams();
  const options = ['Logistics', 'Hotel & Restaurant', 'Vacations', 'Other enquiry'];
  const wanted = params.get('service');
  const [form, setForm] = useState({name:'',email:'',service: options.includes(wanted) ? wanted : 'Logistics',message:''});
  const emptyDetails = { stay_type: 'Room stay', check_in: '', check_out: '', date: '', guests: '2', rooms: '1', destination: '', depart: '', return: '', adults: '2', children: '0', budget: '' };
  const [d, setD] = useState(emptyDetails);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const isHotel = form.service === 'Hotel & Restaurant';
  const isTrip = form.service === 'Vacations';
  const isBooking = isHotel || isTrip;
  const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  function buildDetails() {
    let src = null;
    if (isHotel) {
      src = d.stay_type === 'Room stay'
        ? { stay_type: d.stay_type, check_in: d.check_in, check_out: d.check_out, guests: d.guests, rooms: d.rooms }
        : { stay_type: d.stay_type, date: d.date, guests: d.guests };
    } else if (isTrip) {
      src = { destination: d.destination, depart: d.depart, return: d.return, adults: d.adults, children: d.children, budget: d.budget };
    }
    if (!src) return null;
    const out = {};
    Object.entries(src).forEach(([k, v]) => { const t = String(v ?? '').trim(); if (t !== '') out[k] = t; });
    return Object.keys(out).length ? out : null;
  }

  async function submit(e) {
    e.preventDefault(); setStatus('');
    if (isHotel && d.stay_type === 'Room stay' && d.check_out <= d.check_in) { setStatus('Check-out must be after check-in.'); return; }
    if (isTrip && d.return && d.return < d.depart) { setStatus('Return date cannot be before the departure date.'); return; }
    setBusy(true);
    const details = buildDetails();
    const message = form.message.trim() || (isBooking ? 'No additional message.' : '');
    if (supabase) {
      const { error } = await supabase.from('enquiries').insert([{name:form.name.trim(),email:form.email.trim(),service:form.service,message,details,user_id:session?.user?.id ?? null}]);
      if (error) setStatus('We could not save this enquiry. Please use email or WhatsApp instead.');
      else { setStatus(session ? 'Thanks! Your enquiry has been sent. You can follow its status in your account.' : 'Thanks! Your enquiry has been sent to our team.'); setForm({name:'',email:'',service:'Logistics',message:''}); setD(emptyDetails); }
    } else {
      const subject = encodeURIComponent(`Rex Groups enquiry: ${form.service}`);
      const extra = details ? `\nDetails: ${formatDetails(details)}` : '';
      const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\nService: ${form.service}${extra}\n\n${message}`);
      window.location.href = `mailto:${contact.email}?subject=${subject}&body=${body}`;
      setStatus('Your email app should open with your enquiry prepared. Connect the database to store enquiries on the website.');
    }
    setBusy(false);
  }
  return <Layout><PageHero eyebrow="Contact us" title={<>Let’s get the<br/><em>conversation started.</em></>} image="https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1800&q=85" description="Have a question or a plan in mind? Send us a message and tell us how we can help."/><section className="section container contact-layout"><div className="contact-info"><p className="eyebrow">Get in touch</p><h2>We’re happy<br/><em>to hear from you.</em></h2><p>Choose the easiest way to reach Rex Groups. For urgent questions, call or message us directly.</p><a className="contact-method" href={`mailto:${contact.email}`}><span><Mail/></span><div><small>Email us</small><b>{contact.email}</b></div><ArrowUpRight/></a><a className="contact-method" href={`tel:${contact.phone}`}><span><Phone/></span><div><small>Call us</small><b>{contact.phone}</b></div><ArrowUpRight/></a><a className="contact-method" href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noreferrer"><span><Send/></span><div><small>WhatsApp</small><b>Chat with our team</b></div><ArrowUpRight/></a><div className="response-note"><Clock3 size={18}/><span>Send us your enquiry and we’ll follow up as soon as we can.</span></div></div><form className="form-card" onSubmit={submit}><p className="eyebrow">Send a message</p><h3>How can we help?</h3><label>Your name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Full name"/></label><label>Email address<input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com"/></label><label>Service you’re interested in<select value={form.service} onChange={e=>setForm({...form,service:e.target.value})}><option>Logistics</option><option>Hotel & Restaurant</option><option>Vacations</option><option>Other enquiry</option></select></label>{isHotel && <fieldset className="booking-fields"><legend>Booking details</legend>
      <label className="wide">What do you need?<select value={d.stay_type} onChange={e=>setD({...d,stay_type:e.target.value})}><option>Room stay</option><option>Restaurant table</option><option>Event or group booking</option></select></label>
      {d.stay_type === 'Room stay' ? <>
        <label>Check-in<input type="date" required min={today} value={d.check_in} onChange={e=>setD({...d,check_in:e.target.value,check_out:d.check_out && d.check_out <= e.target.value ? '' : d.check_out})}/></label>
        <label>Check-out<input type="date" required min={d.check_in || today} value={d.check_out} onChange={e=>setD({...d,check_out:e.target.value})}/></label>
        <label>Guests<input type="number" required min="1" max="50" value={d.guests} onChange={e=>setD({...d,guests:e.target.value})}/></label>
        <label>Rooms<input type="number" required min="1" max="20" value={d.rooms} onChange={e=>setD({...d,rooms:e.target.value})}/></label>
      </> : <>
        <label>Date<input type="date" required min={today} value={d.date} onChange={e=>setD({...d,date:e.target.value})}/></label>
        <label>Number of guests<input type="number" required min="1" max="500" value={d.guests} onChange={e=>setD({...d,guests:e.target.value})}/></label>
      </>}
    </fieldset>}
    {isTrip && <fieldset className="booking-fields"><legend>Trip details</legend>
      <label className="wide">Where would you like to go?<input required maxLength="120" value={d.destination} onChange={e=>setD({...d,destination:e.target.value})} placeholder="e.g. Dubai, Cape Town, Obudu"/></label>
      <label>Departure date<input type="date" required min={today} value={d.depart} onChange={e=>setD({...d,depart:e.target.value,return:d.return && d.return < e.target.value ? '' : d.return})}/></label>
      <label>Return date (optional)<input type="date" min={d.depart || today} value={d.return} onChange={e=>setD({...d,return:e.target.value})}/></label>
      <label>Adults<input type="number" required min="1" max="50" value={d.adults} onChange={e=>setD({...d,adults:e.target.value})}/></label>
      <label>Children<input type="number" min="0" max="50" value={d.children} onChange={e=>setD({...d,children:e.target.value})}/></label>
      <label className="wide">Budget (optional)<input maxLength="80" value={d.budget} onChange={e=>setD({...d,budget:e.target.value})} placeholder="e.g. ₦500,000 or flexible"/></label>
    </fieldset>}
    <label>{isBooking ? 'Anything else we should know? (optional)' : 'Message'}<textarea required={!isBooking} rows="5" value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="Tell us a little about what you need..."/></label>{status && <p className="form-status"><AlertCircle size={16}/>{status}</p>}<button className="button form-submit" disabled={busy}>{busy?'Sending…':'Send enquiry'} <ArrowUpRight size={17}/></button><small className="form-footnote">Please do not include passwords or sensitive payment details in this form. See our <Link to="/privacy">Privacy Policy</Link>.</small></form></section><section className="section container faq-section"><div className="section-heading"><div><p className="eyebrow">Questions</p><h2>Before you<br/><em>send a message.</em></h2></div></div><FAQ/></section></Layout>;
}

function AuthPage({ mode }) {
  const navigate = useNavigate();
  const { session, profile } = useAuth();
  const [form, setForm] = useState({name:'',email:'',password:''});
  const [status,setStatus] = useState('');
  const [busy,setBusy] = useState(false);
  const signup = mode === 'register';
  const name = displayNameOf(session, profile);
  async function submit(e) {
    e.preventDefault(); setStatus('');
    if (!supabase) { setStatus('Authentication is not connected yet. Follow SETUP.md to connect your free Supabase project.'); return; }
    const fullName = form.name.trim();
    if (signup && !fullName) { setStatus('Please enter your full name.'); return; }
    setBusy(true);
    const result = signup
      ? await supabase.auth.signUp({email:form.email.trim(),password:form.password,options:{data:{full_name:fullName}}})
      : await supabase.auth.signInWithPassword({email:form.email.trim(),password:form.password});
    setBusy(false);
    if (result.error) setStatus(result.error.message);
    else if (signup && result.data.user?.identities?.length === 0) setStatus('This email is already registered. Please sign in instead.');
    else if (signup && !result.data.session) setStatus('Account created. Check your email to confirm it, then log in.');
    else navigate('/dashboard');
  }
  async function logout() { if (supabase) await supabase.auth.signOut(); }
  return <Layout><section className="auth-section"><div className="auth-picture"><img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85" alt="Scenic travel destination"/><div><p className="eyebrow light-eyebrow">Rex Groups</p><h2>Your next step<br/><em>starts here.</em></h2><p>Manage your enquiries and stay connected with our services.</p></div></div><div className="auth-panel"><div className="auth-form-wrap">
    {session ? <div className="signed-in">
      <Avatar url={profile?.avatar_url} name={name} size={80}/>
      <p className="eyebrow">Signed in as</p>
      <h1>{name}</h1>
      <p className="muted">{session.user.email}</p>
      <Link className="button form-submit" to="/dashboard">Go to my account <ArrowUpRight size={17}/></Link>
      <button type="button" className="button button-outline-dark form-submit" onClick={logout}><LogOut size={16}/> Sign out</button>
    </div> : <>
      <span className="icon-tile auth-icon"><UserRound/></span><p className="eyebrow">{signup?'Join Rex Groups':'Welcome back'}</p><h1>{signup?'Create your account':'Sign in'}</h1><p className="muted">{signup?'Create an account to get started.':'Sign in to view your account area.'}</p>
      <form onSubmit={submit}>
        {signup && <label>Full name<input required maxLength="120" autoComplete="name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your full name"/></label>}
        <label>Email address<input type="email" required autoComplete="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com"/></label>
        <label>Password<input type="password" minLength="8" required autoComplete={signup?'new-password':'current-password'} value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="At least 8 characters"/></label>
        {status && <p className="form-status"><AlertCircle size={16}/>{status}</p>}
        <button className="button form-submit" disabled={busy}>{busy?'Please wait…':signup?'Create account':'Login'} <ArrowUpRight size={17}/></button>
      </form>
      <p className="auth-switch">{signup?'Already have an account?':'New to Rex Groups?'} <Link to={signup?'/login':'/register'}>{signup?'Sign in':'Create an account'}</Link></p>
      {signup && <small className="form-footnote">By creating an account you agree to our <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>.</small>}
      <small className="form-footnote">Use a unique password. Never share your password with anyone.</small>
    </>}
  </div></div></section></Layout>;
}

function Dashboard() {
  const { session, profile, ready } = useAuth();
  const [error,setError] = useState('');
  const [notice,setNotice] = useState('');
  const [uploading,setUploading] = useState(false);
  const [nameDraft,setNameDraft] = useState('');
  const fileRef = useRef(null);
  const navigate = useNavigate();
  const name = displayNameOf(session, profile);
  const needsName = Boolean(profile) && !profile.full_name?.trim();

  useEffect(() => { if (supabase && ready && !session) navigate('/login'); }, [ready, session, navigate]);

  async function logout() { if (supabase) await supabase.auth.signOut(); navigate('/'); }

  async function uploadAvatar(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError(''); setNotice('');
    if (!file.type.startsWith('image/')) { setError('Please choose an image file (JPG, PNG or WebP).'); return; }
    setUploading(true);
    try {
      const blob = await resizeImage(file, 512);
      const path = `${session.user.id}/avatar.jpg`;
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, blob, { upsert: true, contentType: 'image/jpeg', cacheControl: '3600' });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      const { error: dbErr } = await supabase.from('profiles').update({ avatar_url: `${data.publicUrl}?v=${Date.now()}` }).eq('id', session.user.id);
      if (dbErr) throw dbErr;
      window.dispatchEvent(new Event('profile-updated'));
      setNotice('Profile picture updated.');
    } catch (err) {
      console.error(err);
      setError('Upload failed: ' + (err?.message || 'unknown error'));
    } finally { setUploading(false); }
  }

  async function saveName(e) {
    e.preventDefault(); setError('');
    const n = nameDraft.trim();
    if (!n) return;
    const { error: err } = await supabase.from('profiles').update({ full_name: n }).eq('id', session.user.id);
    if (err) setError('We could not save your name. Please try again.');
    else window.dispatchEvent(new Event('profile-updated'));
  }

  if (!backendReady) return <Layout><section className="dashboard-section container"><div className="notice-card"><AlertCircle/><h1>Dashboard setup needed</h1><p>Connect Supabase to enable accounts, stored enquiries and the admin dashboard.</p><Link className="button" to="/contact">Use contact form for now</Link></div></section></Layout>;
  if (!session) return <Layout><section className="dashboard-section container"><div className="notice-card"><h1>Loading your account…</h1></div></section></Layout>;

  return <Layout><section className="dashboard-section container">
    <div className="dashboard-head">
      <div className="profile-head">
        <div className="avatar-wrap">
          <Avatar url={profile?.avatar_url} name={name} size={96}/>
          <button type="button" className="avatar-edit" onClick={() => fileRef.current?.click()} disabled={uploading} aria-label="Change profile picture"><Camera size={16}/></button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={uploadAvatar}/>
        </div>
        <div>
          <p className="eyebrow">Your account</p>
          <h1>{needsName ? 'Welcome.' : `Hello, ${name}.`}</h1>
          <p>{uploading ? 'Uploading your picture…' : 'Tap the camera to change your profile picture.'}</p>
        </div>
      </div>
      <button className="button button-outline-dark" onClick={logout}><LogOut size={16}/> Sign out</button>
    </div>
    {notice && <p className="form-status form-ok"><CheckCircle2 size={16}/>{notice}</p>}
    {error && <p className="form-status"><AlertCircle size={16}/>{error}</p>}
    {needsName && <form className="name-form" onSubmit={saveName}>
      <label>Please add your full name to continue<input required maxLength="120" autoComplete="name" value={nameDraft} onChange={e=>setNameDraft(e.target.value)} placeholder="Your full name"/></label>
      <button className="button">Save name</button>
    </form>}
    <MyEnquiries userId={session.user.id}/>
    {profile?.is_admin ? <><AdminEnquiries/><AdminShipments/><AdminReviews/><AdminGallery/></> : <div className="notice-card"><CheckCircle2/><h2>You’re signed in</h2><p>Your account is ready. Contact our team for service enquiries. Admin tools are only available to accounts explicitly marked as administrators in the database.</p><Link className="button" to="/contact">Make an enquiry</Link></div>}
  </section></Layout>;
}

const STEPS = ['Order received', 'Picked up', 'In transit', 'Out for delivery', 'Delivered'];
const STATUSES = [...STEPS, 'On hold'];

function TrackStrip() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  function go(e) {
    e.preventDefault();
    const c = code.trim();
    navigate(c ? `/track?code=${encodeURIComponent(c)}` : '/track');
  }
  return <section className="track-strip"><div className="container track-strip-inner">
    <div><b>Track your package</b><small>Enter the tracking code from Rex Groups</small></div>
    <form onSubmit={go}><input value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. RX-1A2B3C4D" autoCapitalize="characters" autoComplete="off" aria-label="Tracking code"/><button className="button button-gold" type="submit">Track <ArrowRight size={16}/></button></form>
  </div></section>;
}

function TrackPage() {
  const [params] = useSearchParams();
  const [code, setCode] = useState(params.get('code') || '');
  const [result, setResult] = useState(null);
  const [state, setState] = useState('idle');

  async function lookup(value) {
    const c = (value ?? code).trim();
    if (!c) return;
    if (!supabase) { setState('offline'); return; }
    setState('loading'); setResult(null);
    const { data, error } = await supabase.rpc('track_shipment', { p_code: c });
    if (error) setState('error');
    else if (!data) setState('missing');
    else { setResult(data); setState('found'); }
  }

  useEffect(() => { const c = params.get('code'); if (c) lookup(c); }, []);

  const onHold = result?.status === 'On hold';
  const lastMoving = result ? result.events.find(e => e.status !== 'On hold')?.status : null;
  const idx = result ? STEPS.indexOf(onHold ? lastMoving : result.status) : -1;
  const delivered = result?.status === 'Delivered';

  return <Layout>
    <PageHero eyebrow="Track a package" title={<>Where is<br/><em>my package?</em></>} image={services[0].image} description="Enter the tracking code you were given by Rex Groups to see the latest update."/>
    <section className="section container track-section">
      <form className="track-form" onSubmit={e => { e.preventDefault(); lookup(); }}>
        <label>Tracking code<input value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. RX-1A2B3C4D" autoCapitalize="characters" autoComplete="off"/></label>
        <button className="button" disabled={state === 'loading'}>{state === 'loading' ? 'Searching…' : 'Track'} <Search size={17}/></button>
      </form>
      {state === 'missing' && <p className="form-status"><AlertCircle size={16}/>We could not find that tracking code. Please check it and try again, or contact our team.</p>}
      {state === 'error' && <p className="form-status"><AlertCircle size={16}/>Something went wrong while looking that up. Please try again in a moment.</p>}
      {state === 'offline' && <p className="form-status"><AlertCircle size={16}/>Tracking is not connected yet. Please contact our team for an update.</p>}
      {state === 'found' && result && <div className="track-card">
        <div className="track-head">
          <div><p className="eyebrow">Tracking code</p><h2>{result.tracking_code}</h2><p className="muted">{result.origin} → {result.destination}</p></div>
          <span className={onHold ? 'status-badge hold' : delivered ? 'status-badge done' : 'status-badge'}>{result.status}</span>
        </div>
        <ol className="track-steps">{STEPS.map((step, i) => <li key={step} className={i <= idx ? 'done' : ''}>
          <span className="dot">{i < idx || (i === idx && delivered) ? <CheckCircle2 size={16}/> : i + 1}</span><small>{step}</small>
        </li>)}</ol>
        {onHold && <p className="form-status"><AlertCircle size={16}/>This shipment is on hold. Please contact our team for details.</p>}
        <h3>Updates</h3>
        <ul className="track-events">{result.events.map((e, i) => <li key={i}>
          <b>{e.status}</b>
          {e.location && <span className="ev-loc"><MapPin size={13}/>{e.location}</span>}
          {e.note && <p>{e.note}</p>}
          <small>{new Date(e.created_at).toLocaleString()}</small>
        </li>)}</ul>
        <a className="text-link" href={`https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(`Hello Rex Groups, I have a question about shipment ${result.tracking_code}.`)}`} target="_blank" rel="noreferrer">Questions about this shipment? Message us <ArrowRight size={16}/></a>
      </div>}
    </section>
  </Layout>;
}

function AdminShipments() {
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ origin: '', destination: '', receiver: '', description: '' });
  const [editId, setEditId] = useState(null);
  const [upd, setUpd] = useState({ status: 'In transit', location: '', note: '' });

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('shipments').select('*').order('created_at', { ascending: false }).limit(50);
    if (error) setErr('Could not load shipments. Check that the package tracking SQL has been run in Supabase.');
    else setRows(data || []);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function create(e) {
    e.preventDefault(); setErr(''); setMsg(''); setBusy(true);
    const { data, error } = await supabase.rpc('admin_create_shipment', { p_origin: form.origin, p_destination: form.destination, p_description: form.description, p_receiver: form.receiver });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setMsg(`Shipment created. Tracking code: ${data.tracking_code}`);
    setForm({ origin: '', destination: '', receiver: '', description: '' });
    load();
  }

  async function addEvent(e) {
    e.preventDefault(); setErr(''); setMsg(''); setBusy(true);
    const { error } = await supabase.rpc('admin_add_shipment_event', { p_id: editId, p_status: upd.status, p_location: upd.location, p_note: upd.note });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setMsg('Shipment updated.');
    setEditId(null); setUpd({ status: 'In transit', location: '', note: '' });
    load();
  }

  return <div className="admin-ship">
    <h2>Package tracking</h2>
    <p className="muted">Register a shipment, then share its tracking code with the customer. The receiver name and internal notes are never shown publicly.</p>
    {msg && <p className="form-status form-ok"><CheckCircle2 size={16}/>{msg}</p>}
    {err && <p className="form-status"><AlertCircle size={16}/>{err}</p>}
    <form className="ship-form" onSubmit={create}>
      <label>From (origin)<input required maxLength="120" value={form.origin} onChange={e => setForm({ ...form, origin: e.target.value })} placeholder="e.g. Port Harcourt"/></label>
      <label>To (destination)<input required maxLength="120" value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} placeholder="e.g. Lagos"/></label>
      <label>Receiver name (private)<input maxLength="120" value={form.receiver} onChange={e => setForm({ ...form, receiver: e.target.value })} placeholder="Optional"/></label>
      <label>Internal notes (private)<input maxLength="200" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional"/></label>
      <button className="button" disabled={busy}>{busy ? 'Saving…' : 'Create shipment'} <ArrowUpRight size={17}/></button>
    </form>
    <div className="table-wrap"><table><thead><tr><th>Code</th><th>Route</th><th>Status</th><th>Updated</th><th></th></tr></thead><tbody>{rows.map(r => <tr key={r.id}><td><b>{r.tracking_code}</b></td><td>{r.origin} → {r.destination}</td><td>{r.status}</td><td>{new Date(r.updated_at).toLocaleDateString()}</td><td><button type="button" className="button button-small" onClick={() => { setEditId(r.id); setUpd({ status: r.status, location: '', note: '' }); }}>Update</button></td></tr>)}</tbody></table>{!rows.length && <p className="muted table-empty">No shipments yet.</p>}</div>
    {editId && <form className="ship-form ship-update" onSubmit={addEvent}>
      <p className="eyebrow">Update {rows.find(r => r.id === editId)?.tracking_code}</p>
      <label>New status<select value={upd.status} onChange={e => setUpd({ ...upd, status: e.target.value })}>{STATUSES.map(st => <option key={st}>{st}</option>)}</select></label>
      <label>Location<input maxLength="120" value={upd.location} onChange={e => setUpd({ ...upd, location: e.target.value })} placeholder="e.g. Benin City hub"/></label>
      <label className="wide">Note for the customer<input maxLength="300" value={upd.note} onChange={e => setUpd({ ...upd, note: e.target.value })} placeholder="Optional"/></label>
      <div className="ship-actions"><button className="button" disabled={busy}>{busy ? 'Saving…' : 'Save update'}</button><button type="button" className="button button-outline-dark" onClick={() => setEditId(null)}>Cancel</button></div>
    </form>}
  </div>;
}

function usePublicContent() {
  const [reviews, setReviews] = useState([]);
  const [photos, setPhotos] = useState([]);
  useEffect(() => {
    if (!supabase) return;
    let active = true;
    supabase.from('reviews').select('id,author_name,location,rating,body,created_at').eq('status', 'published').order('created_at', { ascending: false }).limit(12)
      .then(({ data }) => { if (active && data) setReviews(data); });
    supabase.from('gallery_photos').select('id,path,caption,created_at').order('created_at', { ascending: false }).limit(60)
      .then(({ data }) => { if (active && data) setPhotos(data.map(ph => ({ ...ph, url: supabase.storage.from('gallery').getPublicUrl(ph.path).data.publicUrl }))); });
    return () => { active = false; };
  }, []);
  return { reviews, photos };
}

function Stars({ value, size = 16 }) {
  return <span className="stars" role="img" aria-label={`${value} out of 5 stars`}>{[1, 2, 3, 4, 5].map(n => <Star key={n} size={size} fill={n <= value ? 'currentColor' : 'none'}/>)}</span>;
}

function ReviewsSection({ reviews }) {
  const { session } = useAuth();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState('');
  const [state, setState] = useState({ busy: false, msg: '', ok: false });

  async function submit(e) {
    e.preventDefault();
    setState({ busy: true, msg: '', ok: false });
    const { error } = await supabase.rpc('submit_review', { p_rating: rating, p_body: body });
    if (error) setState({ busy: false, msg: error.message, ok: false });
    else { setState({ busy: false, msg: 'Thank you! Your review will appear once our team approves it.', ok: true }); setBody(''); setOpen(false); }
  }

  return <section className="section container reviews-section reveal">
    <div className="section-heading"><div><p className="eyebrow">Customer reviews</p><h2>{reviews.length ? <>What our customers<br/><em>are saying.</em></> : <>Used Rex Groups?<br/><em>Share your experience.</em></>}</h2></div><p>Honest feedback helps other customers and helps us improve.</p></div>
    {reviews.length > 0 && <div className="review-grid">{reviews.map(r => <article className="review-card" key={r.id}>
      <Stars value={r.rating}/>
      <p>“{r.body}”</p>
      <footer><b>{r.author_name}</b>{r.location && <small>{r.location}</small>}</footer>
    </article>)}</div>}
    <div className="review-cta">
      {state.msg && <p className={state.ok ? 'form-status form-ok' : 'form-status'}>{state.ok ? <CheckCircle2 size={16}/> : <AlertCircle size={16}/>}{state.msg}</p>}
      {!supabase ? null : !session
        ? <Link className="button button-outline-dark" to="/login">Sign in to write a review</Link>
        : open
          ? <form className="review-form" onSubmit={submit}>
              <div className="rating-input" role="radiogroup" aria-label="Your rating">{[1, 2, 3, 4, 5].map(n => <button type="button" key={n} onClick={() => setRating(n)} aria-label={`${n} star${n > 1 ? 's' : ''}`} aria-checked={rating === n} role="radio"><Star size={28} fill={n <= rating ? 'currentColor' : 'none'}/></button>)}</div>
              <label>Your review<textarea required minLength="5" maxLength="600" rows="4" value={body} onChange={e => setBody(e.target.value)} placeholder="Tell us about your experience with Rex Groups..."/></label>
              <div className="ship-actions"><button className="button" disabled={state.busy}>{state.busy ? 'Sending…' : 'Submit review'}</button><button type="button" className="button button-outline-dark" onClick={() => setOpen(false)}>Cancel</button></div>
            </form>
          : <button type="button" className="button button-outline-dark" onClick={() => { setOpen(true); setState({ busy: false, msg: '', ok: false }); }}>Write a review</button>}
    </div>
  </section>;
}

function Lightbox({ photos, index, setIndex }) {
  const ph = photos[index];
  const close = () => setIndex(null);
  const prev = () => setIndex((index + photos.length - 1) % photos.length);
  const next = () => setIndex((index + 1) % photos.length);
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') prev(); if (e.key === 'ArrowRight') next(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [index]);
  if (!ph) return null;
  return <div className="lightbox" role="dialog" aria-modal="true" onClick={close}>
    <button type="button" className="lb-close" onClick={close} aria-label="Close"><X/></button>
    {photos.length > 1 && <button type="button" className="lb-nav prev" onClick={e => { e.stopPropagation(); prev(); }} aria-label="Previous photo"><ChevronLeft/></button>}
    <figure onClick={e => e.stopPropagation()}><img src={ph.url} alt={ph.caption || 'Rex Groups photo'}/>{ph.caption && <figcaption>{ph.caption}</figcaption>}</figure>
    {photos.length > 1 && <button type="button" className="lb-nav next" onClick={e => { e.stopPropagation(); next(); }} aria-label="Next photo"><ChevronRight/></button>}
  </div>;
}

function GalleryPage() {
  const { photos } = usePublicContent();
  const [idx, setIdx] = useState(null);
  return <Layout>
    <PageHero eyebrow="Gallery" title={<>Rex Groups,<br/><em>in pictures.</em></>} image={services[2].image} description="Take a look at what we do."/>
    <section className="section container">
      {photos.length
        ? <div className="gallery-grid">{photos.map((ph, i) => <button type="button" className="gallery-item" key={ph.id} onClick={() => setIdx(i)}><img src={ph.url} alt={ph.caption || 'Rex Groups photo'} loading="lazy"/>{ph.caption && <span>{ph.caption}</span>}</button>)}</div>
        : <p className="muted">Photos are coming soon. Please check back shortly.</p>}
    </section>
    {idx !== null && <Lightbox photos={photos} index={idx} setIndex={setIdx}/>}
  </Layout>;
}

function AdminReviews() {
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ author: '', location: '', rating: 5, body: '' });

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('reviews').select('id,author_name,location,rating,body,status,created_at').order('created_at', { ascending: false }).limit(100);
    if (error) setErr('Could not load reviews. Check that the gallery and reviews SQL has been run in Supabase.');
    else setRows(data || []);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function setStatus(id, status) {
    setErr(''); setMsg('');
    const { error } = await supabase.from('reviews').update({ status }).eq('id', id);
    if (error) setErr(error.message); else load();
  }
  async function remove(id) {
    if (!window.confirm('Delete this review?')) return;
    setErr(''); setMsg('');
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) setErr(error.message); else load();
  }
  async function add(e) {
    e.preventDefault(); setErr(''); setMsg(''); setBusy(true);
    const { error } = await supabase.from('reviews').insert([{ author_name: form.author.trim(), location: form.location.trim() || null, rating: Number(form.rating), body: form.body.trim(), status: 'published' }]);
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setMsg('Review added and published.');
    setForm({ author: '', location: '', rating: 5, body: '' });
    load();
  }

  const pending = rows.filter(r => r.status === 'pending').length;
  return <div className="admin-ship">
    <h2>Customer reviews{pending > 0 && <span className="count-pill">{pending} waiting</span>}</h2>
    <p className="muted">Reviews written by customers stay hidden until you publish them. Only add reviews here that a customer has given you permission to show.</p>
    {msg && <p className="form-status form-ok"><CheckCircle2 size={16}/>{msg}</p>}
    {err && <p className="form-status"><AlertCircle size={16}/>{err}</p>}
    <div className="mini-list">{rows.map(r => <article className="mini-item" key={r.id}>
      <div><Stars value={r.rating} size={14}/> <b>{r.author_name}</b>{r.location && <small> · {r.location}</small>} <span className={r.status === 'published' ? 'status-badge done' : 'status-badge hold'}>{r.status === 'published' ? 'Published' : 'Waiting'}</span></div>
      <p>{r.body}</p>
      <div className="ship-actions">
        {r.status === 'pending' ? <button type="button" className="button button-small" onClick={() => setStatus(r.id, 'published')}>Publish</button> : <button type="button" className="button button-small button-outline-dark" onClick={() => setStatus(r.id, 'pending')}>Hide</button>}
        <button type="button" className="button button-small button-outline-dark" onClick={() => remove(r.id)}><Trash2 size={14}/> Delete</button>
      </div>
    </article>)}{!rows.length && <p className="muted table-empty">No reviews yet.</p>}</div>
    <form className="ship-form" onSubmit={add}>
      <p className="eyebrow wide">Add a review with the customer’s permission</p>
      <label>Customer name<input required maxLength="120" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })}/></label>
      <label>Location (optional)<input maxLength="120" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Port Harcourt"/></label>
      <label>Rating<select value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })}>{[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>)}</select></label>
      <label className="wide">Review<input required minLength="5" maxLength="600" value={form.body} onChange={e => setForm({ ...form, body: e.target.value })}/></label>
      <button className="button" disabled={busy}>{busy ? 'Saving…' : 'Add and publish'}</button>
    </form>
  </div>;
}

function AdminGallery() {
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [caption, setCaption] = useState('');
  const fileRef = useRef(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('gallery_photos').select('id,path,caption,created_at').order('created_at', { ascending: false }).limit(100);
    if (error) setErr('Could not load photos. Check that the gallery and reviews SQL has been run in Supabase.');
    else setRows((data || []).map(ph => ({ ...ph, url: supabase.storage.from('gallery').getPublicUrl(ph.path).data.publicUrl })));
  }, []);
  useEffect(() => { load(); }, [load]);

  async function upload(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setErr(''); setMsg('');
    if (!file.type.startsWith('image/')) { setErr('Please choose an image file.'); return; }
    setBusy(true);
    try {
      const blob = await shrinkImage(file, 1600);
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
      const { error: upErr } = await supabase.storage.from('gallery').upload(path, blob, { contentType: 'image/jpeg', cacheControl: '3600' });
      if (upErr) throw upErr;
      const { error: dbErr } = await supabase.from('gallery_photos').insert([{ path, caption: caption.trim() || null }]);
      if (dbErr) { await supabase.storage.from('gallery').remove([path]); throw dbErr; }
      setMsg('Photo added to the gallery.');
      setCaption('');
      load();
    } catch (ex) {
      setErr('Upload failed: ' + (ex?.message || 'unknown error'));
    } finally { setBusy(false); }
  }

  async function remove(ph) {
    if (!window.confirm('Delete this photo?')) return;
    setErr(''); setMsg('');
    const { error } = await supabase.from('gallery_photos').delete().eq('id', ph.id);
    if (error) { setErr(error.message); return; }
    await supabase.storage.from('gallery').remove([ph.path]);
    load();
  }

  return <div className="admin-ship">
    <h2>Photo gallery</h2>
    <p className="muted">Only upload photos that Rex Groups owns or has permission to use.</p>
    {msg && <p className="form-status form-ok"><CheckCircle2 size={16}/>{msg}</p>}
    {err && <p className="form-status"><AlertCircle size={16}/>{err}</p>}
    <div className="ship-form">
      <label className="wide">Caption (optional, type this first)<input maxLength="120" value={caption} onChange={e => setCaption(e.target.value)} placeholder="e.g. Deliveries ready to go"/></label>
      <div className="ship-actions"><button type="button" className="button" disabled={busy} onClick={() => fileRef.current?.click()}>{busy ? 'Uploading…' : 'Choose a photo'} <Camera size={16}/></button><input ref={fileRef} type="file" accept="image/*" hidden onChange={upload}/></div>
    </div>
    <div className="admin-photos">{rows.map(ph => <figure key={ph.id}><img src={ph.url} alt={ph.caption || ''} loading="lazy"/><figcaption>{ph.caption || 'No caption'}</figcaption><button type="button" className="button button-small button-outline-dark" onClick={() => remove(ph)}><Trash2 size={14}/> Delete</button></figure>)}{!rows.length && <p className="muted table-empty">No photos yet.</p>}</div>
  </div>;
}

const ENQ_LABELS = { new: 'Received', in_progress: 'In progress', done: 'Completed' };
const enqBadge = st => st === 'done' ? 'status-badge done' : st === 'in_progress' ? 'status-badge hold' : 'status-badge';

function MyEnquiries({ userId }) {
  const [rows, setRows] = useState(null);
  useEffect(() => {
    if (!supabase) return;
    let active = true;
    supabase.from('enquiries').select('id,service,details,message,status,admin_note,created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(20)
      .then(({ data, error }) => { if (active) setRows(error ? [] : data || []); });
    return () => { active = false; };
  }, [userId]);
  if (rows === null) return null;
  return <div className="my-enquiries">
    <h2>My enquiries</h2>
    {rows.length
      ? <div className="mini-list">{rows.map(r => <article className="mini-item" key={r.id}>
          <div><b>{r.service}</b> <span className={enqBadge(r.status)}>{ENQ_LABELS[r.status] || r.status}</span> <small> · {new Date(r.created_at).toLocaleDateString()}</small></div>
          {r.details && <p className="muted">{formatDetails(r.details)}</p>}
          <p>{r.message}</p>
          {r.admin_note && <p className="team-note"><b>Message from Rex Groups:</b> {r.admin_note}</p>}
        </article>)}</div>
      : <p className="muted">Enquiries you send while signed in will appear here, so you can follow their progress. <Link to="/contact" className="text-link">Make an enquiry <ArrowRight size={14}/></Link></p>}
  </div>;
}

function AdminEnquiries() {
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [editId, setEditId] = useState(null);
  const [draft, setDraft] = useState({ status: 'in_progress', note: '' });

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false }).limit(50);
    if (error) setErr('Admin access is configured, but enquiries could not be loaded. Check the database policies.');
    else setRows(data || []);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function save(e) {
    e.preventDefault(); setErr(''); setMsg(''); setBusy(true);
    const { error } = await supabase.from('enquiries').update({ status: draft.status, admin_note: draft.note.trim() || null }).eq('id', editId);
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setMsg('Enquiry updated.');
    setEditId(null);
    load();
  }

  const fresh = rows.filter(r => (r.status || 'new') === 'new').length;
  const editing = rows.find(r => r.id === editId);
  return <div>
    <h2>Admin dashboard{fresh > 0 && <span className="count-pill">{fresh} new</span>}</h2>
    <p className="muted">Recent customer enquiries (latest 50). Customers who were signed in can see the status and note you set.</p>
    {msg && <p className="form-status form-ok"><CheckCircle2 size={16}/>{msg}</p>}
    {err && <p className="form-status"><AlertCircle size={16}/>{err}</p>}
    <div className="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Service</th><th>Details</th><th>Message</th><th>Status</th><th>Received</th><th></th></tr></thead><tbody>{rows.map(row => <tr key={row.id}><td>{row.name}{row.user_id && <small className="muted"> (account)</small>}</td><td>{row.email}</td><td>{row.service}</td><td>{formatDetails(row.details)}</td><td>{row.message}</td><td><span className={enqBadge(row.status)}>{ENQ_LABELS[row.status] || row.status}</span></td><td>{new Date(row.created_at).toLocaleDateString()}</td><td><button type="button" className="button button-small" onClick={() => { setEditId(row.id); setDraft({ status: row.status === 'new' ? 'in_progress' : row.status, note: row.admin_note || '' }); }}>Update</button></td></tr>)}</tbody></table>{!rows.length && <p className="muted table-empty">No enquiries yet.</p>}</div>
    {editing && <form className="ship-form ship-update" onSubmit={save}>
      <p className="eyebrow">Update enquiry from {editing.name}</p>
      <label>Status<select value={draft.status} onChange={e => setDraft({ ...draft, status: e.target.value })}>{Object.entries(ENQ_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
      <label className="wide">Note for the customer (optional)<input maxLength="300" value={draft.note} onChange={e => setDraft({ ...draft, note: e.target.value })} placeholder="e.g. We have called you to confirm the details."/></label>
      {!editing.user_id && <p className="muted wide">This enquiry was sent without signing in, so the customer cannot see the status. Contact them by email, phone or WhatsApp.</p>}
      <div className="ship-actions"><button className="button" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button><button type="button" className="button button-outline-dark" onClick={() => setEditId(null)}>Cancel</button></div>
    </form>}
  </div>;
}

function LegalPage({ doc }) {
  return <Layout>
    <PageHero eyebrow="Legal" title={doc.title} image={services[0].image} description={`Last updated ${doc.updated}`}/>
    <section className="section container legal">
      <p className="legal-intro">{doc.intro}</p>
      {doc.sections.map((sec, i) => <div key={sec.h}>
        <h2>{i + 1}. {sec.h}</h2>
        {sec.p && sec.p.map(t => <p key={t}>{t}</p>)}
        {sec.ul && <ul>{sec.ul.map(t => <li key={t}>{t}</li>)}</ul>}
        {sec.after && sec.after.map(t => <p key={t}>{t}</p>)}
      </div>)}
    </section>
  </Layout>;
}

function NotFound() { return <Layout><section className="not-found container"><p className="eyebrow">404 · Page not found</p><h1>This page took<br/><em>a wrong turn.</em></h1><Link className="button" to="/">Back to home <ArrowRight size={16}/></Link></section></Layout>; }

export default function App() {
  return <Routes>
    <Route path="/" element={<Home/>}/>
    <Route path="/services" element={<ServicesPage/>}/>
    <Route path="/logistics" element={<ServiceDetail type="Logistics"/>}/>
    <Route path="/hospitality" element={<ServiceDetail type="Hotel & Restaurant"/>}/>
    <Route path="/vacations" element={<ServiceDetail type="Vacations"/>}/>
    <Route path="/about" element={<About/>}/>
    <Route path="/track" element={<TrackPage/>}/>
    <Route path="/gallery" element={<GalleryPage/>}/>
    <Route path="/contact" element={<Contact/>}/>
    <Route path="/privacy" element={<LegalPage doc={privacy}/>}/>
    <Route path="/terms" element={<LegalPage doc={terms}/>}/>
    <Route path="/login" element={<AuthPage mode="login"/>}/>
    <Route path="/register" element={<AuthPage mode="register"/>}/>
    <Route path="/dashboard" element={<Dashboard/>}/>
    <Route path="*" element={<NotFound/>}/>
  </Routes>;
}
