import React, { useId } from 'react';

const profiles = {
  SUV: { roof: 'M178 177 Q245 90 394 84 L594 88 Q690 100 747 177', belt: 178, wheel: 70 },
  Convertible: { roof: 'M224 177 Q304 133 401 130 L555 132 Q628 139 674 177', belt: 178, wheel: 65 },
  Coupe: { roof: 'M176 183 Q295 106 444 110 Q626 108 742 183', belt: 184, wheel: 66 },
  Sedan: { roof: 'M181 183 Q261 106 410 103 L552 108 Q670 123 749 183', belt: 184, wheel: 64 },
  Electric: { roof: 'M174 183 Q273 105 424 103 L555 108 Q676 125 754 183', belt: 184, wheel: 65 },
};

/** Colorable vector product views keep the same vehicle, wheels and highlights across selections. */
export function VehicleArtwork({ vehicle, color = '#67778a', view = 'front', className = '' }) {
  const id = useId().replace(/:/g, '');
  const profile = profiles[vehicle.category] || profiles.Sedan;
  const rear = view === 'rear';
  const side = view === 'side';
  const cabin = view === 'interior';
  const gradientId = `body-${id}`;
  const glassId = `glass-${id}`;
  const shadowId = `shadow-${id}`;
  const title = `${vehicle.make} ${vehicle.model}, ${view} view`;

  if (cabin) return (
    <svg className={className} viewBox="0 0 900 470" role="img" aria-label={title} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={gradientId} x2="0" y2="1"><stop stopColor="#3c414b"/><stop offset="1" stopColor="#151923"/></linearGradient>
        <linearGradient id={glassId} x2="0" y2="1"><stop stopColor="#a7b8c5"/><stop offset="1" stopColor="#e8ecef"/></linearGradient>
      </defs>
      <ellipse cx="450" cy="425" rx="330" ry="20" fill="#c8d1d8" opacity=".4"/>
      <path d="M130 95 Q450 8 770 95 L805 365 Q450 442 95 365 Z" fill={`url(#${gradientId})`} stroke="#69717a" strokeWidth="5"/>
      <path d="M165 112 Q450 28 735 112 L705 210 Q450 153 195 210 Z" fill={`url(#${glassId})`}/>
      <path d="M205 204 Q450 159 695 204 L755 329 Q450 389 145 329 Z" fill="#252b34" stroke="#444c56" strokeWidth="5"/>
      <path d="M319 243 Q450 217 581 243 L563 311 Q450 329 337 311 Z" fill="#121922" stroke="#686f79" strokeWidth="3"/>
      <path d="M335 251 Q450 231 565 251" fill="none" stroke={color} strokeWidth="4"/>
      <rect x="390" y="253" width="120" height="63" rx="7" fill="#0a111a" stroke="#637381" strokeWidth="3"/>
      <path d="M410 275 H485 M410 288 H466" stroke="#9eb8c4" strokeWidth="4" opacity=".65"/>
      <circle cx="266" cy="277" r="69" fill="#10151b" stroke="#77838c" strokeWidth="13"/>
      <circle cx="266" cy="277" r="42" fill="none" stroke="#727d87" strokeWidth="9"/>
      <path d="M266 235 V322 M224 263 L266 278 L309 263" stroke="#7d8993" strokeWidth="9" fill="none"/>
      <path d="M159 387 Q232 329 330 347 L358 450 H79 Z M741 387 Q668 329 570 347 L542 450 H821 Z" fill="#41464c" stroke="#151923" strokeWidth="7"/>
      <path d="M390 343 H510 L535 449 H365 Z" fill="#353b43"/>
    </svg>
  );

  return (
    <svg className={className} viewBox="0 0 900 470" role="img" aria-label={title} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={gradientId} x1=".15" y1="0" x2=".85" y2="1">
          <stop stopColor="#fff" stopOpacity=".78"/><stop offset=".2" stopColor={color}/><stop offset=".58" stopColor={color}/><stop offset="1" stopColor="#101923" stopOpacity=".86"/>
        </linearGradient>
        <linearGradient id={glassId} x2="0" y2="1"><stop stopColor="#111923"/><stop offset=".55" stopColor="#273d4c"/><stop offset="1" stopColor="#8296a2"/></linearGradient>
        <radialGradient id={shadowId}><stop stopColor="#4a5867" stopOpacity=".34"/><stop offset="1" stopColor="#4a5867" stopOpacity="0"/></radialGradient>
      </defs>
      <ellipse cx="451" cy="377" rx="384" ry="45" fill={`url(#${shadowId})`}/>
      {side ? (
        <g>
          <path d="M79 256 Q89 221 151 215 L192 183 Q268 120 415 115 L558 119 Q668 131 755 194 L815 218 Q847 228 847 278 L832 322 Q816 333 773 333 H137 Q91 329 77 305 Z" fill={`url(#${gradientId})`} stroke="#24313d" strokeWidth="4"/>
          <path d={profile.roof} fill="none" stroke="#e3e8eb" strokeOpacity=".65" strokeWidth="5"/>
          <path d="M195 187 Q275 132 418 128 L555 131 Q666 142 744 190 L638 199 L192 198 Z" fill={`url(#${glassId})`}/>
          <path d="M419 129 L426 199 M555 132 L638 199" stroke="#c8d3d9" strokeWidth="7"/>
          <path d="M166 216 Q450 220 778 216" stroke="#e8edf0" strokeOpacity=".6" strokeWidth="3" fill="none"/>
          <path d="M134 296 Q450 319 815 292" stroke="#0e1c27" strokeOpacity=".45" strokeWidth="5" fill="none"/>
          <rect x="453" y="215" width="47" height="5" rx="2" fill="#d5dde0"/>
          <rect x="643" y="212" width="45" height="5" rx="2" fill="#d5dde0"/>
          <path d="M80 248 L153 238 L148 256 L80 266 Z" fill="#f5fbff"/><path d="M797 240 L844 251 L840 267 L796 259 Z" fill="#bd2936"/>
          {[232, 707].map((x) => <Wheel key={x} x={x} y={310} r={profile.wheel * .68}/>)}
        </g>
      ) : rear ? (
        <g>
          <path d="M229 310 L233 350 Q245 371 282 373 H618 Q655 371 667 350 L671 310" fill="#151c23"/>
          <path d="M225 245 Q241 183 304 157 Q373 130 450 130 Q527 130 596 157 Q659 183 675 245 L743 296 Q756 317 732 340 Q648 364 450 365 Q252 364 168 340 Q144 317 157 296 Z" fill={`url(#${gradientId})`} stroke="#26333b" strokeWidth="5"/>
          <path d="M300 167 Q450 126 600 167 L633 244 Q450 257 267 244 Z" fill={`url(#${glassId})`} stroke="#cbd7db" strokeWidth="5"/>
          <path d="M159 294 L323 287 L307 316 L168 320 Z M577 287 L741 294 L732 320 L593 316 Z" fill="#a7192a" stroke="#ff9da1" strokeWidth="5"/>
          <path d="M172 322 Q450 349 728 322" fill="none" stroke="#e9eff0" strokeOpacity=".6" strokeWidth="4"/>
          <path d="M238 350 Q450 370 662 350" fill="none" stroke="#0f1922" strokeWidth="11"/>
          <rect x="395" y="321" width="110" height="25" rx="4" fill="#d5dde0" stroke="#74818a" strokeWidth="3"/>
          <path d="M241 325 L224 366 M659 325 L676 366" stroke="#141d25" strokeWidth="15"/>
        </g>
      ) : (
        <g>
          <path d="M229 307 L231 358 Q249 379 295 380 H605 Q651 379 669 358 L671 307" fill="#19222a"/>
          <path d="M227 241 Q256 176 315 145 Q372 111 450 111 Q528 111 585 145 Q644 176 673 241 L755 304 Q769 331 733 350 Q609 374 450 375 Q291 374 167 350 Q131 331 145 304 Z" fill={`url(#${gradientId})`} stroke="#263541" strokeWidth="5"/>
          <path d="M315 153 Q450 107 585 153 L628 239 Q450 250 272 239 Z" fill={`url(#${glassId})`} stroke="#d7e1e4" strokeWidth="5"/>
          <path d="M265 242 Q450 266 635 242" stroke="#eef5f6" strokeOpacity=".7" strokeWidth="5" fill="none"/>
          <path d="M154 304 Q450 279 746 304" stroke="#fff" strokeOpacity=".45" strokeWidth="4" fill="none"/>
          <path d="M167 300 L314 280 L291 321 L149 326 Z M586 280 L733 300 L751 326 L609 321 Z" fill="#e9f5f8" stroke="#aac1ca" strokeWidth="4"/>
          <path d="M280 340 Q450 361 620 340" stroke="#101b23" strokeWidth="12" fill="none"/>
          <path d="M174 349 Q450 381 726 349" stroke="#899ba7" strokeOpacity=".45" strokeWidth="4" fill="none"/>
          <path d="M240 340 L222 375 M660 340 L678 375" stroke="#141d25" strokeWidth="17"/>
        </g>
      )}
      <path d="M154 363 H750" stroke="#9eacb5" opacity=".14" strokeWidth="2"/>
    </svg>
  );
}

function Wheel({ x, y, r }) {
  return <g>
    <circle cx={x} cy={y} r={r + 6} fill="#131a21"/>
    <circle cx={x} cy={y} r={r - 4} fill="#28323b" stroke="#697780" strokeWidth="4"/>
    <circle cx={x} cy={y} r={r - 19} fill="#121a20" stroke="#9aa5ab" strokeWidth="3"/>
    {[0, 60, 120].map((deg) => <path key={deg} d={`M${x} ${y - r + 20} V${y + r - 20}`} stroke="#77858d" strokeWidth="5" transform={`rotate(${deg} ${x} ${y})`}/>)}
    <circle cx={x} cy={y} r="8" fill="#aeb8bd"/>
  </g>;
}
