# PPE-Detection-System-using-YOLO-Python-NestJS
Developed a real-time Personal Protective Equipment (PPE) detection system that monitors CCTV video feeds to ensure workplace safety compliance. The system leverages the YOLO (You Only Look Once) deep learning model implemented in Python to detect safety gear such as helmets, masks, and safety vests.

The Python-based detection service processes live or recorded CCTV footage, identifies objects, and classifies whether individuals are wearing the required PPE. Detected results, including bounding boxes and confidence scores, are sent to a backend server built with NestJS, which handles API communication, data storage, and alert management.

The NestJS backend validates incoming detection data, logs violations, and can trigger real-time alerts or notifications for non-compliance. This architecture ensures scalable and efficient communication between the AI model and the application layer.
