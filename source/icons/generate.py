"""Generate the mod's ability and status icons from one design system (see DESIGN.md).

Glyphs only draw shapes with three tokens: B (body), F (face), A (accent).
The generator owns everything else: colours, frame, lighting, outline, shadow
and placement (each glyph is measured and auto-fitted into the safe box).

Usage: python3 source/icons/generate.py   (from the mod root; needs rsvg-convert and magick)
"""
import math
import os
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SVG_DIR = os.path.join(ROOT, "source", "icons", "svg")
OUT = {
    "ability": os.path.join(ROOT, "art", "textures", "ui", "session", "portraits", "abilities"),
    "status": os.path.join(ROOT, "art", "textures", "ui", "session", "icons", "status_effects"),
    "rank": os.path.join(ROOT, "art", "textures", "ui", "session", "icons", "ranks"),
}
SIZE = 128  # power of two, matches existing icons
OUT_SIZE = {"rank": (64, 16)}  # 16 px tall like vanilla ranks, 4x wider so 5 stars stay legible; default is SIZE x SIZE
CANVAS = {"rank": (128, 32)}  # SVG viewBox for rank icons; default 128x128

# Safe box: max glyph side and centre, per icon kind (128-unit canvas).
SAFE = {"ability": 76, "status": 100}
CENTRE = (64, 64)

# Paint tokens. Glyphs must use only these.
B, F, A = "url(#body)", "url(#face)", "url(#accent)"

# Hue sets: (ground, body, face, accent)
HUES = {
    "red": ("#7a2b24", "#5a1d18", "#f2c9b0", "#ffd36b"),
    "gold": ("#7a6022", "#4a3410", "#f3dc92", "#fff3c4"),
    "violet": ("#4c3577", "#2a1b45", "#ddd0ff", "#ffe08a"),
    "blue": ("#284f86", "#16304f", "#d2e4fa", "#ffe08a"),
    "steel": ("#4a5059", "#23272c", "#e1e6ec", "#ffd36b"),
    "green": ("#285238", "#123020", "#bfeec4", "#f2ff9e"),
    "teal": ("#22585a", "#0e2c2d", "#c4f1ea", "#ffe08a"),
    "brown": ("#5e4128", "#33210f", "#f1d6ad", "#ffd36b"),
    "fire": (None, "#8e1a10", "#f07a22", "#fff1b0"),
    "holy": (None, "#8a5d10", "#f5c542", "#fffbe0"),
    "shield": ("#3a4658", "#2b3138", "#4f7fd6", "#f4f7fb"),
    "poison": (None, "#123a18", "#5cc04e", "#d8ffc0"),
}

GLYPHS = {
    # ---------------------------------------------------------------- weapons / actions
    "circular_attack": f"""
<defs><path id="blade" d="M64 64 C50 50 50 24 74 10 C68 30 78 44 96 50 C84 52 72 56 64 64 Z"/></defs>
<g fill="{F}"><use href="#blade"/><use href="#blade" transform="rotate(120 64 64)"/><use href="#blade" transform="rotate(240 64 64)"/></g>
<circle cx="64" cy="64" r="11" fill="{B}"/>""",
    "berserk_strike": f"""
<g transform="rotate(38 64 64)">
  <rect x="58" y="70" width="12" height="50" rx="4" fill="{B}"/>
  <path d="M56 76 C50 52 44 32 52 18 C58 8 70 8 76 18 C84 32 78 52 72 76 Z" fill="{F}"/>
  <g fill="{F}"><path d="M50 36 L40 32 L48 46 Z"/><path d="M52 58 L44 60 L54 66 Z"/><path d="M78 36 L88 32 L80 46 Z"/><path d="M76 58 L84 60 L74 66 Z"/><path d="M58 12 L64 2 L70 12 Z"/></g>
  <rect x="55" y="74" width="18" height="6" rx="2" fill="{A}"/>
</g>""",
    "shuriken": f"""
<path d="M64 18 L74 54 L110 64 L74 74 L64 110 L54 74 L18 64 L54 54 Z" fill="{F}"/>
<circle cx="64" cy="64" r="9" fill="{B}"/>""",
    "target_arrow": f"""
<circle cx="60" cy="68" r="38" fill="{F}"/><circle cx="60" cy="68" r="26" fill="{B}"/>
<circle cx="60" cy="68" r="14" fill="{F}"/><circle cx="60" cy="68" r="5" fill="{B}"/>
<path d="M60 68 L104 24" stroke="{B}" stroke-width="6" stroke-linecap="round"/>
<path d="M100 16 L116 12 L112 28 L107 22 Z M94 22 L110 18 L106 34 L101 28 Z" fill="{A}"/>""",
    "bomb": f"""
<circle cx="58" cy="74" r="32" fill="{F}"/>
<rect x="68" y="34" width="18" height="14" rx="3" transform="rotate(35 77 41)" fill="{B}"/>
<path d="M84 34 C90 26 96 26 100 20" fill="none" stroke="{B}" stroke-width="5" stroke-linecap="round"/>
<path d="M102 8 L106 18 L116 16 L108 24 L114 32 L104 28 L100 36 L98 26 L88 24 L98 20 Z" fill="{A}"/>""",
    "burst": f"""
<path d="M64 10 L74 42 L104 22 L88 52 L120 60 L88 72 L106 104 L74 86 L64 118 L54 86 L22 104 L40 72 L8 60 L40 52 L24 22 L54 42 Z" fill="{F}"/>
<path d="M64 38 L70 54 L86 50 L76 64 L86 78 L70 74 L64 90 L58 74 L42 78 L52 64 L42 50 L58 54 Z" fill="{A}"/>""",
    "lightning_strike": f"""
<path d="M72 18 L38 70 H60 L50 110 L92 52 H68 L80 18 Z" fill="{F}"/>""",
    "rings": f"""
<circle cx="64" cy="64" r="12" fill="{F}"/>
<g fill="none" stroke="{F}" stroke-linecap="round">
  <circle cx="64" cy="64" r="28" stroke-width="9" stroke-dasharray="36 8"/>
  <circle cx="64" cy="64" r="46" stroke-width="7" stroke-dasharray="52 12"/>
</g>""",
    "bear_trap": f"""
<g fill="{F}">
  <path d="M30 92 C18 72 22 44 48 26 L54 32 C34 48 32 72 40 92 Z"/>
  <path d="M98 92 C110 72 106 44 80 26 L74 32 C94 48 96 72 88 92 Z"/>
  """ + "".join(f'<path d="M{x} {y} L{x + 11} {y + 3} L{x + 2} {y + 9} Z"/><path d="M{128 - x} {y} L{128 - x - 11} {y + 3} L{128 - x - 2} {y + 9} Z"/>'
                for x, y in [(30, 74), (30, 60), (34, 47), (42, 36)]) + f"""
</g>
<rect x="14" y="90" width="100" height="14" rx="4" fill="{F}"/>
<circle cx="34" cy="96" r="7" fill="{B}"/><circle cx="94" cy="96" r="7" fill="{B}"/>""",
    # ---------------------------------------------------------------- defence / support
    "aura_of_war": f"""
<defs><path id="ray" d="M60 40 L64 6 L68 40 Z"/></defs>
<g fill="{A}">""" + "".join(f'<use href="#ray" transform="rotate({a} 64 64)"/>' for a in range(0, 360, 30)) + f"""</g>
<circle cx="64" cy="64" r="30" fill="{B}"/>
<path d="M64 22 L71 32 V80 H57 V32 Z" fill="{F}"/>
<rect x="46" y="78" width="36" height="7" rx="3" fill="{F}"/>
<rect x="60" y="85" width="8" height="16" rx="2" fill="{F}"/>
<circle cx="64" cy="104" r="5" fill="{F}"/>""",
    "bless": f"""
<ellipse cx="64" cy="32" rx="26" ry="9" fill="none" stroke="{A}" stroke-width="7"/>
<path d="M64 48 L92 58 V76 C92 92 80 102 64 108 C48 102 36 92 36 76 V58 Z" fill="{B}"/>
<path d="M64 62 L68 74 L80 74 L70 82 L74 94 L64 86 L54 94 L58 82 L48 74 L60 74 Z" fill="{F}"/>""",
    # 0 A.D. "standground" vocabulary: overlapping tower shields with a boss strip
    "protect_units": f"""
<defs><g id="tower"><path d="M-15 -42 Q0 -48 15 -42 V38 Q0 46 -15 38 Z" fill="{F}"/>
<rect x="-2.5" y="-40" width="5" height="78" fill="{A}"/><circle r="6" fill="{A}"/></g></defs>
<use href="#tower" transform="translate(40 66) rotate(-10) scale(0.88)"/>
<use href="#tower" transform="translate(88 66) rotate(10) scale(0.88)"/>
<use href="#tower" transform="translate(64 64)"/>""",
    "last_stand": f"""
<path d="M64 104 C30 82 20 62 28 46 C36 30 56 30 64 46 C72 30 92 30 100 46 C108 62 98 82 64 104 Z" fill="{F}"/>
<path d="M30 66 H50 L56 54 L64 80 L72 60 L78 66 H98" fill="none" stroke="{B}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>""",
    "conversion": f"""
<circle cx="64" cy="46" r="11" fill="{F}"/><path d="M46 92 C46 70 82 70 82 92 Z" fill="{F}"/>
<g fill="{A}">
  <path d="M24 60 A40 40 0 0 1 92 26 L98 18 L104 44 L80 40 L86 34 A30 30 0 0 0 34 62 Z"/>
  <path d="M104 68 A40 40 0 0 1 36 102 L30 110 L24 84 L48 88 L42 94 A30 30 0 0 0 94 66 Z"/>
</g>""",
    # ---------------------------------------------------------------- creatures / voices / nature
    "call_wolfs": f"""
<path d="M34 30 L52 50 H76 L94 30 L92 64 L78 84 L64 104 L50 84 L36 64 Z" fill="{F}"/>
<g fill="{B}"><path d="M48 62 L58 66 L48 70 Z"/><path d="M80 62 L70 66 L80 70 Z"/><path d="M58 90 H70 L64 98 Z"/></g>""",
    "war_cry": f"""
<path d="M22 44 C22 26 50 22 56 40 L60 56 L50 60 L58 66 L50 72 L52 92 C38 98 22 90 22 74 Z" fill="{F}"/>
<g fill="{A}">
  <path d="M68 50 A18 18 0 0 1 68 78 L76 84 A28 28 0 0 0 76 44 Z"/>
  <path d="M82 38 A34 34 0 0 1 82 90 L90 96 A44 44 0 0 0 90 32 Z"/>
</g>""",
    "war_horn": f"""
<path d="M18 104 C24 78 50 50 92 30 L112 64 C80 70 52 86 30 112 Z" fill="{F}"/>
<ellipse cx="102" cy="47" rx="9" ry="20" transform="rotate(-28 102 47)" fill="{B}"/>
<g fill="{B}"><path d="M44 66 L52 60 L64 82 L56 88 Z"/><path d="M66 50 L75 45 L86 70 L77 74 Z"/></g>""",
    "drum": f"""
<path d="M24 54 V88 C24 98 104 98 104 88 V54 Z" fill="{B}"/>
<ellipse cx="64" cy="54" rx="40" ry="14" fill="{F}"/>
<path d="M30 66 L46 92 L62 68 L78 94 L96 66" fill="none" stroke="{F}" stroke-width="4" stroke-linejoin="round"/>
<g stroke="{A}" stroke-width="6" stroke-linecap="round"><path d="M36 18 L60 48"/><path d="M92 18 L68 48"/></g>""",
    "drum_pulse": f"""
<path d="M34 70 V96 C34 104 94 104 94 96 V70 Z" fill="{B}"/>
<ellipse cx="64" cy="70" rx="30" ry="10" fill="{F}"/>
<g fill="none" stroke="{A}" stroke-width="7" stroke-linecap="round">
  <path d="M40 46 A30 30 0 0 1 88 46"/><path d="M26 34 A48 48 0 0 1 102 34"/>
</g>""",
    "spyglass": f"""
<g transform="rotate(-30 64 64)">
  <rect x="14" y="54" width="30" height="22" rx="3" fill="{F}"/>
  <rect x="42" y="57" width="30" height="16" rx="2" fill="{F}"/>
  <rect x="70" y="59" width="26" height="12" rx="2" fill="{F}"/>
  <rect x="94" y="56" width="10" height="18" rx="2" fill="{B}"/>
  <rect x="38" y="52" width="6" height="26" fill="{B}"/><rect x="68" y="55" width="5" height="20" fill="{B}"/>
</g>""",
    "poison_cloud": f"""
<path d="M36 72 C22 72 22 52 36 52 C36 36 58 32 64 44 C72 30 96 36 92 54 C106 54 106 72 92 72 Z" fill="{F}"/>
<g fill="{A}">
  <path d="M44 80 C44 80 36 92 44 96 C52 92 44 80 44 80 Z"/><path d="M64 82 C64 82 56 96 64 100 C72 96 64 82 64 82 Z"/><path d="M84 80 C84 80 76 92 84 96 C92 92 84 80 84 80 Z"/>
</g>""",
    # ---------------------------------------------------------------- status-effect objects
    "flame": f"""
<path d="M60 6 C64 26 82 34 90 50 C94 40 92 30 88 24 C104 38 114 58 112 80 C110 106 90 122 64 122 C38 122 18 106 18 82 C18 62 30 50 38 42 C38 54 42 62 48 66 C46 46 50 24 60 6 Z" fill="{B}"/>
<path d="M64 34 C66 50 80 58 84 74 C86 66 86 60 84 56 C94 66 98 80 96 92 C94 108 80 116 64 116 C48 116 34 106 34 90 C34 76 42 68 48 62 C48 72 52 78 56 80 C54 64 56 48 64 34 Z" fill="{F}"/>
<path d="M64 64 C66 76 76 82 78 94 C80 106 72 112 64 112 C56 112 48 106 50 94 C51 86 56 82 58 78 C60 84 62 86 64 86 C62 78 62 70 64 64 Z" fill="{A}"/>""",
    "halo": f"""
<defs><path id="beam" d="M60 30 L64 6 L68 30 Z"/></defs>
<g fill="{A}">""" + "".join(f'<use href="#beam" transform="rotate({a} 64 64)"/>' for a in range(0, 360, 30)) + f"""</g>
<circle cx="64" cy="64" r="34" fill="none" stroke="{B}" stroke-width="16"/>
<circle cx="64" cy="64" r="34" fill="none" stroke="{F}" stroke-width="11"/>""",
    "kite_shield": f"""
<path d="M64 6 L114 22 V58 C114 92 92 112 64 124 C36 112 14 92 14 58 V22 Z" fill="{B}"/>
<path d="M64 16 L105 29 V58 C105 86 87 103 64 113 C41 103 23 86 23 58 V29 Z" fill="{F}"/>
<path d="M57 38 H71 V56 H89 V70 H71 V92 H57 V70 H39 V56 H57 Z" fill="{A}"/>""",
    "poison_drop": f"""
<path d="M58 6 C58 6 16 58 16 86 C16 110 36 124 58 124 C80 124 100 110 100 86 C100 58 58 6 58 6 Z" fill="{F}"/>
<path d="M42 80 C42 68 74 68 74 80 C74 88 70 92 66 94 V100 H50 V94 C46 92 42 88 42 80 Z" fill="{B}"/>
<g fill="{A}"><circle cx="51" cy="81" r="5"/><circle cx="65" cy="81" r="5"/></g>
<circle cx="106" cy="34" r="10" fill="{F}"/><circle cx="110" cy="60" r="6" fill="{F}"/>""",
}

def stars(n):
    """Five star slots in a 128x32 row: the first n gold, the rest dark outline only (placed as-is, not fitted)."""
    def star(cx, filled):
        pts = []
        for i in range(10):
            r = 12.5 if i % 2 == 0 else 5.6
            a = math.radians(-90 + 36 * i)
            pts.append(f"{cx + r * math.cos(a):.2f} {17 + r * math.sin(a):.2f}")
        fill = f'fill="{F}"' if filled else f'fill="none" stroke="{B}" stroke-width="2.5" stroke-linejoin="round"'
        return f'<path d="M{" L".join(pts)} Z" {fill}/>'
    return "".join(star(14 + 25 * i, i < n) for i in range(5))


GLYPHS.update({f"stars_{n}": stars(n) for n in range(1, 6)})

# (file name, kind, glyph, hue)
ICONS = [
    ("circular_attack", "ability", "circular_attack", "red"),
    ("aura_of_war", "ability", "aura_of_war", "gold"),
    ("lightning_strike", "ability", "lightning_strike", "violet"),
    ("bless", "ability", "bless", "blue"),
    ("protect_units", "ability", "protect_units", "shield"),
    ("poison_cloud", "ability", "poison_cloud", "green"),
    ("shuriken", "ability", "shuriken", "steel"),
    ("berserk_strike", "ability", "berserk_strike", "brown"),
    ("call_wolfs", "ability", "call_wolfs", "teal"),
    ("last_stand", "ability", "last_stand", "red"),
    ("war_cry", "ability", "war_cry", "brown"),
    ("battle_cry", "ability", "war_horn", "brown"),
    ("battle_cry_custom", "ability", "war_horn", "red"),
    ("conversion", "ability", "conversion", "violet"),
    ("ground_charge", "ability", "bomb", "steel"),
    ("scout_longue_vue", "ability", "spyglass", "teal"),
    ("sharpshooter", "ability", "target_arrow", "red"),
    ("shock_burst", "ability", "burst", "gold"),
    ("shockwave", "ability", "rings", "blue"),
    ("snare_trap", "ability", "bear_trap", "green"),
    ("war_drum", "ability", "drum", "brown"),
    ("war_pulse", "ability", "drum_pulse", "gold"),
    ("battle_cry_buff", "status", "war_horn", "red"),
    ("war_drum_buff", "status", "drum", "brown"),
    ("aura_of_war_buff", "status", "flame", "fire"),
    ("bless_buff", "status", "halo", "holy"),
    ("protect_units_buff", "status", "kite_shield", "shield"),
    ("poison_cloud", "status", "poison_drop", "poison"),
] + [(f"star_{n}", "rank", f"stars_{n}", "holy") for n in range(1, 6)]


def shade(hex_color, factor):
    """Lighten (factor > 1) or darken (factor < 1) a #rrggbb colour."""
    r, g, b = (int(hex_color[i:i + 2], 16) for i in (1, 3, 5))
    if factor >= 1:
        r, g, b = (int(c + (255 - c) * (factor - 1)) for c in (r, g, b))
    else:
        r, g, b = (int(c * factor) for c in (r, g, b))
    return f"#{r:02x}{g:02x}{b:02x}"


def token_defs(hue, theme):
    _, body, face, accent = HUES[hue]
    if theme == "material":
        return "\n".join(f'<linearGradient id="{gid}"><stop offset="0" stop-color="{c}"/></linearGradient>'
                         for gid, c in (("body", body), ("face", face), ("accent", accent)))

    def vgrad(gid, top, bottom):
        return (f'<linearGradient id="{gid}" x1="0" y1="0" x2="0" y2="1">'
                f'<stop offset="0" stop-color="{top}"/><stop offset="1" stop-color="{bottom}"/></linearGradient>')

    return "\n".join([
        vgrad("body", shade(body, 1.2), shade(body, 0.7)),
        vgrad("face", shade(face, 1.3), shade(face, 0.82)),
        vgrad("accent", shade(accent, 1.4), accent),
    ])


# One material per theme, applied to every glyph.
MATERIALS = {
    # flat colours, soft elevation shadow, no outline or highlight
    "material": """<filter id="material" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB">
  <feGaussianBlur in="SourceAlpha" stdDeviation="2.2"/><feOffset dy="2.5"/>
  <feComponentTransfer result="shadow"><feFuncA type="linear" slope="0.35"/></feComponentTransfer>
  <feMerge><feMergeNode in="shadow"/><feMergeNode in="SourceGraphic"/></feMerge>
</filter>""",
    # RTS command card: gradient silhouette, thin dark outline, tight shadow, no gloss
    "rts": """<filter id="material" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB">
  <feMorphology in="SourceAlpha" operator="dilate" radius="1" result="thick"/>
  <feFlood flood-color="#0a0806"/><feComposite in2="thick" operator="in" result="outline"/>
  <feGaussianBlur in="thick" stdDeviation="1.4"/><feOffset dx="0.8" dy="1.6"/>
  <feComponentTransfer result="shadow"><feFuncA type="linear" slope="0.8"/></feComponentTransfer>
  <feMerge><feMergeNode in="shadow"/><feMergeNode in="outline"/><feMergeNode in="SourceGraphic"/></feMerge>
</filter>""",
}

FRAMES = {
    "material": ("""<linearGradient id="ground"><stop offset="0" stop-color="{g1}"/></linearGradient>""",
                 """<rect x="4" y="4" width="120" height="120" rx="18" fill="url(#ground)"/>"""),
    "rts": ("""<radialGradient id="ground" cx="0.5" cy="0.42" r="0.72"><stop offset="0" stop-color="{g1}"/><stop offset="1" stop-color="{g2}"/></radialGradient>
<linearGradient id="rim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9b2a2"/><stop offset="0.5" stop-color="#6c665a"/><stop offset="1" stop-color="#2c2924"/></linearGradient>""",
            """<rect x="2" y="2" width="124" height="124" rx="6" fill="url(#rim)"/>
<rect x="5" y="5" width="118" height="118" rx="4" fill="url(#ground)" stroke="#0a0806" stroke-width="2"/>"""),
}
THEME = "rts"  # default; "material" is the flat alternative

def document(defs, body, canvas=(128, 128)):
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{canvas[0]}" height="{canvas[1]}" viewBox="0 0 {canvas[0]} {canvas[1]}">
<defs>
{defs}
</defs>
{body}
</svg>
"""


def measure(glyph_svg, hue, theme):
    """Render the bare glyph and return its alpha bounding box (x, y, w, h) in canvas units."""
    scale = 4
    with tempfile.TemporaryDirectory() as td:
        src, png = os.path.join(td, "g.svg"), os.path.join(td, "g.png")
        with open(src, "w") as f:
            f.write(document(token_defs(hue, theme), glyph_svg))
        subprocess.run(["rsvg-convert", "-w", str(SIZE * scale), "-h", str(SIZE * scale), "-o", png, src], check=True)
        geom = subprocess.run(["magick", png, "-alpha", "extract", "-threshold", "10%", "-format", "%@", "info:"],
                              check=True, capture_output=True, text=True).stdout.strip()
    wh, x, y = geom.split("+")
    w, h = wh.split("x")
    return tuple(int(v) / scale for v in (x, y, w, h))


def build(kind, glyph, hue, theme):
    if kind == "rank":
        defs = token_defs(hue, theme) + "\n" + MATERIALS[theme]
        return document(defs, f'<g filter="url(#material)">{GLYPHS[glyph]}</g>', CANVAS[kind])
    x, y, w, h = measure(GLYPHS[glyph], hue, theme)
    k = SAFE[kind] / max(w, h)
    tx = CENTRE[0] - (x + w / 2) * k
    ty = CENTRE[1] - (y + h / 2) * k
    placed = f'<g filter="url(#material)"><g transform="translate({tx:.2f} {ty:.2f}) scale({k:.4f})">{GLYPHS[glyph]}</g></g>'
    defs = token_defs(hue, theme) + "\n" + MATERIALS[theme]
    if kind == "ability":
        ground = HUES[hue][0]
        frame_defs, frame_shapes = FRAMES[theme]
        defs += "\n" + frame_defs.format(g1=shade(ground, 0.9), g2=shade(ground, 0.3))
        return document(defs, frame_shapes + "\n" + placed)
    return document(defs, placed)


def main(theme=THEME):
    os.makedirs(SVG_DIR, exist_ok=True)
    for name, kind, glyph, hue in ICONS:
        src = os.path.join(SVG_DIR, f"{kind}_{name}.svg")
        with open(src, "w") as f:
            f.write(build(kind, glyph, hue, theme))
        dst = os.path.join(OUT[kind], f"{name}.png")
        w, h = OUT_SIZE.get(kind, (SIZE, SIZE))
        subprocess.run(["rsvg-convert", "-w", str(w), "-h", str(h), "-o", dst, src], check=True)
        print(dst)


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else THEME)
