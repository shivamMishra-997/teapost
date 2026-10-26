const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
let lenis=null;
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;

// Header, mobile menu, current page
const hd=$('header'),burger=$('.burger'),nav=$('#nav');
const setNav=o=>{nav.classList.toggle('open',o);burger.setAttribute('aria-expanded',o);lenis&&(o?lenis.stop():lenis.start())};
burger.addEventListener('click',()=>setNav(!nav.classList.contains('open')));
addEventListener('keydown',e=>{if(e.key==='Escape')setNav(false)});
const onScroll=()=>hd.classList.toggle('sc',scrollY>10);
addEventListener('scroll',onScroll,{passive:true});onScroll();
$$('nav a').forEach(a=>{if(a.getAttribute('href')===document.body.dataset.p)a.setAttribute('aria-current','page')});

// Page transitions: veil covers the screen, then we navigate
const veil=$('.veil');
document.addEventListener('click',e=>{
  const a=e.target.closest('a');
  if(!a||reduce||e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||a.target==='_blank'||a.hasAttribute('download'))return;
  if(a.protocol!==location.protocol||a.host!==location.host||a.pathname===location.pathname)return;
  e.preventDefault();setNav(false);
  veil.classList.add('lv');
  setTimeout(()=>{location.href=a.href},600);
});
addEventListener('pageshow',e=>{if(e.persisted)veil.classList.remove('lv')});

// Scroll reveal
const rio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');rio.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px'});
$$('[data-r]').forEach(el=>rio.observe(el));

// Lazy images: native lazy loading plus a fade when each one arrives
$$('img[data-l]').forEach(i=>{
  const ok=()=>i.classList.add('ld'),bad=()=>{i.classList.add('ld');i.style.visibility='hidden';i.parentNode.classList.add('ph')};
  if(i.complete)i.naturalWidth?ok():bad();else{i.addEventListener('load',ok,{once:true});i.addEventListener('error',bad,{once:true})}
});
// Lazy iframes: the map loads only when it nears the screen
const fio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){const f=e.target;f.src=f.dataset.src;f.onload=()=>f.classList.add('ld');fio.unobserve(f)}}),{rootMargin:'300px'});
$$('iframe[data-src]').forEach(f=>fio.observe(f));

// Open or closed (India time)
const st=$('#status');
if(st){const h=new Date(new Date().toLocaleString('en-US',{timeZone:'Asia/Kolkata'})).getHours(),o=h>=8&&h<23;
  st.classList.toggle('open',o);st.querySelector('span').textContent=o?'Open now, until 11 PM':'Closed now, opens at 8 AM'}

// Ticker
const mq=$('#mqi');if(mq)mq.innerHTML=mq.innerHTML.repeat(6);

// Smooth scroll
if(window.Lenis&&!reduce){
  lenis=new Lenis({lerp:.09,smoothWheel:true});
  const raf=t=>{lenis.raf(t);requestAnimationFrame(raf)};requestAnimationFrame(raf);
}

// Menu filter
const chips=$$('.chip'),cats=$$('.cat');
chips.forEach(c=>c.addEventListener('click',()=>{
  chips.forEach(x=>x.setAttribute('aria-pressed',x===c));
  cats.forEach(k=>{const show=c.dataset.f==='all'||k.dataset.cat===c.dataset.f;k.hidden=!show});
}));

// Gallery lightbox: click to zoom, wheel and pinch, drag to pan, arrows to browse
const lb=$('#lb');
if(lb){
  const im=$('#lbi'),zw=$('#zw'),T=$$('.g'),P=new Map;
  let c=0,s=1,x=0,y=0,m=0,pd=0;
  const ap=a=>{const mx=(s-1)*zw.clientWidth/2,my=(s-1)*zw.clientHeight/2;x=Math.max(-mx,Math.min(mx,x));y=Math.max(-my,Math.min(my,y));
    im.style.transition=a?'transform .3s cubic-bezier(.22,1,.36,1)':'none';im.style.transform=`translate(${x}px,${y}px) scale(${s})`;zw.classList.toggle('z',s>1)};
  const zt=(n,cx=0,cy=0,a)=>{n=Math.max(1,Math.min(5,n));const k=n/s;x=cx-(cx-x)*k;y=cy-(cy-y)*k;s=n;if(s===1)x=y=0;ap(a)};
  const rl=(a,b)=>{const r=zw.getBoundingClientRect();return[a-r.left-r.width/2,b-r.top-r.height/2]};
  const D=()=>{const[a,b]=[...P.values()];return Math.hypot(a[0]-b[0],a[1]-b[1])};
  const show=i=>{c=(i+T.length)%T.length;const g=T[c].querySelector('img');s=1;x=y=0;ap();
    im.src=g.currentSrc||g.src;im.alt=g.alt;$('#lbc').textContent=T[c].querySelector('figcaption').textContent;$('#lbn').textContent=`${c+1} / ${T.length}`};
  T.forEach((t,i)=>{t.tabIndex=0;t.setAttribute('role','button');
    t.addEventListener('click',()=>{show(i);lb.showModal();lenis&&lenis.stop()});
    t.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();t.click()}})});
  zw.addEventListener('pointerdown',e=>{zw.setPointerCapture(e.pointerId);P.set(e.pointerId,[e.clientX,e.clientY]);if(P.size===1)m=0;if(P.size===2){pd=D();m=99}});
  zw.addEventListener('pointermove',e=>{const o=P.get(e.pointerId);if(!o)return;P.set(e.pointerId,[e.clientX,e.clientY]);
    if(P.size===2){const d=D(),[a,b]=[...P.values()],[cx,cy]=rl((a[0]+b[0])/2,(a[1]+b[1])/2);zt(s*d/(pd||d),cx,cy);pd=d;return}
    m+=Math.abs(e.clientX-o[0])+Math.abs(e.clientY-o[1]);if(s>1){x+=e.clientX-o[0];y+=e.clientY-o[1];ap()}});
  const end=e=>{if(!P.delete(e.pointerId))return;if(e.type==='pointerup'&&m<6&&!P.size){const[cx,cy]=rl(e.clientX,e.clientY);s>1?zt(1,0,0,1):zt(2.5,cx,cy,1)}};
  zw.addEventListener('pointerup',end);zw.addEventListener('pointercancel',end);
  zw.addEventListener('wheel',e=>{e.preventDefault();const[cx,cy]=rl(e.clientX,e.clientY);zt(s*(e.deltaY<0?1.25:.8),cx,cy)},{passive:false});
  $('.lb-x').addEventListener('click',()=>lb.close());
  $('.lb-p').addEventListener('click',()=>show(c-1));
  $('.lb-n').addEventListener('click',()=>show(c+1));
  lb.addEventListener('click',e=>{if(e.target===lb)lb.close()});
  lb.addEventListener('close',()=>lenis&&lenis.start());
  lb.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')show(c-1);else if(e.key==='ArrowRight')show(c+1)});
  let sx=0;lb.addEventListener('touchstart',e=>{sx=e.touches[0].clientX},{passive:true});
  lb.addEventListener('touchend',e=>{const d=e.changedTouches[0].clientX-sx;if(s===1&&Math.abs(d)>50)show(c+(d<0?1:-1))},{passive:true});
}
