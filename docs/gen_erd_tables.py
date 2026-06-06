"""Generate a clean crow's-foot / table-style ER diagram for SARO (Graphviz `dot`).
Each entity is one tidy box listing its columns (PK bold+underlined, FK italic),
with orthogonal connectors and 1--N crow's-foot ends.

Run:  python docs/gen_erd_tables.py  ->  docs/saro-erd-tables.dot + .png
"""
import os
import shutil
import subprocess

HEAD = "#34a8a8"
BG = "#dbeafe"
EDGE = "#3f5161"

# entity -> list of (column, kind)  kind: "pk" | "fk" | ""
tables = {
    "User": [("id", "pk"), ("username", ""), ("email", ""), ("password", ""),
             ("first_name", ""), ("last_name", ""), ("role", ""), ("phone", ""),
             ("preferred_language", ""), ("is_active", ""), ("date_joined", "")],
    "Branch": [("id", "pk"), ("supervisor_id", "fk"), ("name", ""), ("name_ar", ""),
               ("city", ""), ("district", ""), ("is_active", ""), ("created_at", "")],
    "Address": [("id", "pk"), ("customer_id", "fk"), ("label", ""), ("city", ""),
                ("district", ""), ("street", ""), ("national_address", ""),
                ("notes", ""), ("is_default", ""), ("created_at", "")],
    "Locker": [("id", "pk"), ("branch_id", "fk"), ("name", ""), ("city", ""),
               ("district", ""), ("location", ""), ("total_slots", ""),
               ("available_slots", ""), ("status", ""), ("created_at", "")],
    "Order": [("id", "pk"), ("customer_id", "fk"), ("driver_id", "fk"),
              ("branch_id", "fk"), ("address_id", "fk"), ("locker_id", "fk"),
              ("delivery_method", ""), ("status", ""), ("priority", ""),
              ("package_description", ""), ("delivery_instructions", ""),
              ("pickup_code", ""), ("is_delayed", ""), ("scheduled_time", ""),
              ("created_at", ""), ("updated_at", "")],
    "OrderStatusLog": [("id", "pk"), ("order_id", "fk"), ("by_id", "fk"),
                       ("status", ""), ("note", ""), ("created_at", "")],
    "Rating": [("id", "pk"), ("order_id", "fk"), ("stars", ""), ("comment", ""),
               ("created_at", "")],
    "Plan": [("id", "pk"), ("name", ""), ("name_ar", ""), ("price", ""),
             ("period", ""), ("features", ""), ("is_active", "")],
    "Subscription": [("id", "pk"), ("customer_id", "fk"), ("plan_id", "fk"),
                     ("status", ""), ("start_date", ""), ("end_date", "")],
    "Payment": [("id", "pk"), ("customer_id", "fk"), ("order_id", "fk"),
                ("subscription_id", "fk"), ("amount", ""), ("method", ""),
                ("status", ""), ("created_at", "")],
    "Conversation": [("id", "pk"), ("order_id", "fk"), ("customer_id", "fk"),
                     ("driver_id", "fk"), ("created_at", "")],
    "Message": [("id", "pk"), ("conversation_id", "fk"), ("sender_id", "fk"),
                ("body", ""), ("is_read", ""), ("created_at", "")],
    "Notification": [("id", "pk"), ("user_id", "fk"), ("type", ""), ("title", ""),
                     ("body", ""), ("is_read", ""), ("created_at", "")],
    "AIRecommendation": [("id", "pk"), ("order_id", "fk"),
                         ("recommended_driver_id", "fk"), ("score", ""),
                         ("reason", ""), ("accepted", ""), ("created_at", "")],
}

# (child, fk_column, parent)  -> child has many, parent has one
fks = [
    ("Address", "customer_id", "User"),
    ("Branch", "supervisor_id", "User"),
    ("Order", "customer_id", "User"),
    ("Order", "driver_id", "User"),
    ("Order", "branch_id", "Branch"),
    ("Order", "address_id", "Address"),
    ("Order", "locker_id", "Locker"),
    ("Locker", "branch_id", "Branch"),
    ("OrderStatusLog", "order_id", "Order"),
    ("OrderStatusLog", "by_id", "User"),
    ("Rating", "order_id", "Order"),
    ("Subscription", "customer_id", "User"),
    ("Subscription", "plan_id", "Plan"),
    ("Payment", "customer_id", "User"),
    ("Payment", "order_id", "Order"),
    ("Payment", "subscription_id", "Subscription"),
    ("Conversation", "order_id", "Order"),
    ("Conversation", "customer_id", "User"),
    ("Conversation", "driver_id", "User"),
    ("Message", "conversation_id", "Conversation"),
    ("Message", "sender_id", "User"),
    ("Notification", "user_id", "User"),
    ("AIRecommendation", "order_id", "Order"),
    ("AIRecommendation", "recommended_driver_id", "User"),
]


def row(col, kind):
    if kind == "pk":
        txt = f'<B><U>{col}</U></B>  <FONT POINT-SIZE="9" COLOR="#777">PK</FONT>'
    elif kind == "fk":
        txt = f'<I>{col}</I>  <FONT POINT-SIZE="9" COLOR="#777">FK</FONT>'
    else:
        txt = col
    return (f'<TR><TD ALIGN="LEFT" PORT="{col}" BGCOLOR="white">'
            f'<FONT POINT-SIZE="11">{txt}</FONT></TD></TR>')


def node(name, cols):
    rows = "".join(row(c, k) for c, k in cols)
    return (f'  "{name}" [label=<\n'
            f'    <TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="5">\n'
            f'      <TR><TD BGCOLOR="{HEAD}"><FONT COLOR="white" POINT-SIZE="13">'
            f'<B>{name}</B></FONT></TD></TR>\n'
            f'      {rows}\n'
            f'    </TABLE>>];')


def build_dot():
    L = ["digraph SARO {",
         f'  graph [rankdir=LR, bgcolor="{BG}", nodesep=0.5, ranksep=1.4, splines=ortho, pad=0.4];',
         '  node [shape=plaintext, fontname="Helvetica"];',
         f'  edge [color="{EDGE}", penwidth=1.2, arrowsize=0.9, dir=both, '
         f'arrowhead=crow, arrowtail=tee];']
    for name, cols in tables.items():
        L.append(node(name, cols))
    for child, col, parent in fks:
        L.append(f'  "{child}":{col} -> "{parent}":id;')
    L.append("}")
    return "\n".join(L)


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    dot_path = os.path.join(here, "saro-erd-tables.dot")
    png_path = os.path.join(here, "saro-erd-tables.png")
    with open(dot_path, "w", encoding="utf-8") as f:
        f.write(build_dot())
    print("wrote", dot_path)
    dot = shutil.which("dot") or r"C:\Program Files\Graphviz\bin\dot.exe"
    subprocess.run([dot, "-Tpng", "-Gdpi=120", dot_path, "-o", png_path], check=True)
    print("rendered", png_path)


if __name__ == "__main__":
    main()
