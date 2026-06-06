"""Generate a Chen-notation ER diagram (Graphviz) for SARO that matches the
teal-entity / oval-attribute / yellow-diamond style. Outputs docs/saro-erd.dot
and (if `dot` is available) docs/saro-erd.png.

Run:  python docs/gen_erd.py
"""
import os
import shutil
import subprocess

# ---- palette (matches the reference example) ----
ENTITY = '#34a8a8'      # teal box
ATTR = '#efe9da'        # cream oval
REL = '#f5c23e'         # amber diamond
EDGE = '#5b6b7b'
BG = '#dbeafe'          # light blue background

entities = {
    "User": ["id*", "username", "email", "password", "first_name",
             "last_name", "role", "phone", "preferred_language",
             "is_active", "date_joined"],
    "Branch": ["id*", "name", "name_ar", "city", "district", "is_active", "created_at"],
    "Address": ["id*", "label", "city", "district", "street",
                "national_address", "notes", "is_default", "created_at"],
    "Locker": ["id*", "name", "city", "district", "location",
               "total_slots", "available_slots", "status", "created_at"],
    "Order": ["id*", "delivery_method", "status", "priority", "package_description",
              "delivery_instructions", "pickup_code", "is_delayed",
              "scheduled_time", "created_at", "updated_at"],
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

# (relationship label, entityA, cardA, entityB, cardB)
rels = [
    ("Has", "User", "1", "Address", "N"),
    ("Places", "User", "1", "Order", "N"),
    ("Delivers", "User", "1", "Order", "N"),
    ("Supervises", "User", "1", "Branch", "N"),
    ("Hosts", "Branch", "1", "Locker", "N"),
    ("Handles", "Branch", "1", "Order", "N"),
    ("Delivered_To", "Address", "1", "Order", "N"),
    ("Uses_Locker", "Locker", "1", "Order", "N"),
    ("Logs", "Order", "1", "OrderStatusLog", "N"),
    ("Logged_By", "User", "1", "OrderStatusLog", "N"),
    ("Rates", "Order", "1", "Rating", "1"),
    ("Subscribes", "User", "1", "Subscription", "N"),
    ("Defines", "Plan", "1", "Subscription", "N"),
    ("Pays", "User", "1", "Payment", "N"),
    ("Bills_Order", "Order", "1", "Payment", "N"),
    ("Bills_Sub", "Subscription", "1", "Payment", "N"),
    ("Discussed_In", "Order", "1", "Conversation", "N"),
    ("Contains", "Conversation", "1", "Message", "N"),
    ("Sends", "User", "1", "Message", "N"),
    ("Receives", "User", "1", "Notification", "N"),
    ("Recommends", "Order", "1", "AIRecommendation", "N"),
    ("Rec_Driver", "User", "1", "AIRecommendation", "N"),
]


def esc(s):
    return s.replace('"', '\\"')


def build_dot():
    L = []
    L.append('graph SARO_ERD {')
    L.append('  layout=fdp; overlap=prism; overlap_scaling=-6; sep="+22";')
    L.append('  splines=true; esep="+12"; K=2.0; maxiter=4000;')
    L.append(f'  bgcolor="{BG}"; fontname="Helvetica"; node [fontname="Helvetica"];')
    L.append('  edge [color="%s", penwidth=1.1];' % EDGE)

    # entities
    for ent in entities:
        L.append(f'  "{ent}" [shape=box, style="filled,bold", fillcolor="{ENTITY}", '
                 f'fontcolor="#06303a", fontsize=15, margin="0.22,0.14", penwidth=1.4];')

    # attributes
    for ent, attrs in entities.items():
        for a in attrs:
            key = a.endswith("*")
            name = a[:-1] if key else a
            nid = f'{ent}__{name}'
            label = f'<<u>{name}</u>>' if key else f'"{name}"'
            L.append(f'  "{nid}" [shape=ellipse, style=filled, fillcolor="{ATTR}", '
                     f'fontsize=10, width=0.1, height=0.1, margin="0.04,0.02", '
                     f'penwidth=0.8, label={label}];')
            L.append(f'  "{ent}" -- "{nid}";')

    # relationships (diamonds) with cardinality labels
    for i, (lbl, a, ca, b, cb) in enumerate(rels):
        rid = f'REL_{i}_{lbl}'
        L.append(f'  "{rid}" [shape=diamond, style="filled,bold", fillcolor="{REL}", '
                 f'fontcolor="#5a3d00", fontsize=11, margin="0.05,0.0", '
                 f'label="{lbl.replace("_", " ")}"];')
        L.append(f'  "{a}" -- "{rid}" [label="{ca}", fontsize=10, fontcolor="#334"];')
        L.append(f'  "{rid}" -- "{b}" [label="{cb}", fontsize=10, fontcolor="#334"];')

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
    if os.path.exists(dot) or shutil.which("dot"):
        subprocess.run([dot, "-Tpng", "-Gdpi=130", dot_path, "-o", png_path], check=True)
        print("rendered", png_path)
    else:
        print("dot not found; .dot written only")


if __name__ == "__main__":
    main()
