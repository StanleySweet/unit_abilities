"""Generate Superfighter ability/status icons as SVG, then render 128x128 PNGs with rsvg-convert.

Usage: python3 source/icons/generate.py   (from the mod root)
"""
import os
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SVG_DIR = os.path.join(ROOT, "source", "icons", "svg")
OUT = {
    "ability": os.path.join(ROOT, "art", "textures", "ui", "session", "portraits", "abilities"),
    "status": os.path.join(ROOT, "art", "textures", "ui", "session", "icons", "status_effects"),
}
SIZE = 128  # power of two, matches existing icons

# (background, dark, light) per icon, same flat two-tone look as war_drum.png / snare_trap.png
PALETTES = {
    "gold": ("#e2b95a", "#24456b", "#f6e3a1"),
    "red": ("#b8453a", "#3a1512", "#f2c4a8"),
    "blue": ("#3f6fa8", "#152a44", "#cfe3f7"),
    "violet": ("#6b4fa0", "#21163a", "#e3d6ff"),
    "green": ("#2f5a3c", "#0f2417", "#9fe0a8"),
    "steel": ("#5d6670", "#1d2227", "#dfe5ea"),
    "brown": ("#7a5534", "#2a1a0c", "#f0d2a6"),
    "teal": ("#2c6d6a", "#0e2726", "#bdf0e8"),
}

GLYPHS = {
    # spin: three arcs with arrowheads around a blade
    "circular_attack": lambda d, l: f"""
<g fill="none" stroke="{l}" stroke-width="8" stroke-linecap="round">
  <path d="M64 26 A38 38 0 0 1 97 45"/><path d="M97 83 A38 38 0 0 1 64 102"/><path d="M31 83 A38 38 0 0 1 31 45"/>
</g>
<g fill="{l}"><path d="M104 40 L99 58 L88 44 Z"/><path d="M58 108 L54 92 L70 96 Z"/><path d="M24 56 L40 50 L34 66 Z"/></g>
<path d="M64 40 L70 76 L64 86 L58 76 Z" fill="{d}"/><rect x="54" y="84" width="20" height="6" rx="2" fill="{d}"/>""",
    # shield with rising chevrons
    "aura_of_war": lambda d, l: f"""
<path d="M64 24 L98 36 V62 C98 84 82 98 64 106 C46 98 30 84 30 62 V36 Z" fill="{d}"/>
<g fill="none" stroke="{l}" stroke-width="9" stroke-linejoin="round" stroke-linecap="round">
  <path d="M46 70 L64 54 L82 70"/><path d="M46 88 L64 72 L82 88"/>
</g>""",
    "lightning_strike": lambda d, l: f"""
<path d="M72 18 L38 70 H60 L50 110 L92 52 H68 L80 18 Z" fill="{l}" stroke="{d}" stroke-width="5" stroke-linejoin="round"/>""",
    # halo above a shield
    "bless": lambda d, l: f"""
<ellipse cx="64" cy="32" rx="26" ry="9" fill="none" stroke="{l}" stroke-width="7"/>
<path d="M64 48 L92 58 V76 C92 92 80 102 64 108 C48 102 36 92 36 76 V58 Z" fill="{d}"/>
<path d="M64 62 L68 74 L80 74 L70 82 L74 94 L64 86 L54 94 L58 82 L48 74 L60 74 Z" fill="{l}"/>""",
    # large shield sheltering three units
    "protect_units": lambda d, l: f"""
<path d="M64 20 L104 34 V58 C104 84 86 100 64 108 C42 100 24 84 24 58 V34 Z" fill="{d}"/>
<g fill="{l}"><circle cx="64" cy="54" r="9"/><circle cx="46" cy="72" r="8"/><circle cx="82" cy="72" r="8"/>
<rect x="56" y="64" width="16" height="22" rx="7"/><rect x="39" y="80" width="14" height="16" rx="6"/><rect x="75" y="80" width="14" height="16" rx="6"/></g>""",
    # cloud with dripping drops
    "poison_cloud": lambda d, l: f"""
<path d="M36 72 C22 72 22 52 36 52 C36 36 58 32 64 44 C72 30 96 36 92 54 C106 54 106 72 92 72 Z" fill="{l}" stroke="{d}" stroke-width="5"/>
<g fill="{l}" stroke="{d}" stroke-width="4">
  <path d="M44 82 C44 82 36 94 44 98 C52 94 44 82 44 82 Z"/><path d="M64 84 C64 84 56 98 64 102 C72 98 64 84 64 84 Z"/><path d="M84 82 C84 82 76 94 84 98 C92 94 84 82 84 82 Z"/>
</g>""",
    # four-point throwing star with hole
    "shuriken": lambda d, l: f"""
<path d="M64 18 L74 54 L110 64 L74 74 L64 110 L54 74 L18 64 L54 54 Z" fill="{l}" stroke="{d}" stroke-width="5" stroke-linejoin="round"/>
<circle cx="64" cy="64" r="9" fill="{d}"/>""",
    # spiked club, diagonal
    "berserk_strike": lambda d, l: f"""
<path d="M34 102 L66 70" stroke="{d}" stroke-width="12" stroke-linecap="round"/>
<g fill="{l}" stroke="{d}" stroke-width="4" stroke-linejoin="round">
  <path d="M60 76 L52 68 L80 32 L96 48 Z"/>
</g>
<g fill="{d}"><path d="M78 30 L84 18 L88 34 Z"/><path d="M98 50 L110 44 L94 40 Z"/><path d="M66 46 L56 38 L70 40 Z"/><path d="M80 64 L86 76 L74 66 Z"/></g>""",
    # stylised wolf head
    "call_wolfs": lambda d, l: f"""
<path d="M34 30 L52 50 H76 L94 30 L92 64 L78 84 L64 104 L50 84 L36 64 Z" fill="{l}" stroke="{d}" stroke-width="5" stroke-linejoin="round"/>
<g fill="{d}"><path d="M48 62 L58 66 L48 70 Z"/><path d="M80 62 L70 66 L80 70 Z"/><path d="M58 90 H70 L64 98 Z"/></g>""",
    # heart with heartbeat line
    "last_stand": lambda d, l: f"""
<path d="M64 104 C30 82 20 62 28 46 C36 30 56 30 64 46 C72 30 92 30 100 46 C108 62 98 82 64 104 Z" fill="{l}" stroke="{d}" stroke-width="5"/>
<path d="M30 66 H50 L56 54 L64 80 L72 60 L78 66 H98" fill="none" stroke="{d}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>""",
    # shouting head in profile with sound waves
    "war_cry": lambda d, l: f"""
<path d="M24 42 C24 28 50 24 56 40 L60 56 L50 60 L58 66 L50 72 L52 90 C40 96 24 88 24 74 Z" fill="{d}"/>
<g fill="none" stroke="{l}" stroke-width="7" stroke-linecap="round">
  <path d="M70 52 A16 16 0 0 1 70 76"/><path d="M82 42 A30 30 0 0 1 82 86"/><path d="M94 32 A44 44 0 0 1 94 96"/>
</g>""",
}

# (name, kind, glyph, palette); a name may exist as both ability and status icon
ICONS = [
    ("circular_attack", "ability", "circular_attack", "red"),
    ("aura_of_war", "ability", "aura_of_war", "gold"),
    ("lightning_strike", "ability", "lightning_strike", "violet"),
    ("bless", "ability", "bless", "blue"),
    ("protect_units", "ability", "protect_units", "steel"),
    ("poison_cloud", "ability", "poison_cloud", "green"),
    ("shuriken", "ability", "shuriken", "steel"),
    ("berserk_strike", "ability", "berserk_strike", "brown"),
    ("call_wolfs", "ability", "call_wolfs", "teal"),
    ("last_stand", "ability", "last_stand", "red"),
    ("war_cry", "ability", "war_cry", "brown"),
    ("aura_of_war_buff", "status", "aura_of_war", "gold"),
    ("bless_buff", "status", "bless", "blue"),
    ("protect_units_buff", "status", "protect_units", "steel"),
    ("poison_cloud", "status", "poison_cloud", "green"),
]


def svg(glyph, palette):
    bg, dark, light = PALETTES[palette]
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{SIZE}" height="{SIZE}" viewBox="0 0 128 128">
<rect x="2" y="2" width="124" height="124" rx="16" fill="{dark}"/>
<rect x="8" y="8" width="112" height="112" rx="11" fill="{bg}"/>
{GLYPHS[glyph](dark, light).strip()}
</svg>
"""


def main():
    os.makedirs(SVG_DIR, exist_ok=True)
    for name, kind, glyph, palette in ICONS:
        src = os.path.join(SVG_DIR, f"{kind}_{name}.svg")
        with open(src, "w") as f:
            f.write(svg(glyph, palette))
        dst = os.path.join(OUT[kind], f"{name}.png")
        subprocess.run(["rsvg-convert", "-w", str(SIZE), "-h", str(SIZE), "-o", dst, src], check=True)
        print(dst)


if __name__ == "__main__":
    main()
