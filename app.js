// Base-60 Wheel Vue Application
const { createApp, computed, onMounted, onBeforeUnmount, ref } = Vue;

createApp({
  setup(){
    const n = ref(0);                 // 0..59
    const useDuodecimalGlyphs = ref(true);
    const playing = ref(false);
    let timer = null;

    // geometry
    const size = 520;
    const cx = size/2, cy = size/2;
    const radiusOuter = 200;  // outer ring outer radius
    const radiusInner = 140;  // inner ring inner radius
    const innerSweep = 360/12;
    const outerSweep = 360/5;

    const outer = computed(()=> Math.floor(n.value/12)); // 0..4
    const inner = computed(()=> n.value % 12);           // 0..11

    const innerDisplay = computed(()=> digit12(inner.value));
    const mappingText = computed(()=> {
      return `${n.value} = ${outer.value}×12 + ${inner.value}  →  (${outer.value}, ${digit12(inner.value)})`;
    });

    function inc(){ n.value = (n.value+1)%60 }
    function dec(){ n.value = (n.value+59)%60 }
    function togglePlay(){
      playing.value = !playing.value;
      if(playing.value){
        timer = setInterval(()=>{ n.value = (n.value+1)%60 }, 500);
      }else{
        clearInterval(timer); timer = null;
      }
    }
    onBeforeUnmount(()=> timer && clearInterval(timer));

    function rad(d){ return (Math.PI/180)*d }
    function polar(cx, cy, r, deg){
      const a = rad(deg-90); // rotate so 0° is at 12 o'clock
      return { x: cx + r*Math.cos(a), y: cy + r*Math.sin(a) };
    }

    // Create a donut segment between [a1,a2] with inner/outer radii
    function donutArc(cx, cy, rInner, rOuter, a1, a2){
      const p0 = polar(cx, cy, rOuter, a1);
      const p1 = polar(cx, cy, rOuter, a2);
      const p2 = polar(cx, cy, rInner, a2);
      const p3 = polar(cx, cy, rInner, a1);
      const largeArc = (a2 - a1) <= 180 ? 0 : 1;
      return [
        `M ${p0.x} ${p0.y}`,
        `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${p1.x} ${p1.y}`,
        `L ${p2.x} ${p2.y}`,
        `A ${rInner} ${rInner} 0 ${largeArc} 0 ${p3.x} ${p3.y}`,
        'Z'
      ].join(' ');
    }

    // Label positions (mid-angle)
    function labelPosInner(idx){
      const mid = idx*innerSweep + innerSweep/2;
      return polar(cx, cy, radiusInner+13, mid);
    }
    function labelPosOuter(idx){
      const mid = idx*outerSweep + outerSweep/2;
      return polar(cx, cy, radiusOuter-15, mid);
    }

    function digit12(d){ // 0..11
      if(!useDuodecimalGlyphs.value){
        return d<10 ? String(d) : (d===10?'A':'B');
      }
      if(d<10) return String(d);
      return d===10 ? '↊' : '↋';
    }

    // Keyboard shortcuts
    function key(e){
      if(e.key === 'ArrowRight') inc();
      else if(e.key === 'ArrowLeft') dec();
      else if(e.key.toLowerCase() === ' '){ e.preventDefault(); togglePlay(); }
    }
    onMounted(()=> window.addEventListener('keydown', key));
    onBeforeUnmount(()=> window.removeEventListener('keydown', key));

    return {
      n, useDuodecimalGlyphs, playing,
      size, cx, cy, radiusOuter, radiusInner, innerSweep, outerSweep,
      outer, inner, innerDisplay, mappingText,
      inc, dec, togglePlay,
      donutArc, labelPosInner, labelPosOuter, digit12
    }
  }
}).mount('#app');