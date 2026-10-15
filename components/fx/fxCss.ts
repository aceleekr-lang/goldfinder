// 연출 공통 CSS (한 번만 주입). 모든 키프레임 이름은 gf- 접두어
export const FX_CSS = `
.gf-stage { position: fixed; inset: 0; z-index: 90; overflow: hidden; color: #F5F1E6; user-select: none; -webkit-user-select: none; touch-action: manipulation;
  background: radial-gradient(ellipse at 50% 30%, #23305c 0%, #141B33 55%, #0b1024 100%); }
.gf-stage .gf-sky { position: absolute; inset: 0; background-size: cover; background-position: center; opacity: .9; }
.gf-twinkles i { position: absolute; width: 2px; height: 2px; border-radius: 50%; background: #fff; animation: gf-tw 2.4s ease-in-out infinite; }
@keyframes gf-tw { 0%,100% { opacity: .15 } 50% { opacity: .9 } }
.gf-hint { position: absolute; left: 0; right: 0; text-align: center; font-weight: 800; letter-spacing: .02em; text-shadow: 0 2px 10px rgba(0,0,0,.6); }
.gf-pulse { animation: gf-pulse 1.4s ease-in-out infinite; }
@keyframes gf-pulse { 0%,100% { transform: scale(1); opacity: .85 } 50% { transform: scale(1.06); opacity: 1 } }
.gf-skip { position: absolute; top: 14px; left: 14px; z-index: 5; background: transparent; color: rgba(245,241,230,.7); border: 1px solid rgba(245,241,230,.3); border-radius: 20px; padding: 6px 12px; font-size: 14px; }
.gf-fadein { animation: gf-fadein .6s ease-out both; }
@keyframes gf-fadein { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }
.gf-out { animation: gf-out .5s ease-in forwards; }
@keyframes gf-out { to { opacity: 0 } }
/* 노크 말풍선 */
.gf-knock { position: absolute; z-index: 4; font-size: 34px; font-weight: 900; color: #fff6d6; text-shadow: 0 0 12px rgba(242,193,78,.9), 0 2px 4px rgba(0,0,0,.6); pointer-events: none;
  animation: gf-knock .7s ease-out forwards; }
@keyframes gf-knock { 0% { transform: translate(-50%,-50%) scale(.4); opacity: 0 } 25% { transform: translate(-50%,-90%) scale(1.15); opacity: 1 } 100% { transform: translate(-50%,-160%) scale(1); opacity: 0 } }
.gf-shake { animation: gf-shake .32s ease-in-out; }
@keyframes gf-shake { 0%,100% { transform: translateX(0) } 20% { transform: translateX(-5px) rotate(-.6deg) } 45% { transform: translateX(5px) rotate(.6deg) } 70% { transform: translateX(-3px) } }
/* 대문 */
.gf-gate { position: relative; width: 100%; height: 100%; perspective: 1100px; }
.gf-leaf { position: absolute; top: 0; width: 50%; height: 100%; transition: transform 1.6s cubic-bezier(.45,.05,.25,1), filter 1.6s; }
.gf-leaf.l { left: 0; transform-origin: left center; }
.gf-leaf.r { right: 0; transform-origin: right center; }
.gf-open .gf-leaf.l { transform: rotateY(-76deg); filter: brightness(.55); }
.gf-open .gf-leaf.r { transform: rotateY(76deg); filter: brightness(.55); }
.gf-light { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 55%, #fffbe8 0%, #ffe39a 25%, #F2C14E 45%, rgba(242,193,78,0) 75%); opacity: .0; transition: opacity 1.2s ease .2s, transform 2s ease; }
.gf-seam { position: absolute; top: 4%; bottom: 4%; left: 50%; width: 6px; margin-left: -3px; background: linear-gradient(#fff6d6, #F2C14E, #fff6d6); filter: blur(2px); opacity: .85; animation: gf-pulse 1.6s ease-in-out infinite; }
.gf-open .gf-light { opacity: 1; transform: scale(1.25); }
.gf-dust { position: absolute; bottom: 10%; width: 6px; height: 6px; border-radius: 50%; background: #fff6d6; box-shadow: 0 0 8px #F2C14E; animation: gf-rise 2.2s ease-out forwards; opacity: 0; }
@keyframes gf-rise { 0% { transform: translate(0,0) scale(.6); opacity: 0 } 15% { opacity: 1 } 100% { transform: translate(var(--dx), -70vh) scale(1.2); opacity: 0 } }
/* 별 깨우기 */
.gf-breath { animation: gf-breath 2.6s ease-in-out infinite; transform-origin: 50% 50%; }
@keyframes gf-breath { 0%,100% { transform: scale(.96) rotate(-3deg) } 50% { transform: scale(1.03) rotate(3deg) } }
.gf-zzz { position: absolute; font-weight: 900; color: #cfd6ea; animation: gf-zzz 2.4s ease-in-out infinite; }
@keyframes gf-zzz { 0% { transform: translate(0,0) scale(.6); opacity: 0 } 30% { opacity: .9 } 100% { transform: translate(26px,-60px) scale(1.2); opacity: 0 } }
.gf-wakejolt { animation: gf-jolt .45s ease-in-out; }
@keyframes gf-jolt { 0% { transform: scale(1) } 30% { transform: scale(.9) rotate(-10deg) } 60% { transform: scale(1.18) rotate(8deg) } 100% { transform: scale(1.12) } }
.gf-rays { animation: gf-rays 1.6s ease-out forwards; transform-origin: 50% 50%; }
@keyframes gf-rays { 0% { transform: scale(.3) rotate(0); opacity: 0 } 20% { opacity: 1 } 100% { transform: scale(1.5) rotate(40deg); opacity: 0 } }
.gf-glow { animation: gf-glow 1.8s ease-in-out infinite; }
@keyframes gf-glow { 0%,100% { filter: drop-shadow(0 0 10px var(--c)) } 50% { filter: drop-shadow(0 0 28px var(--c)) } }
.gf-draw { stroke-dasharray: var(--len); stroke-dashoffset: var(--len); animation: gf-draw var(--dur, 1s) ease-out var(--delay, 0s) forwards; }
@keyframes gf-draw { to { stroke-dashoffset: 0 } }
.gf-spin { animation: gf-spin 1.2s linear infinite; transform-origin: 50% 50%; transform-box: fill-box; }
@keyframes gf-spin { to { transform: rotate(360deg) } }
.gf-note { animation: gf-note 1.8s ease-out var(--delay, 0s) forwards; opacity: 0; transform-box: fill-box; }
@keyframes gf-note { 0% { transform: translate(0,0); opacity: 0 } 20% { opacity: 1 } 100% { transform: translate(var(--dx), -150px); opacity: 0 } }
.gf-moonrise { animation: gf-moonrise 1.8s cubic-bezier(.2,.8,.2,1) forwards; transform-box: fill-box; }
@keyframes gf-moonrise { from { transform: translateY(80px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
.gf-cloudL { animation: gf-cloudL 1.8s ease-in-out forwards; } .gf-cloudR { animation: gf-cloudR 1.8s ease-in-out forwards; }
@keyframes gf-cloudL { to { transform: translateX(-140px); opacity: .2 } } @keyframes gf-cloudR { to { transform: translateX(140px); opacity: .2 } }
.gf-ripple { animation: gf-ripple 1.8s ease-out var(--delay, 0s) forwards; transform-origin: 50% 50%; transform-box: fill-box; opacity: 0; }
@keyframes gf-ripple { 0% { transform: scale(.2); opacity: .9 } 100% { transform: scale(2.4); opacity: 0 } }
.gf-fly { offset-rotate: 0deg; animation: gf-fly 2s ease-in-out forwards; }
@keyframes gf-fly { from { offset-distance: 0% } to { offset-distance: 100% } }
.gf-flap { animation: gf-flap .22s ease-in-out infinite alternate; transform-origin: 50% 50%; transform-box: fill-box; }
@keyframes gf-flap { from { transform: scaleX(1) } to { transform: scaleX(.25) } }
.gf-spin-slow { animation: gf-spin 9s linear infinite; transform-origin: 50% 50%; }
.gf-sway { animation: gf-sway 4s ease-in-out infinite; transform-origin: 50% 50%; }
@keyframes gf-sway { 0%,100% { transform: rotate(-4deg) scale(1) } 50% { transform: rotate(4deg) scale(1.03) } }
.gf-pop { animation: gf-pop .6s cubic-bezier(.2,1.6,.4,1) both; }
@keyframes gf-pop { from { transform: scale(.3); opacity: 0 } to { transform: scale(1); opacity: 1 } }
/* 정답 별 날아가기 */
.gf-flystar { position: fixed; z-index: 95; left: 50%; top: 50%; pointer-events: none; animation: gf-flystar 1.1s cubic-bezier(.5,0,.2,1) forwards; }
@keyframes gf-flystar { 0% { transform: translate(-50%,-50%) scale(.4); opacity: 0 } 20% { transform: translate(-50%,-50%) scale(1.4); opacity: 1 } 100% { transform: translate(-50%, -48vh) scale(.35); opacity: .2 } }
.gf-sleepy { animation: gf-sleepy 1.4s ease-in forwards; }
@keyframes gf-sleepy { 0% { filter: none; transform: none } 100% { filter: grayscale(1) brightness(.6); transform: translateY(10px) rotate(-12deg) } }
/* 별자리 */
.gf-ribbon { animation: gf-ribbon 1.1s cubic-bezier(.2,1.4,.4,1) both; transform-origin: 50% 0; }
@keyframes gf-ribbon { 0% { transform: translateY(-120%) rotate(-6deg) } 70% { transform: translateY(6%) rotate(2deg) } 100% { transform: translateY(0) rotate(0) } }
.gf-swing { animation: gf-swing 3s ease-in-out 1.1s infinite; transform-origin: 50% 0; }
@keyframes gf-swing { 0%,100% { transform: rotate(-1.5deg) } 50% { transform: rotate(1.5deg) } }
@media (prefers-reduced-motion: reduce) { .gf-stage *, .gf-flystar { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; } }
`;
