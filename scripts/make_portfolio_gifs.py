import os
import math
from PIL import Image, ImageDraw, ImageFont

ASSETS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "public", "assets"))
os.makedirs(ASSETS_DIR, exist_ok=True)

# Fonts
font_code = ImageFont.truetype("/System/Library/Fonts/Menlo.ttc", 18)
font_code_sm = ImageFont.truetype("/System/Library/Fonts/Menlo.ttc", 13)
font_code_xs = ImageFont.truetype("/System/Library/Fonts/Menlo.ttc", 11)
font_head = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 22)
font_head_sm = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 16)
font_bold = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 20)

W, H = 800, 450

def make_microservices_gif():
    frames = []
    total_frames = 24
    for f in range(total_frames):
        img = Image.new("RGB", (W, H), (9, 12, 16))
        draw = ImageDraw.Draw(img)
        t = f / total_frames

        # Grid lines
        for x in range(0, W, 40):
            draw.line([(x, 0), (x, H)], fill=(16, 22, 30), width=1)
        for y in range(0, H, 40):
            draw.line([(0, y), (W, y)], fill=(16, 22, 30), width=1)

        # Header bar
        draw.rectangle([(20, 16), (W - 20, 60)], fill=(16, 21, 29), outline=(34, 211, 238), width=1)
        draw.text((36, 28), "MICROSERVICES ARCHITECTURE // SPRING BOOT & CLOUD GATEWAY", fill=(34, 211, 238), font=font_code_sm)
        # Pulse dot
        pulse_c = int(180 + 75 * math.sin(t * math.pi * 2))
        draw.ellipse([(W - 55, 31), (W - 41, 45)], fill=(0, pulse_c, 160))

        # Nodes: Client, Gateway, Auth, Orders, Database
        nodes = [
            ("Client App (React)", 70, 180, (0, 214, 160)),
            ("API Gateway (Spring)", 260, 180, (34, 211, 238)),
            ("Auth Service (JWT)", 470, 120, (192, 132, 252)),
            ("Order Service", 470, 240, (255, 159, 69)),
            ("PostgreSQL & Redis", 650, 180, (0, 214, 160))
        ]

        # Draw connection traces
        draw.line([(190, 205), (260, 205)], fill=(40, 50, 65), width=2)
        draw.line([(380, 205), (470, 145)], fill=(40, 50, 65), width=2)
        draw.line([(380, 205), (470, 265)], fill=(40, 50, 65), width=2)
        draw.line([(570, 145), (650, 205)], fill=(40, 50, 65), width=2)
        draw.line([(570, 265), (650, 205)], fill=(40, 50, 65), width=2)

        # Animated packet dots
        def draw_packet(p1, p2, offset):
            pos = (t + offset) % 1.0
            px = p1[0] + (p2[0] - p1[0]) * pos
            py = p1[1] + (p2[1] - p1[1]) * pos
            draw.ellipse([(px - 4, py - 4), (px + 4, py + 4)], fill=(0, 255, 200), outline=(255, 255, 255))

        draw_packet((190, 205), (260, 205), 0.0)
        draw_packet((190, 205), (260, 205), 0.5)
        draw_packet((380, 205), (470, 145), 0.2)
        draw_packet((380, 205), (470, 265), 0.4)
        draw_packet((570, 145), (650, 205), 0.6)
        draw_packet((570, 265), (650, 205), 0.8)

        # Draw Node Boxes
        for label, nx, ny, col in nodes:
            nw, nh = 130, 50
            draw.rectangle([(nx, ny), (nx + nw, ny + nh)], fill=(16, 21, 29), outline=col, width=2)
            draw.text((nx + 10, ny + 16), label, fill=(240, 246, 252), font=font_code_xs)

        # Live telemetry console at bottom
        draw.rectangle([(20, 340), (W - 20, 425)], fill=(14, 18, 25), outline=(40, 50, 65), width=1)
        req_count = 4280 + int(340 * math.sin(t * math.pi * 2))
        lat = 12 + int(4 * math.cos(t * math.pi * 2))
        draw.text((36, 352), f"> STATUS: ALL 5 SERVICES OPERATIONAL | THROUGHPUT: {req_count} req/sec | P99: {lat}ms", fill=(0, 214, 160), font=font_code_xs)
        draw.text((36, 375), f"> DISCOVERY: Eureka / Consumed JWT Auth Filter Active | Auto-Scaling: OK", fill=(142, 154, 170), font=font_code_xs)
        draw.text((36, 398), f"> POSTGRES POOL: 32 ACTIVE / 0 WAIT | REDIS HIT RATIO: 98.4%", fill=(34, 211, 238), font=font_code_xs)

        frames.append(img)

    out_path = os.path.join(ASSETS_DIR, "series-microservices.gif")
    frames[0].save(out_path, save_all=True, append_images=frames[1:], optimize=True, duration=90, loop=0)
    print("Created", out_path)

def make_railway_gif():
    frames = []
    total_frames = 24
    stations = ["Colombo", "Panadura", "Kalutara", "Galle", "Matara"]
    for f in range(total_frames):
        img = Image.new("RGB", (W, H), (9, 12, 16))
        draw = ImageDraw.Draw(img)
        t = f / total_frames

        # Grid background
        for x in range(0, W, 40):
            draw.line([(x, 0), (x, H)], fill=(16, 22, 30), width=1)
        for y in range(0, H, 40):
            draw.line([(0, y), (W, y)], fill=(16, 22, 30), width=1)

        # Header
        draw.rectangle([(20, 16), (W - 20, 60)], fill=(16, 21, 29), outline=(255, 159, 69), width=1)
        draw.text((36, 28), "RAILWAY INTERVAL SEAT ALLOCATION // POSTGRESQL ALGORITHM", fill=(255, 159, 69), font=font_code_sm)
        draw.text((W - 140, 28), "STATUS: LIVE", fill=(0, 214, 160), font=font_code_sm)

        # Station Timeline Track
        track_y = 120
        draw.line([(80, track_y), (W - 80, track_y)], fill=(89, 98, 111), width=3)
        station_xs = []
        for i, st in enumerate(stations):
            sx = 80 + i * ((W - 160) // (len(stations) - 1))
            station_xs.append(sx)
            draw.ellipse([(sx - 7, track_y - 7), (sx + 7, track_y + 7)], fill=(255, 159, 69), outline=(255, 255, 255))
            draw.text((sx - 26, track_y + 14), st, fill=(237, 239, 243), font=font_code_xs)

        # Train Motion Along Track
        train_x = station_xs[0] + (station_xs[-1] - station_xs[0]) * ((t * 1.5) % 1.0)
        draw.rectangle([(train_x - 14, track_y - 10), (train_x + 14, track_y + 10)], fill=(0, 214, 160), outline=(255, 255, 255))

        # Seat Allocation Matrix
        draw.text((36, 175), "SEAT MATRIX INTERVALS (Non-overlapping segment sharing):", fill=(142, 154, 170), font=font_code_xs)
        matrix_y = 200
        seats = [
            ("Seat 01A", [(0, 2, "BOOKED (Colombo-Kalutara)"), (2, 4, "AVAILABLE")]),
            ("Seat 01B", [(0, 1, "AVAILABLE"), (1, 3, "BOOKED (Panadura-Galle)"), (3, 4, "AVAILABLE")]),
            ("Seat 02A", [(0, 4, "BOOKED (Colombo-Matara Express)")]),
            ("Seat 02B", [(0, 3, "AVAILABLE"), (3, 4, "BOOKED (Galle-Matara)")])
        ]

        active_idx = int(t * len(seats)) % len(seats)

        for si, (sname, intervals) in enumerate(seats):
            sy = matrix_y + si * 32
            draw.text((36, sy + 4), sname, fill=(200, 210, 220), font=font_code_xs)
            bar_start = 120
            bar_w = W - 160
            for start_s, end_s, status in intervals:
                bx1 = bar_start + int((start_s / 4.0) * bar_w)
                bx2 = bar_start + int((end_s / 4.0) * bar_w)
                if "BOOKED" in status:
                    fill_col = (255, 100, 80) if si != active_idx else (255, 150, 50)
                else:
                    fill_col = (0, 180, 130)
                draw.rectangle([(bx1, sy), (bx2 - 4, sy + 22)], fill=fill_col, outline=(30, 40, 50))

        # Console Output
        draw.rectangle([(20, 350), (W - 20, 425)], fill=(14, 18, 25), outline=(40, 50, 65), width=1)
        cur_station = stations[int(t * len(stations)) % len(stations)]
        draw.text((36, 362), f"> QUERY: SELECT * FROM seat_segments WHERE NOT (end_st <= 1 OR start_st >= 3);", fill=(34, 211, 238), font=font_code_xs)
        draw.text((36, 385), f"> RESULT: Zero interval conflict detected. Station at: {cur_station} -> SEAT RESERVED.", fill=(0, 214, 160), font=font_code_xs)

        frames.append(img)

    out_path = os.path.join(ASSETS_DIR, "series-railway.gif")
    frames[0].save(out_path, save_all=True, append_images=frames[1:], optimize=True, duration=90, loop=0)
    print("Created", out_path)

def make_vps_gif():
    frames = []
    total_frames = 24
    for f in range(total_frames):
        img = Image.new("RGB", (W, H), (10, 14, 20))
        draw = ImageDraw.Draw(img)
        t = f / total_frames

        # Terminal Window
        draw.rectangle([(20, 20), (W - 20, H - 20)], fill=(15, 20, 28), outline=(34, 211, 238), width=1)

        # Title bar
        draw.rectangle([(20, 20), (W - 20, 54)], fill=(22, 29, 39))
        draw.ellipse([(34, 32), (46, 44)], fill=(255, 95, 87)) # red
        draw.ellipse([(52, 32), (64, 44)], fill=(254, 188, 46)) # yellow
        draw.ellipse([(70, 32), (82, 44)], fill=(40, 200, 64)) # green
        draw.text((110, 28), "kaif@linux-vps-cloud: ~ / docker-compose (aaPanel + Nginx)", fill=(160, 175, 190), font=font_code_sm)

        # Bash prompt & output
        cursor = "_" if (f % 6 < 3) else " "
        draw.text((38, 70), "kaif@vps:~$ docker compose ps -a", fill=(0, 214, 160), font=font_code_sm)

        containers = [
            ("kz-nginx-proxy",   "nginx:alpine",       "Up (healthy)", "0.0.0.0:80->80, 443->443/tcp", (0, 214, 160)),
            ("kz-spring-api",    "kz/backend:3.2",     "Up (healthy)", "0.0.0.0:8080->8080/tcp",       (0, 214, 160)),
            ("kz-postgres-db",   "postgres:16-alpine", "Up (healthy)", "5432/tcp (internal)",           (0, 214, 160)),
            ("kz-redis-cache",   "redis:7-alpine",     "Up (healthy)", "6379/tcp (internal)",           (0, 214, 160)),
            ("kz-aapanel-daemon","aaPanel:v7",         "Up (daemon)",  "8888/tcp (ssl)",                (34, 211, 238))
        ]

        draw.text((38, 105), "CONTAINER ID   NAME               STATUS          PORTS", fill=(100, 115, 130), font=font_code_xs)
        draw.line([(38, 122), (W - 38, 122)], fill=(40, 50, 65), width=1)

        for ci, (cname, cimg, cstat, cports, col) in enumerate(containers):
            cy = 135 + ci * 28
            cid = f"a9{ci}4f{ci*2}e"
            draw.text((38, cy), f"{cid}      {cname:<18} {cstat:<15} {cports}", fill=col, font=font_code_xs)

        # Live telemetry box
        box_y = 290
        draw.rectangle([(38, box_y), (W - 38, H - 40)], fill=(12, 16, 23), outline=(40, 50, 65), width=1)
        cpu_load = 12.4 + 4.2 * math.sin(t * math.pi * 2)
        mem_used = 1.34 + 0.08 * math.cos(t * math.pi * 2)
        draw.text((54, box_y + 14), f"SYSTEM TELEMETRY: CPU: {cpu_load:.1f}% | MEMORY: {mem_used:.2f}GB / 4.0GB | SWAP: 0.1GB", fill=(34, 211, 238), font=font_code_xs)
        draw.text((54, box_y + 36), f"NETWORK TRAFFIC: RX 1.28 MB/s | TX 3.42 MB/s | SSL CERT: Let's Encrypt (Auto-Renew: OK)", fill=(0, 214, 160), font=font_code_xs)
        draw.text((54, box_y + 58), f"kaif@vps:~$ tail -f /var/log/nginx/access.log | grep 200{cursor}", fill=(255, 255, 255), font=font_code_xs)

        frames.append(img)

    out_path = os.path.join(ASSETS_DIR, "series-vps.gif")
    frames[0].save(out_path, save_all=True, append_images=frames[1:], optimize=True, duration=90, loop=0)
    print("Created", out_path)

def make_mobile_gif():
    frames = []
    total_frames = 24
    for f in range(total_frames):
        img = Image.new("RGB", (W, H), (9, 12, 16))
        draw = ImageDraw.Draw(img)
        t = f / total_frames

        # Grid lines
        for x in range(0, W, 40):
            draw.line([(x, 0), (x, H)], fill=(16, 22, 30), width=1)
        for y in range(0, H, 40):
            draw.line([(0, y), (W, y)], fill=(16, 22, 30), width=1)

        # Left: Mobile Phone Frame
        phone_x, phone_y, pw, ph = 80, 30, 220, 390
        draw.rectangle([(phone_x, phone_y), (phone_x + pw, phone_y + ph)], fill=(14, 18, 25), outline=(0, 214, 160), width=2)
        # Notch
        draw.rectangle([(phone_x + 60, phone_y + 8), (phone_x + 160, phone_y + 22)], fill=(9, 12, 16), outline=(40, 50, 65))
        draw.text((phone_x + 20, phone_y + 36), "TaskWize AI", fill=(0, 214, 160), font=font_code_sm)

        tasks = [
            ("Deploy Spring Boot API", True),
            ("Setup Redis Cache Node", True),
            ("Configure Firestore Sync", f > 12),
            ("Push Flutter/React App", False)
        ]

        for ti, (task_txt, done) in enumerate(tasks):
            ty = phone_y + 75 + ti * 55
            draw.rectangle([(phone_x + 15, ty), (phone_x + pw - 15, ty + 44)], fill=(20, 26, 36), outline=(40, 50, 65))
            chk_col = (0, 214, 160) if done else (80, 90, 100)
            draw.rectangle([(phone_x + 24, ty + 14), (phone_x + 40, ty + 30)], fill=chk_col)
            draw.text((phone_x + 48, ty + 14), task_txt[:18], fill=(240, 246, 252), font=font_code_xs)

        # Right: Cloud Sync Architecture Flow
        draw.text((340, 45), "TASKWIZE AI // REALTIME FIRESTORE & GEMINI AI", fill=(34, 211, 238), font=font_code_sm)
        draw.line([(340, 75), (W - 40, 75)], fill=(40, 50, 65), width=1)

        # Connection line with animated waves
        draw.line([(phone_x + pw, 180), (450, 180)], fill=(0, 214, 160), width=2)
        wave_pos = (t * 40) % 40
        for wx in range(phone_x + pw + 20, 430, 30):
            draw.ellipse([(wx + wave_pos - 3, 177), (wx + wave_pos + 3, 183)], fill=(255, 255, 255))

        # Cloud box
        draw.rectangle([(450, 120), (740, 240)], fill=(16, 21, 29), outline=(34, 211, 238), width=2)
        draw.text((470, 140), "Google Cloud Firestore", fill=(0, 214, 160), font=font_code_sm)
        draw.text((470, 170), "> Bidirectional WebSocket: ONLINE", fill=(200, 210, 220), font=font_code_xs)
        draw.text((470, 195), "> Sync Latency: 18ms | Offline Cache: ACTIVE", fill=(140, 150, 165), font=font_code_xs)

        # Gemini AI Decomposition Box
        draw.rectangle([(340, 270), (740, 390)], fill=(16, 21, 29), outline=(192, 132, 252), width=1)
        draw.text((360, 285), "Gemini AI Task Intelligence", fill=(192, 132, 252), font=font_code_sm)
        draw.text((360, 315), "> Prompt: 'Breakdown Microservices Architecture Sprint'", fill=(200, 210, 220), font=font_code_xs)
        ai_dots = "." * (int(t * 4) % 4 + 1)
        draw.text((360, 345), f"> Generating 14 subtasks with dependencies{ai_dots}", fill=(0, 214, 160), font=font_code_xs)

        frames.append(img)

    out_path = os.path.join(ASSETS_DIR, "series-mobile.gif")
    frames[0].save(out_path, save_all=True, append_images=frames[1:], optimize=True, duration=90, loop=0)
    print("Created", out_path)

def make_about_developer_gif():
    frames = []
    total_frames = 24
    for f in range(total_frames):
        img = Image.new("RGB", (500, 500), (9, 12, 16))
        draw = ImageDraw.Draw(img)
        t = f / total_frames

        # Ambient radial glow
        cx, cy = 250, 250
        for r in range(220, 40, -30):
            alpha = int(18 * (1 - r / 220.0))
            draw.ellipse([(cx - r, cy - r), (cx + r, cy + r)], fill=(12, 16 + alpha, 22 + alpha * 2))

        # Cyber Terminal Card
        draw.rectangle([(25, 25), (475, 475)], fill=(15, 20, 28), outline=(0, 214, 160), width=2)

        # Terminal Header
        draw.rectangle([(25, 25), (475, 65)], fill=(22, 29, 39))
        draw.ellipse([(42, 40), (54, 52)], fill=(255, 95, 87))
        draw.ellipse([(60, 40), (72, 52)], fill=(254, 188, 46))
        draw.ellipse([(78, 40), (90, 52)], fill=(40, 200, 64))
        draw.text((120, 37), "kaif-zaki@portfolio: ~ (Full Stack)", fill=(160, 175, 190), font=font_code_sm)

        # Radar scanner line
        scan_y = int(70 + (470 - 70) * t)
        draw.line([(26, scan_y), (474, scan_y)], fill=(0, 214, 160), width=1)

        # Developer ASCII Card
        draw.text((45, 80),  "KAIF ZAKI // ASSOCIATE SOFTWARE ENGINEER", fill=(34, 211, 238), font=font_code_sm)
        draw.line([(45, 105), (455, 105)], fill=(40, 50, 65), width=1)

        info = [
            ("Target Roles", "Full Stack / Backend Engineer"),
            ("Specialization", "Spring Boot & Microservices"),
            ("Languages", "Java, TypeScript, Python, SQL"),
            ("Frameworks", "React, Node.js, Spring Boot"),
            ("Databases", "PostgreSQL, MySQL, MongoDB"),
            ("Cloud & DevOps", "Docker, Linux VPS, aaPanel"),
            ("Location", "Jaffna / Panadura, Sri Lanka"),
            ("Status", "AVAILABLE FOR HIRE (Immediate)")
        ]

        for idx, (k, v) in enumerate(info):
            iy = 120 + idx * 36
            draw.text((45, iy), f"{k:<15}:", fill=(130, 145, 160), font=font_code_xs)
            val_col = (0, 214, 160) if k == "Status" else ((255, 159, 69) if k == "Specialization" else (240, 246, 252))
            draw.text((180, iy), v, fill=val_col, font=font_code_xs)

        # Bottom ticker
        cursor = "▮" if (f % 6 < 3) else " "
        draw.rectangle([(45, 415), (455, 455)], fill=(10, 14, 20), outline=(0, 214, 160), width=1)
        draw.text((58, 427), f"kz@terminal: Ready for production {cursor}", fill=(0, 214, 160), font=font_code_xs)

        frames.append(img)

    out_path = os.path.join(ASSETS_DIR, "about-developer.gif")
    frames[0].save(out_path, save_all=True, append_images=frames[1:], optimize=True, duration=90, loop=0)
    print("Created", out_path)

def make_hero_visual_gif():
    frames = []
    total_frames = 24
    for f in range(total_frames):
        img = Image.new("RGB", (640, 360), (9, 12, 16))
        draw = ImageDraw.Draw(img)
        t = f / total_frames

        # Grid lines
        for x in range(0, 640, 40):
            draw.line([(x, 0), (x, 360)], fill=(16, 22, 30), width=1)
        for y in range(0, 360, 40):
            draw.line([(0, y), (640, y)], fill=(16, 22, 30), width=1)

        cx, cy = 320, 180

        # Rotating cyber rings
        for ring_idx, (r, base_col) in enumerate([(130, (0, 214, 160)), (90, (34, 211, 238)), (50, (255, 159, 69))]):
            angle_offset = t * math.pi * 2 * (1 if ring_idx % 2 == 0 else -1)
            for seg in range(6):
                a1 = math.degrees(angle_offset + seg * (math.pi / 3))
                a2 = a1 + 35
                draw.arc([(cx - r, cy - r), (cx + r, cy + r)], start=a1, end=a2, fill=base_col, width=2)

        # Center core badge
        core_r = 38
        draw.ellipse([(cx - core_r, cy - core_r), (cx + core_r, cy + core_r)], fill=(16, 21, 29), outline=(0, 214, 160), width=2)
        draw.text((cx - 16, cy - 12), "KZ", fill=(255, 255, 255), font=font_bold)

        # 4 satellite telemetry nodes
        sats = [
            ("SPRING BOOT", cx - 180, cy - 80, (0, 214, 160)),
            ("REACT / TS", cx + 180, cy - 80, (34, 211, 238)),
            ("POSTGRESQL", cx - 180, cy + 80, (255, 159, 69)),
            ("DOCKER / VPS", cx + 180, cy + 80, (192, 132, 252))
        ]

        for sname, sx, sy, scol in sats:
            # line to center
            draw.line([(sx, sy), (cx, cy)], fill=(30, 40, 52), width=1)
            # animated pulse dot
            px = sx + (cx - sx) * ((t + 0.25) % 1.0)
            py = sy + (cy - sy) * ((t + 0.25) % 1.0)
            draw.ellipse([(px - 3, py - 3), (px + 3, py + 3)], fill=scol)

            # Node pill
            draw.rectangle([(sx - 65, sy - 18), (sx + 65, sy + 18)], fill=(16, 21, 29), outline=scol, width=1)
            draw.text((sx - 52, sy - 7), sname, fill=(240, 246, 252), font=font_code_xs)

        frames.append(img)

    out_path = os.path.join(ASSETS_DIR, "hero-visual.gif")
    frames[0].save(out_path, save_all=True, append_images=frames[1:], optimize=True, duration=90, loop=0)
    print("Created", out_path)

if __name__ == "__main__":
    make_microservices_gif()
    make_railway_gif()
    make_vps_gif()
    make_mobile_gif()
    make_about_developer_gif()
    make_hero_visual_gif()
    print("ALL GIFS GENERATED SUCCESSFULLY!")
