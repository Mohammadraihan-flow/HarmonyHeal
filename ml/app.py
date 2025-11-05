from flask import Flask, request, jsonify
from math import sqrt

app = Flask(__name__)

DATA = [
    {'mood': 'stress',  'track_name': 'Calm Mind Music', 'frequency': 528, 'features': [1, 0, 0, 0]},
    {'mood': 'focus',   'track_name': 'Deep Focus Beats', 'frequency': 639, 'features': [0, 1, 0, 0]},
    {'mood': 'anxiety', 'track_name': 'Anxiety Relief Tune', 'frequency': 432, 'features': [0, 0, 1, 0]},
    {'mood': 'relax',   'track_name': 'Sleep Healing Waves', 'frequency': 852, 'features': [0, 0, 0, 1]},
    {'mood': 'happy',   'track_name': 'Positive Energy Mix', 'frequency': 963, 'features': [1, 1, 0, 0]},
    {'mood': 'tired',   'track_name': 'Energy Recharge Vibes', 'frequency': 285, 'features': [1, 0, 1, 0]},
    {'mood': 'angry',   'track_name': 'Peaceful Mind Tune', 'frequency': 741, 'features': [1, 1, 1, 0]},
]

def simple_similarity(f1, f2):
    dot = sum(a * b for a, b in zip(f1, f2))
    norm1 = sqrt(sum(a * a for a in f1))
    norm2 = sqrt(sum(b * b for b in f2))
    return dot / (norm1 * norm2) if norm1 and norm2 else 0

@app.route('/recommend', methods=['POST'])
def recommend():
    req = request.get_json()
    mood = req.get('mood', '').lower()

    mood_map = {
        'stress': [1, 0, 0, 0],
        'focus': [0, 1, 0, 0],
        'anxiety': [0, 0, 1, 0],
        'relax': [0, 0, 0, 1],
        'happy': [1, 1, 0, 0],
        'tired': [1, 0, 1, 0],
        'angry': [1, 1, 1, 0],
    }
    user_feat = mood_map.get(mood, [0, 0, 0, 1])

    best = max(DATA, key=lambda item: simple_similarity(user_feat, item['features']))
    print(f"[INFO] Mood: {mood} → Track: {best['track_name']} ({best['frequency']} Hz)")

    return jsonify({
        'mood': best['mood'],
        'frequency': best['frequency'],
        'track_name': best['track_name']
    })

import os

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
