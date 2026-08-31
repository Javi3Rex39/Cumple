/* ======================================================================
   PART 1: CANVAS FIREWORKS INTRO
   Draws "Danielita / y / Javier / Feliz Cumpleaños / a Nosotros dos" as
   fireworks that resolve into letters, then into floating balloons.
   Runs once, then hands off to the slideshow via finishIntro().
   ====================================================================== */

var w = c.width = window.innerWidth,
		h = c.height = window.innerHeight,
		ctx = c.getContext( '2d' ),

		hw = w / 2, // half-width
		hh = h / 2,

		opts = {
			strings: [ 'Danielita', 'y', 'Javier', ' ', 'Feliz', 'Cumpleaños', 'a', 'Nosotros dos <3' ],
			charSize: 30, // overwritten by computeCanvasSizing() before letters are built
			charSpacing: 35,
			lineHeight: 40,

			cx: w / 2,
			cy: h / 2,

			fireworkPrevPoints: 10,
			fireworkBaseLineWidth: 5,
			fireworkAddedLineWidth: 8,
			fireworkSpawnTime: 200,
			fireworkBaseReachTime: 30,
			fireworkAddedReachTime: 30,
			fireworkCircleBaseSize: 20,
			fireworkCircleAddedSize: 10,
			fireworkCircleBaseTime: 30,
			fireworkCircleAddedTime: 30,
			fireworkCircleFadeBaseTime: 10,
			fireworkCircleFadeAddedTime: 5,
			fireworkBaseShards: 5,
			fireworkAddedShards: 5,
			fireworkShardPrevPoints: 3,
			fireworkShardBaseVel: 4,
			fireworkShardAddedVel: 2,
			fireworkShardBaseSize: 3,
			fireworkShardAddedSize: 3,
			gravity: .1,
			upFlow: -.1,
			letterContemplatingWaitTime: 360,
			balloonSpawnTime: 20,
			balloonBaseInflateTime: 10,
			balloonAddedInflateTime: 10,
			balloonBaseSize: 20,
			balloonAddedSize: 20,
			balloonBaseVel: .4,
			balloonAddedVel: .4,
			balloonBaseRadian: -( Math.PI / 2 - .5 ),
			balloonAddedRadian: -1,
		},
		calc = {
			totalWidth: opts.charSpacing * opts.strings.reduce( function( max, s ){ return Math.max( max, s.length ); }, 0 )
		},

		Tau = Math.PI * 2,
		TauQuarter = Tau / 4,

		letters = [],
		introDone = false;

ctx.font = opts.charSize + 'px Fredoka';

function Letter( char, x, y ){
	this.char = char;
	this.x = x;
	this.y = y;

	this.dx = -ctx.measureText( char ).width / 2;
	this.dy = +opts.charSize / 2;

	this.fireworkDy = this.y - hh;

	var hue = x / calc.totalWidth * 360;

	this.color = 'hsl(hue,80%,50%)'.replace( 'hue', hue );
	this.lightAlphaColor = 'hsla(hue,80%,light%,alp)'.replace( 'hue', hue );
	this.lightColor = 'hsl(hue,80%,light%)'.replace( 'hue', hue );
	this.alphaColor = 'hsla(hue,80%,50%,alp)'.replace( 'hue', hue );

	this.reset();
}
Letter.prototype.reset = function(){

	this.phase = 'firework';
	this.tick = 0;
	this.spawned = false;
	this.spawningTime = opts.fireworkSpawnTime * Math.random() |0;
	this.reachTime = opts.fireworkBaseReachTime + opts.fireworkAddedReachTime * Math.random() |0;
	this.lineWidth = opts.fireworkBaseLineWidth + opts.fireworkAddedLineWidth * Math.random();
	this.prevPoints = [ [ 0, hh, 0 ] ];
}
Letter.prototype.step = function(){

	if( this.phase === 'firework' ){

		if( !this.spawned ){

			++this.tick;
			if( this.tick >= this.spawningTime ){

				this.tick = 0;
				this.spawned = true;
			}

		} else {

			++this.tick;

			var linearProportion = this.tick / this.reachTime,
					armonicProportion = Math.sin( linearProportion * TauQuarter ),

					x = linearProportion * this.x,
					y = hh + armonicProportion * this.fireworkDy;

			if( this.prevPoints.length > opts.fireworkPrevPoints )
				this.prevPoints.shift();

			this.prevPoints.push( [ x, y, linearProportion * this.lineWidth ] );

			var lineWidthProportion = 1 / ( this.prevPoints.length - 1 );

			for( var i = 1; i < this.prevPoints.length; ++i ){

				var point = this.prevPoints[ i ],
						point2 = this.prevPoints[ i - 1 ];

				ctx.strokeStyle = this.alphaColor.replace( 'alp', i / this.prevPoints.length );
				ctx.lineWidth = point[ 2 ] * lineWidthProportion * i;
				ctx.shadowBlur = 14;
				ctx.shadowColor = this.color;
				ctx.beginPath();
				ctx.moveTo( point[ 0 ], point[ 1 ] );
				ctx.lineTo( point2[ 0 ], point2[ 1 ] );
				ctx.stroke();
				ctx.shadowBlur = 0;

			}

			if( this.tick >= this.reachTime ){

				this.phase = 'contemplate';

				this.circleFinalSize = opts.fireworkCircleBaseSize + opts.fireworkCircleAddedSize * Math.random();
				this.circleCompleteTime = opts.fireworkCircleBaseTime + opts.fireworkCircleAddedTime * Math.random() |0;
				this.circleCreating = true;
				this.circleFading = false;

				this.circleFadeTime = opts.fireworkCircleFadeBaseTime + opts.fireworkCircleFadeAddedTime * Math.random() |0;
				this.tick = 0;
				this.tick2 = 0;

				this.shards = [];

				var shardCount = opts.fireworkBaseShards + opts.fireworkAddedShards * Math.random() |0,
						angle = Tau / shardCount,
						cos = Math.cos( angle ),
						sin = Math.sin( angle ),

						x = 1,
						y = 0;

				for( var i = 0; i < shardCount; ++i ){
					var x1 = x;
					x = x * cos - y * sin;
					y = y * cos + x1 * sin;

					this.shards.push( new Shard( this.x, this.y, x, y, this.alphaColor ) );
				}
			}

		}
	} else if( this.phase === 'contemplate' ){

		++this.tick;

		if( this.circleCreating ){

			++this.tick2;
			var proportion = this.tick2 / this.circleCompleteTime,
					armonic = -Math.cos( proportion * Math.PI ) / 2 + .5;

			ctx.beginPath();
			ctx.fillStyle = this.lightAlphaColor.replace( 'light', 50 + 50 * proportion ).replace( 'alp', proportion );
			ctx.shadowBlur = 20;
			ctx.shadowColor = this.lightColor.replace( 'light', 70 );
			ctx.beginPath();
			ctx.arc( this.x, this.y, armonic * this.circleFinalSize, 0, Tau );
			ctx.fill();
			ctx.shadowBlur = 0;

			if( this.tick2 > this.circleCompleteTime ){
				this.tick2 = 0;
				this.circleCreating = false;
				this.circleFading = true;
			}
		} else if( this.circleFading ){

			ctx.fillStyle = this.lightColor.replace( 'light', 70 );
			ctx.shadowBlur = 10;
			ctx.shadowColor = this.color;
			ctx.fillText( this.char, this.x + this.dx, this.y + this.dy );
			ctx.shadowBlur = 0;

			++this.tick2;
			var proportion = this.tick2 / this.circleFadeTime,
					armonic = -Math.cos( proportion * Math.PI ) / 2 + .5;

			ctx.beginPath();
			ctx.fillStyle = this.lightAlphaColor.replace( 'light', 100 ).replace( 'alp', 1 - armonic );
			ctx.shadowBlur = 20;
			ctx.shadowColor = this.lightColor.replace( 'light', 70 );
			ctx.arc( this.x, this.y, this.circleFinalSize, 0, Tau );
			ctx.fill();
			ctx.shadowBlur = 0;

			if( this.tick2 >= this.circleFadeTime )
				this.circleFading = false;

		} else {

			ctx.fillStyle = this.lightColor.replace( 'light', 70 );
			ctx.shadowBlur = 10;
			ctx.shadowColor = this.color;
			ctx.fillText( this.char, this.x + this.dx, this.y + this.dy );
			ctx.shadowBlur = 0;
		}

		for( var i = 0; i < this.shards.length; ++i ){

			this.shards[ i ].step();

			if( !this.shards[ i ].alive ){
				this.shards.splice( i, 1 );
				--i;
			}
		}

		if( this.tick > opts.letterContemplatingWaitTime ){

			this.phase = 'balloon';

			this.tick = 0;
			this.spawning = true;
			this.spawnTime = opts.balloonSpawnTime * Math.random() |0;
			this.inflating = false;
			this.inflateTime = opts.balloonBaseInflateTime + opts.balloonAddedInflateTime * Math.random() |0;
			this.size = opts.balloonBaseSize + opts.balloonAddedSize * Math.random() |0;

			var rad = opts.balloonBaseRadian + opts.balloonAddedRadian * Math.random(),
					vel = opts.balloonBaseVel + opts.balloonAddedVel * Math.random();

			this.vx = Math.cos( rad ) * vel;
			this.vy = Math.sin( rad ) * vel;
		}
	} else if( this.phase === 'balloon' ){

		ctx.strokeStyle = this.lightColor.replace( 'light', 80 );

		if( this.spawning ){

			++this.tick;
			ctx.fillStyle = this.lightColor.replace( 'light', 70 );
			ctx.shadowBlur = 10;
			ctx.shadowColor = this.color;
			ctx.fillText( this.char, this.x + this.dx, this.y + this.dy );
			ctx.shadowBlur = 0;

			if( this.tick >= this.spawnTime ){
				this.tick = 0;
				this.spawning = false;
				this.inflating = true;
			}
		} else if( this.inflating ){

			++this.tick;

			var proportion = this.tick / this.inflateTime,
			    x = this.cx = this.x,
					y = this.cy = this.y - this.size * proportion;

			ctx.fillStyle = this.alphaColor.replace( 'alp', proportion );
			ctx.shadowBlur = 16;
			ctx.shadowColor = this.color;
			ctx.beginPath();
			generateBalloonPath( x, y, this.size * proportion );
			ctx.fill();
			ctx.shadowBlur = 0;

			ctx.beginPath();
			ctx.moveTo( x, y );
			ctx.lineTo( x, this.y );
			ctx.stroke();

			ctx.fillStyle = this.lightColor.replace( 'light', 70 );
			ctx.shadowBlur = 10;
			ctx.shadowColor = this.color;
			ctx.fillText( this.char, this.x + this.dx, this.y + this.dy );
			ctx.shadowBlur = 0;

			if( this.tick >= this.inflateTime ){
				this.tick = 0;
				this.inflating = false;
			}

		} else {

			this.cx += this.vx;
			this.cy += this.vy += opts.upFlow;

			ctx.fillStyle = this.color;
			ctx.shadowBlur = 16;
			ctx.shadowColor = this.color;
			ctx.beginPath();
			generateBalloonPath( this.cx, this.cy, this.size );
			ctx.fill();
			ctx.shadowBlur = 0;

			ctx.beginPath();
			ctx.moveTo( this.cx, this.cy );
			ctx.lineTo( this.cx, this.cy + this.size );
			ctx.stroke();

			ctx.fillStyle = this.lightColor.replace( 'light', 70 );
			ctx.shadowBlur = 10;
			ctx.shadowColor = this.color;
			ctx.fillText( this.char, this.cx + this.dx, this.cy + this.dy + this.size );
			ctx.shadowBlur = 0;

			// SE INCREMENTÓ EL MARGEN A +120 PARA EVITAR QUE LA LETRA "A" DESAPAREZCA MIENTRAS ES VISIBLE
			if( this.cy + this.size + 120 < -hh || this.cx + 100 < -hw || this.cx - 100 > hw  )
				this.phase = 'done';

		}
	}
}
function Shard( x, y, vx, vy, color ){

	var vel = opts.fireworkShardBaseVel + opts.fireworkShardAddedVel * Math.random();

	this.vx = vx * vel;
	this.vy = vy * vel;

	this.x = x;
	this.y = y;

	this.prevPoints = [ [ x, y ] ];
	this.color = color;

	this.alive = true;

	this.size = opts.fireworkShardBaseSize + opts.fireworkShardAddedSize * Math.random();
}
Shard.prototype.step = function(){

	this.x += this.vx;
	this.y += this.vy += opts.gravity;

	if( this.prevPoints.length > opts.fireworkShardPrevPoints )
		this.prevPoints.shift();

	this.prevPoints.push( [ this.x, this.y ] );

	var lineWidthProportion = this.size / this.prevPoints.length;

	for( var k = 0; k < this.prevPoints.length - 1; ++k ){

		var point = this.prevPoints[ k ],
				point2 = this.prevPoints[ k + 1 ];

		ctx.strokeStyle = this.color.replace( 'alp', k / this.prevPoints.length );
		ctx.lineWidth = k * lineWidthProportion;
		ctx.beginPath();
		ctx.moveTo( point[ 0 ], point[ 1 ] );
		ctx.lineTo( point2[ 0 ], point2[ 1 ] );
		ctx.stroke();

	}

	if( this.prevPoints[ 0 ][ 1 ] > hh )
		this.alive = false;
}
function generateBalloonPath( x, y, size ){

	ctx.moveTo( x, y );
	ctx.bezierCurveTo( x - size / 2, y - size / 2,
									 	 x - size / 4, y - size,
									   x,            y - size );
	ctx.bezierCurveTo( x + size / 4, y - size,
									   x + size / 2, y - size / 2,
									   x,            y );
}

function anim(){
	// El frame loop siempre corre hasta que introDone es verdaderamente procesado.
	if( introDone ) return;
	window.requestAnimationFrame( anim );

	ctx.shadowBlur = 0;
	ctx.fillStyle = '#111';
	ctx.fillRect( 0, 0, w, h );

	ctx.translate( hw, hh );

	var done = true;
	for( var l = 0; l < letters.length; ++l ){
		letters[ l ].step();
		if( letters[ l ].phase !== 'done' )
			done = false;
	}

	ctx.translate( -hw, -hh );

	// Si han terminado, limpia el canvas por última vez sin dibujos remanentes e inicia la transición.
	if( done ){
		introDone = true;
		ctx.fillStyle = '#111';
		ctx.fillRect( 0, 0, w, h );
		finishIntro();
	}
}

/* Responsive sizing: fit the longest line (in characters) into ~82% of the
   viewport width, clamped so it never gets microscopic on phones nor
   oversized on large desktop monitors. Also caps the size so that ALL
   lines stacked vertically (opts.strings.length can be more than 2) still
   fit within the viewport height. */
function computeCanvasSizing(){

	var maxLen = 0;
	for( var i = 0; i < opts.strings.length; ++i )
		maxLen = Math.max( maxLen, opts.strings[ i ].length );

	var targetWidth = w * .82,
			spacing = targetWidth / maxLen;

	spacing = Math.max( 14, Math.min( 68, spacing ) );

	// lineHeight ends up being charSize * 1.5 = (spacing * .8) * 1.5 = spacing * 1.2,
	// so cap spacing so that strings.length lines stacked don't exceed ~75% of the viewport height.
	var maxSpacingForHeight = ( h * .75 ) / ( opts.strings.length * 1.2 );
	spacing = Math.min( spacing, Math.max( 14, maxSpacingForHeight ) );

	opts.charSpacing = spacing;
	opts.charSize = spacing * .8;
	opts.lineHeight = opts.charSize * 1.5;

	calc.totalWidth = opts.charSpacing * maxLen;

	ctx.font = opts.charSize + 'px Fredoka';
}

function buildLetters(){

	letters.length = 0;

	for( var i = 0; i < opts.strings.length; ++i ){
		for( var j = 0; j < opts.strings[ i ].length; ++j ){
			letters.push( new Letter( opts.strings[ i ][ j ],
															j * opts.charSpacing + opts.charSpacing / 2 - opts.strings[ i ].length * opts.charSpacing / 2,
															i * opts.lineHeight + opts.lineHeight / 2 - opts.strings.length * opts.lineHeight / 2 ) );
		}
	}
}

function startIntroAnimation(){
	computeCanvasSizing();
	buildLetters();
	anim();
}

// Fredoka se pide en el <head> vía Google Fonts, pero el canvas mide y
// dibuja texto de inmediato: si la fuente aún no cargó, mediría con la
// fuente de reemplazo del sistema y las letras quedarían mal centradas.
// Esperamos a que esté lista (con una salida de emergencia si el navegador
// no soporta la Font Loading API) antes de arrancar la animación.
if( document.fonts && document.fonts.load ){
	Promise.all( [ document.fonts.load( '600 40px Fredoka' ), document.fonts.ready ] )
		.then( startIntroAnimation )
		.catch( startIntroAnimation );
} else {
	startIntroAnimation();
}

var initialWidth = window.innerWidth;

window.addEventListener( 'resize', function(){

	w = c.width = window.innerWidth;
	h = c.height = window.innerHeight;

	hw = w / 2;
	hh = h / 2;

	// only rebuild mid-animation if the intro hasn't finished yet, so a
	// resize/orientation change while the fireworks are running doesn't
	// leave stale letter positions from the old viewport size
	if( !introDone && Math.abs(window.innerWidth - initialWidth) > 10 ) {
		initialWidth = window.innerWidth;
		computeCanvasSizing();
		buildLetters();
	}
});

/* ---- ambient starfield behind the canvas ---- */
(function spawnStars(){
	var field = document.getElementById( 'starfield' ),
			count = 70;

	for( var i = 0; i < count; ++i ){
		var star = document.createElement( 'div' );
		star.className = 'star';

		var size = 1 + Math.random() * 2;
		star.style.width = size + 'px';
		star.style.height = size + 'px';
		star.style.left = Math.random() * 100 + '%';
		star.style.top = Math.random() * 100 + '%';
		star.style.setProperty( '--star-max', ( .4 + Math.random() * .6 ).toFixed(2) );
		star.style.animationDuration = ( 1.6 + Math.random() * 3.4 ) + 's';
		star.style.animationDelay = ( Math.random() * 4 ) + 's';

		field.appendChild( star );
	}
})();

/* ---- intro -> slideshow handoff ---- */
var introScreenEl = document.getElementById( 'introScreen' );

function finishIntro(){
	// Ocultar la pantalla de intro (textos)
	if(introScreenEl) {
		introScreenEl.classList.add( 'hide' );
		setTimeout( function(){ introScreenEl.style.display = 'none'; }, 900 );
	}
	
	// FORZAR que el canvas también desaparezca para que no bloquee la vista
	c.style.transition = 'opacity 0.9s ease';
	c.style.opacity = '0';
	setTimeout( function(){ c.style.display = 'none'; }, 900 );
}

// Cambiamos el evento a 'window' para que escuche el clic en TODA la pantalla
window.addEventListener( 'click', function(){
	if( !introDone ){
		introDone = true;
		finishIntro();
	}
});


/* ======================================================================
   PART 2: SLIDESHOW
   Same interaction model as the original build: click/tap or arrow keys
   advance slides, the cake slide requires blowing out the candles first,
   the last slide fires confetti once.
   ====================================================================== */

const slides = document.querySelectorAll('.slide');
const total = slides.length;
const progressEl = document.getElementById('progress');
const stage = document.getElementById('stage');
const tapHint = document.getElementById('tapHint');
let current = 0;
let candlesBlown = false;
let finaleFired = false;

/* ---------- progress dots ---------- */
for(let i=0;i<total;i++){
  const dot = document.createElement('i');
  progressEl.appendChild(dot);
}
function updateProgress(){
  [...progressEl.children].forEach((d,i)=>{
    d.classList.toggle('active', i===current);
    d.classList.toggle('done', i<current);
  });
}

/* ---------- slide navigation ---------- */
function goTo(index){
  if(index<0 || index>=total) return;
  slides[current].classList.remove('active');
  current = index;
  slides[current].classList.add('active');
  updateProgress();
  tapHint.style.display = current===total-1 ? 'none' : 'flex';
  if(current===3){ resetCandles(); }
  if(current===total-1 && !finaleFired){ fireConfetti(); finaleFired = true; }
}

function next(){
  if(current===3 && !candlesBlown){
    blowCandles();
    return;
  }
  if(current < total-1){ goTo(current+1); }
}

function resetCandles(){
  candlesBlown = false;
  document.querySelectorAll('[data-flame]').forEach(f=>f.classList.remove('out'));
  document.querySelectorAll('[data-puff]').forEach(p=>p.classList.remove('go'));
}

function blowCandles(){
  candlesBlown = true;
  const flames = document.querySelectorAll('[data-flame]');
  const puffs = document.querySelectorAll('[data-puff]');
  flames.forEach((f,i)=>{
    setTimeout(()=>{
      f.classList.add('out');
      puffs[i].classList.add('go');
    }, i*150);
  });
  setTimeout(()=>goTo(current+1), 750);
}

stage.addEventListener('click', (e)=>{
  spawnTapSparkle(e.clientX, e.clientY);
  next();
});

document.addEventListener('keydown',(e)=>{
  if(e.key==='ArrowRight' || e.key===' ') next();
  if(e.key==='ArrowLeft') goTo(current-1);
});

document.getElementById('replayBtn').addEventListener('click',(e)=>{
  e.stopPropagation();
  finaleFired = false;
  document.getElementById('burst').innerHTML = '';
  goTo(0);
});

/* ---------- ambient floating stickers ---------- */
const particleWrap = document.getElementById('particles');
const stickerEmojis = ['✨','🌸','💗','⭐','🎀','💫'];
function spawnParticle(){
  const p = document.createElement('div');
  p.className='particle';
  p.textContent = stickerEmojis[Math.floor(Math.random()*stickerEmojis.length)];
  p.style.left = Math.random()*100+'vw';
  p.style.fontSize = (12 + Math.random()*10)+'px';
  const dur = 9 + Math.random()*9;
  p.style.animationDuration = dur+'s';
  particleWrap.appendChild(p);
  setTimeout(()=>p.remove(), dur*1000);
}
setInterval(spawnParticle, 550);
for(let i=0;i<10;i++) setTimeout(spawnParticle, i*280);

/* ---------- confetti burst for finale ---------- */
const confettiEmojis = ['💗','🎀','✨','🌸','⭐','💕'];
function fireConfetti(){
  const burst = document.getElementById('burst');
  for(let i=0;i<45;i++){
    const c2 = document.createElement('div');
    c2.className='confetti';
    c2.textContent = confettiEmojis[Math.floor(Math.random()*confettiEmojis.length)];
    c2.style.left = Math.random()*100+'%';
    c2.style.fontSize = (12 + Math.random()*12)+'px';
    c2.style.animationDelay = (Math.random()*0.7)+'s';
    c2.style.animationDuration = (2.4 + Math.random()*1.2)+'s';
    burst.appendChild(c2);
    setTimeout(()=>c2.remove(), 4200);
  }
}

/* ---------- tap sparkle trail ---------- */
const sparkleEmojis = ['✨','💫','⭐','🎀'];
function spawnTapSparkle(x,y){
  for(let i=0;i<6;i++){
    const s = document.createElement('div');
    s.className='sparkle-burst';
    s.textContent = sparkleEmojis[Math.floor(Math.random()*sparkleEmojis.length)];
    s.style.left = x+'px';
    s.style.top = y+'px';
    const angle = (Math.PI*2*i)/6 + Math.random()*0.5;
    const dist = 40 + Math.random()*30;
    const tx = Math.cos(angle)*dist;
    const ty = Math.sin(angle)*dist;
    s.style.setProperty('--tx', `translate(${tx}px, ${ty}px)`);
    document.body.appendChild(s);
    setTimeout(()=>s.remove(), 750);
  }
}

/* ---------- "time since we met" live counter ---------- */
const MET_AT = new Date( 2026, 7, 29, 17, 57, 0 ); // Aug 29 2026, 5:57 PM (month is 0-indexed)
const cDays = document.getElementById('cDays');
const cHours = document.getElementById('cHours');
const cMins = document.getElementById('cMins');
const cSecs = document.getElementById('cSecs');

function pad(n){ return String(n).padStart(2, '0'); }

function updateCounter(){
  let diff = Date.now() - MET_AT.getTime();
  if(diff < 0) diff = 0;

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  cDays.textContent = pad(days);
  cHours.textContent = pad(hours);
  cMins.textContent = pad(mins);
  cSecs.textContent = pad(secs);
}

updateCounter();
setInterval(updateCounter, 1000);

updateProgress();