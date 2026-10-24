import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Truck, Hotel, Plane, ArrowUpRight, ArrowRight, Phone, Mail, MapPin, ShieldCheck, Clock3, CreditCard, UserRound, LogOut, LayoutDashboard, Send, CheckCircle2, AlertCircle, Camera } from 'lucide-react';
import { contact, services } from './data.js';
import { supabase, backendReady } from './lib/supabase.js';

const iconMap = { truck: Truck, hotel: Hotel, plane: Plane };

function WhatsApp() {
  return <a className="whatsapp-float" href={`https://wa.me/${contact.whatsapp}?text=${encodeURIComponent('Hello Rex Groups, I would like to make an enquiry.')}`} target="_blank" rel="noreferrer" aria-label="Chat with Rex Groups on WhatsApp">WA</a>;
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

function Header() {
  const [open, setOpen] = useState(false);
  const { session, profile } = useAuth();
  const location = useLocation();
  useEffect(() => { setOpen(false); }, [location.pathname]);
  const name = displayNameOf(session, profile);
  const nav = [['Home','/'],['Services','/services'],['About','/about'],['Contact','/contact']];
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
      <div><h4>Explore</h4><Link to="/">Home</Link><Link to="/services">Our services</Link><Link to="/about">About us</Link><Link to="/contact">Contact</Link></div>
      <div><h4>Our services</h4><Link to="/logistics">Logistics</Link><Link to="/hospitality">Hotel & Restaurant</Link><Link to="/vacations">Vacations</Link></div>
      <div><h4>Get in touch</h4><a href={`mailto:${contact.email}`}><Mail size={15}/>{contact.email}</a><a href={`tel:${contact.phone}`}><Phone size={15}/>{contact.phone}</a><a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noreferrer">WhatsApp support <ArrowUpRight size={14}/></a></div>
    </div>
    <div className="container footer-bottom"><span>© {new Date().getFullYear()} Rex Groups. All rights reserved.</span><span>Built for every screen.</span></div>
  </footer>;
}

function Layout({ children }) {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, left: 0 }); }, [pathname]);
  return <><Header/><main>{children}</main><Footer/><WhatsApp/></>;
}

function ServiceCard({ service }) {
  const Icon = iconMap[service.icon] || ArrowRight;
  const path = service.title === 'Logistics' ? '/logistics' : service.title === 'Vacations' ? '/vacations' : '/hospitality';
  return <article className="service-card">
    <Link to={path} className="service-image"><img src={service.image} alt={service.title}/><span className="image-arrow"><ArrowUpRight size={19}/></span></Link>
    <div className="service-card-body"><span className="icon-tile"><Icon size={21}/></span><p className="eyebrow">{service.eyebrow}</p><h3>{service.title}</h3><p>{service.description}</p><Link className="text-link" to={path}>Explore service <ArrowRight size={16}/></Link></div>
  </article>;
}

function Home() {
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
    <section className="section container">
      <div className="section-heading"><div><p className="eyebrow">What we do</p><h2>Different needs.<br/><em>One trusted team.</em></h2></div><p>Whether you are sending a package, arranging a stay or planning time away, start with the service that fits your needs.</p></div>
      <div className="service-grid">{services.map(s => <ServiceCard key={s.title} service={s}/>)}</div>
    </section>
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
  return <Layout><PageHero eyebrow={service.eyebrow} title={<>{service.title === 'Hotel & Restaurant' ? <>Stay well.<br/><em>Eat well.</em></> : service.title === 'Vacations' ? <>Make room for<br/><em>new memories.</em></> : <>Move with<br/><em>confidence.</em></>}</>} image={service.image} description={service.description}/><section className="section container detail-layout"><div className="detail-copy"><p className="eyebrow">How we can help</p><h2>Thoughtful support,<br/><em>from the first enquiry.</em></h2><p>{service.description} Contact our team to discuss your requirements, timelines and available options.</p><ul className="check-list">{service.bullets.map(b=><li key={b}><CheckCircle2 size={19}/>{b}</li>)}</ul><Link to="/contact" className="button">Make an enquiry <ArrowUpRight size={17}/></Link></div><div className="detail-photo"><img src={service.image} alt={service.title}/><div className="photo-caption"><span className="icon-tile"><Icon/></span><div><b>{service.title}</b><small>Personal service, practical solutions</small></div></div></div></section><section className="mini-cta"><div className="container mini-cta-inner"><div><h2>Need help with {service.title.toLowerCase()}?</h2><p>Tell us a little about what you have in mind.</p></div><Link to="/contact" className="button button-gold">Contact our team <ArrowRight size={16}/></Link></div></section></Layout>;
}

function About() {
  return <Layout><PageHero eyebrow="About Rex Groups" title={<>Built around people.<br/><em>Ready for what’s next.</em></>} image="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1800&q=85" description="A multi-service group bringing logistics, hospitality and vacation enquiries together in one place."/><section className="section container about-grid"><div><p className="eyebrow">Who we are</p><h2>One place to start<br/><em>your next journey.</em></h2></div><div className="about-copy"><p>Rex Groups brings together three everyday needs: moving items, arranging places to stay and eat, and planning time away. We want it to be simple for customers to find the right service and get in touch with a real person.</p><p>Our approach is straightforward: listen carefully, communicate clearly and help customers understand their next steps.</p><Link to="/contact" className="text-link">Get in touch <ArrowRight size={16}/></Link></div></section><section className="values-section"><div className="container values-grid">{[['01','Customer first','Helpful, respectful communication at every step.'],['02','Practical solutions','Clear information to help you make decisions.'],['03','Connected services','Different service areas, accessible from one website.']].map(v=><article className="value-card" key={v[0]}><span>{v[0]}</span><h3>{v[1]}</h3><p>{v[2]}</p></article>)}</div></section></Layout>;
}

function Contact() {
  const [form, setForm] = useState({name:'',email:'',service:'Logistics',message:''});
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); setBusy(true); setStatus('');
    if (supabase) {
      const { error } = await supabase.from('enquiries').insert([{name:form.name.trim(),email:form.email.trim(),service:form.service,message:form.message.trim()}]);
      if (error) setStatus('We could not save this enquiry. Please use email or WhatsApp instead.');
      else { setStatus('Thanks! Your enquiry has been sent to our team.'); setForm({name:'',email:'',service:'Logistics',message:''}); }
    } else {
      const subject = encodeURIComponent(`Rex Groups enquiry: ${form.service}`);
      const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\nService: ${form.service}\n\n${form.message}`);
      window.location.href = `mailto:${contact.email}?subject=${subject}&body=${body}`;
      setStatus('Your email app should open with your enquiry prepared. Connect the database to store enquiries on the website.');
    }
    setBusy(false);
  }
  return <Layout><PageHero eyebrow="Contact us" title={<>Let’s get the<br/><em>conversation started.</em></>} image="https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1800&q=85" description="Have a question or a plan in mind? Send us a message and tell us how we can help."/><section className="section container contact-layout"><div className="contact-info"><p className="eyebrow">Get in touch</p><h2>We’re happy<br/><em>to hear from you.</em></h2><p>Choose the easiest way to reach Rex Groups. For urgent questions, call or message us directly.</p><a className="contact-method" href={`mailto:${contact.email}`}><span><Mail/></span><div><small>Email us</small><b>{contact.email}</b></div><ArrowUpRight/></a><a className="contact-method" href={`tel:${contact.phone}`}><span><Phone/></span><div><small>Call us</small><b>{contact.phone}</b></div><ArrowUpRight/></a><a className="contact-method" href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noreferrer"><span><Send/></span><div><small>WhatsApp</small><b>Chat with our team</b></div><ArrowUpRight/></a><div className="response-note"><Clock3 size={18}/><span>Send us your enquiry and we’ll follow up as soon as we can.</span></div></div><form className="form-card" onSubmit={submit}><p className="eyebrow">Send a message</p><h3>How can we help?</h3><label>Your name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Full name"/></label><label>Email address<input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com"/></label><label>Service you’re interested in<select value={form.service} onChange={e=>setForm({...form,service:e.target.value})}><option>Logistics</option><option>Hotel & Restaurant</option><option>Vacations</option><option>Other enquiry</option></select></label><label>Message<textarea required rows="5" value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="Tell us a little about what you need..."/></label>{status && <p className="form-status"><AlertCircle size={16}/>{status}</p>}<button className="button form-submit" disabled={busy}>{busy?'Sending…':'Send enquiry'} <ArrowUpRight size={17}/></button><small className="form-footnote">Please do not include passwords or sensitive payment details in this form.</small></form></section></Layout>;
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
      <small className="form-footnote">Use a unique password. Never share your password with anyone.</small>
    </>}
  </div></div></section></Layout>;
}

function Dashboard() {
  const { session, profile, ready } = useAuth();
  const [enquiries,setEnquiries] = useState([]);
  const [error,setError] = useState('');
  const [notice,setNotice] = useState('');
  const [uploading,setUploading] = useState(false);
  const [nameDraft,setNameDraft] = useState('');
  const fileRef = useRef(null);
  const navigate = useNavigate();
  const name = displayNameOf(session, profile);
  const needsName = Boolean(profile) && !profile.full_name?.trim();

  useEffect(() => { if (supabase && ready && !session) navigate('/login'); }, [ready, session, navigate]);

  useEffect(() => {
    if (!supabase || !profile?.is_admin) return;
    supabase.from('enquiries').select('*').order('created_at',{ascending:false}).limit(50).then(({data, error:e}) => {
      if (e) setError('Admin access is configured, but enquiries could not be loaded. Check the database policies.');
      else setEnquiries(data || []);
    });
  }, [profile?.is_admin]);

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
      setError('We could not upload your picture. Check that the latest supabase/schema.sql has been run, then try again.');
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
    {profile?.is_admin ? <><h2>Admin dashboard</h2><p className="muted">Recent customer enquiries (latest 50).</p><div className="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Service</th><th>Message</th><th>Received</th></tr></thead><tbody>{enquiries.map(row=><tr key={row.id}><td>{row.name}</td><td>{row.email}</td><td>{row.service}</td><td>{row.message}</td><td>{new Date(row.created_at).toLocaleDateString()}</td></tr>)}</tbody></table>{!enquiries.length&&<p className="muted table-empty">No enquiries yet.</p>}</div></> : <div className="notice-card"><CheckCircle2/><h2>You’re signed in</h2><p>Your account is ready. Contact our team for service enquiries. Admin tools are only available to accounts explicitly marked as administrators in the database.</p><Link className="button" to="/contact">Make an enquiry</Link></div>}
  </section></Layout>;
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
    <Route path="/contact" element={<Contact/>}/>
    <Route path="/login" element={<AuthPage mode="login"/>}/>
    <Route path="/register" element={<AuthPage mode="register"/>}/>
    <Route path="/dashboard" element={<Dashboard/>}/>
    <Route path="*" element={<NotFound/>}/>
  </Routes>;
}
