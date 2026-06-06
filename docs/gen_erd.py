"""Generate a clean Chen-notation ER diagram (Graphviz) for SARO that matches the
teal-entity / oval-attribute / yellow-diamond reference style.

Every node is positioned deterministically (no spring layout), then rendered with
`neato -n2` (use coordinates as-is). Entities sit on a hand-tuned layout; each
entity's attributes fan out on its OUTWARD side; relationship diamonds sit at the
midpoint between the two entities they connect.

Run:  python docs/gen_erd.py   ->  docs/saro-erd.dot + docs/saro-erd.png
"""
import math
import os
import shutil
import subprocess

# ---- palette (matches the reference example) ----
ENTITY = "#34a8a8"
ATTR = "#efe9da"
REL = "#f5c23e"
EDGE = "#5b6b7b"
BG = "#dbeafe"

entities = {
    "User": ["id*", "username", "email", "password", "first_name", "last_name",
             "role", "phone", "preferred_language", "is_active", "date_joined"],
    "Branch": ["id*", "name", "name_ar", "city", "district", "is_active", "created_at"],
    "Address": ["id*", "label", "city", "district", "street", "national_address",
                "notes", "is_default", "created_at"],
    "Locker": ["id*", "name", "city", "district", "location", "total_slots",
               "available_slots", "status", "created_at"],
    "Order": ["id*", "delivery_method", "status", "priority", "package_description",
              "delivery_instructions", "pickup_code", "is_delayed", "scheduled_time",
              "created_at", "updated_at"],
    "OrderStatusLog": ["id*", "status", "note", "created_at"],
    "Rating": ["id*", "stars", "comment", "created_at"],
    "Plan": ["id*", "name", "name_ar", "price", "period", "features", "is_active"],
    "Subscription": ["id*", "status", "start_date", "end_date"],
    "Payment": ["id*", "amount", "method", "status", "created_at"],
    "Conversation": ["id*", "created_at"],
    "Message": ["id*", "body", "is_read", "created_at"],
    "Notification": ["id*", "type", "title", "body", "is_read", "created_at"],
    "AIRecommendation": ["id*", "score", "reason", "accepted", "created_at"],
}

# entity layout (grid units). Two hubs (User, Order) sit close in the centre with
# their shared relationships stacked between them; all other entities ring the outside.
positions = {
    "User": (-4, 0),
    "Order": (4, 0),
    # shared between the two hubs -> stacked along the centre line (short links)
    "OrderStatusLog": (0, 6.5),
    "AIRecommendation": (0, 3),
    "Payment": (0, -3),
    # outer ring (placed on the side of the hub they mostly belong to)
    "Conversation": (8, 7),
    "Branch": (0, 11),
    "Message": (-9, 7),
    "Notification": (-13, 1),
    "Subscription": (-10, -7),
    "Plan": (-15, -10),
    "Address": (13, 4),
    "Rating": (13, 8),
    "Locker": (10, -7),
}

# (label, entityA, cardA, entityB, cardB)
rels = [
    ("Has", "User", "1", "Address", "N"),
    ("Places", "User", "1", "Order", "N"),
    ("Delivers", "User", "1", "Order", "N"),
    ("Supervises", "User", "1", "Branch", "N"),
    ("Hosts", "Branch", "1", "Locker", "N"),
    ("Handles", "Branch", "1", "Order", "N"),
    ("Delivered To", "Address", "1", "Order", "N"),
    ("Uses Locker", "Locker", "1", "Order", "N"),
    ("Logs", "Order", "1", "OrderStatusLog", "N"),
    ("Logged By", "User", "1", "OrderStatusLog", "N"),
    ("Rates", "Order", "1", "Rating", "1"),
    ("Subscribes", "User", "1", "Subscription", "N"),
    ("Defines", "Plan", "1", "Subscription", "N"),
    ("Pays", "User", "1", "Payment", "N"),
    ("Bills Order", "Order", "1", "Payment", "N"),
    ("Bills Sub", "Subscription", "1", "Payment", "N"),
    ("Discussed In", "Order", "1", "Conversation", "N"),
    ("Contains", "Conversation", "1", "Message", "N"),
    ("Sends", "User", "1", "Message", "N"),
    ("Receives", "User", "1", "Notification", "N"),
    ("Recommends", "Order", "1", "AIRecommendation", "N"),
    ("Rec Driver", "User", "1", "AIRecommendation", "N"),
]

SCALE = 95  # grid unit -> points

# centre of mass (to decide each entity's "outward" direction)
cx = sum(p[0] for p in positions.values()) / len(positions)
cy = sum(p[1] for p in positions.values()) / len(positions)


def pt(x, y):
    return f'{x * SCALE:.0f},{y * SCALE:.0f}!'


def build_dot():
    L = ['graph SARO_ERD {']
    L.append(f'  bgcolor="{BG}"; fontname="Helvetica"; node [fontname="Helvetica"];')
    L.append(f'  edge [color="{EDGE}", penwidth=1.0];')

    # entities
    for ent, (x, y) in positions.items():
        L.append(f'  "{ent}" [shape=box, style="filled,bold", fillcolor="{ENTITY}", '
                 f'fontcolor="#06303a", fontsize=19, margin="0.30,0.18", penwidth=1.8, '
                 f'pos="{pt(x, y)}"];')

    # attributes fanned on the entity's outward side
    for ent, attrs in entities.items():
        ex, ey = positions[ent]
        out = math.atan2(ey - cy, ex - cx)  # outward angle
        k = len(attrs)
        span = math.radians(250)
        radius = max(2.0, 0.95 * k / span * math.pi + 1.4)
        start = out - span / 2
        step = span / max(1, k - 1)
        for i, a in enumerate(attrs):
            key = a.endswith("*")
            name = a[:-1] if key else a
            ang = start + i * step
            ax = ex + radius * math.cos(ang)
            ay = ey + radius * math.sin(ang)
            nid = f"{ent}__{name}"
            label = f"<<u>{name}</u>>" if key else f'"{name}"'
            L.append(f'  "{nid}" [shape=ellipse, style=filled, fillcolor="{ATTR}", '
                     f'fontsize=12, penwidth=0.8, margin="0.05,0.03", '
                     f'label={label}, pos="{pt(ax, ay)}"];')
            L.append(f'  "{ent}" -- "{nid}";')

    # relationship diamonds at midpoints (offset duplicates between same pair)
    seen = {}
    for i, (lbl, a, ca, b, cb) in enumerate(rels):
        ax, ay = positions[a]
        bx, by = positions[b]
        mx, my = (ax + bx) / 2, (ay + by) / 2
        pair = tuple(sorted((a, b)))
        n = seen.get(pair, 0)
        seen[pair] = n + 1
        if n:  # offset perpendicular for a 2nd relationship between same pair
            dx, dy = bx - ax, by - ay
            d = math.hypot(dx, dy) or 1
            mx += -dy / d * 1.6 * n
            my += dx / d * 1.6 * n
        rid = f"REL_{i}"
        L.append(f'  "{rid}" [shape=diamond, style="filled,bold", fillcolor="{REL}", '
                 f'fontcolor="#5a3d00", fontsize=12, margin="0.06,0.0", '
                 f'label="{lbl}", pos="{pt(mx, my)}"];')
        L.append(f'  "{a}" -- "{rid}" [label="{ca}", fontsize=11, fontcolor="#33414f"];')
        L.append(f'  "{rid}" -- "{b}" [label="{cb}", fontsize=11, fontcolor="#33414f"];')

    L.append('}')
    return "\n".join(L)


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    dot_path = os.path.join(here, "saro-erd.dot")
    png_path = os.path.join(here, "saro-erd.png")
    with open(dot_path, "w", encoding="utf-8") as f:
        f.write(build_dot())
    print("wrote", dot_path)
    dot = shutil.which("dot") or r"C:\Program Files\Graphviz\bin\dot.exe"
    # -Kneato -n2 : use the coordinates we set, just route edges & render
    subprocess.run([dot, "-Kneato", "-n2", "-Tpng", "-Gdpi=120", dot_path, "-o", png_path],
                   check=True)
    print("rendered", png_path)


if __name__ == "__main__":
    main()
