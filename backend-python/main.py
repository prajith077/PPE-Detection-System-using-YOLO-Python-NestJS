from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import cv2
from ultralytics import YOLO

app = FastAPI()

# ✅ Enable CORS (important for frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Load your real PPE model
model = YOLO("models/ppe.pt")

# 👉 Check class names (important for debugging)
print("MODEL CLASSES:", model.names)

# Default video
current_video = "../backend-nest/videos/cam1.mp4"

# Stats
stats = {
    "people": 0,
    "helmet": 0,
    "noHelmet": 0
}


# 🔁 Change video
@app.get("/set-video")
def set_video(name: str):
    global current_video
    current_video = f"../backend-nest/videos/{name}"
    print("Switched to:", current_video)
    return {"status": "ok"}


# 📊 Get stats
@app.get("/stats")
def get_stats():
    return stats


# 🎥 Video stream generator
def generate():
    global current_video, stats

    cap = None
    last_video = None

    while True:

        # 🔄 Reload video if changed
        if current_video != last_video:
            if cap:
                cap.release()

            cap = cv2.VideoCapture(current_video)
            last_video = current_video
            print("Now playing:", current_video)

        success, frame = cap.read()

        if not success:
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            continue

        # Reset stats
        stats = {"people": 0, "helmet": 0, "noHelmet": 0}

        results = model(frame, conf=0.3)

        for r in results:
            people = []
            helmets = []

            # 🔍 Collect detections
            for box in r.boxes:
                cls = int(box.cls[0])
                label = model.names[cls]

                x1, y1, x2, y2 = map(int, box.xyxy[0])

                if label == "person":
                    people.append((x1, y1, x2, y2))

                elif label == "helmet":
                    helmets.append((x1, y1, x2, y2))

            # 🔥 Match helmet with person
            for (px1, py1, px2, py2) in people:
                stats["people"] += 1

                has_helmet = False

                for (hx1, hy1, hx2, hy2) in helmets:
                    if px1 < hx1 < px2 and py1 < hy1 < py2:
                        has_helmet = True
                        break

                if has_helmet:
                    stats["helmet"] += 1
                else:
                    stats["noHelmet"] += 1

                    # 🔴 DRAW RED BOX ONLY (NO TEXT)
                    cv2.rectangle(
                        frame,
                        (px1, py1),
                        (px2, py2),
                        (0, 0, 255),
                        3
                    )

        # Encode frame
        _, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()

        # Stream frame
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' +
               frame_bytes + b'\r\n')


# 📡 Stream endpoint
@app.get("/video_feed")
def video_feed():
    return StreamingResponse(
        generate(),
        media_type='multipart/x-mixed-replace; boundary=frame'
    )