"""Future Trace AI Flask application."""

from functools import wraps

from flask import Flask, flash, jsonify, redirect, render_template, request, session, url_for

from utils.analyzer import analyze_text, generate_safe_version, simulate_attack

app = Flask(__name__)
app.secret_key = "future_trace_ai_secret_key_2026"

VALID_USERNAME = "admin"
VALID_PASSWORD = "1234"


def login_required(view):
    """Protect routes that require an authenticated session."""

    @wraps(view)
    def wrapped_view(*args, **kwargs):
        if not session.get("logged_in"):
            if request.path == "/analyze" or request.is_json:
                return jsonify({"error": "Unauthorized"}), 401
            return redirect(url_for("login"))
        return view(*args, **kwargs)

    return wrapped_view


@app.route("/login", methods=["GET", "POST"])
def login():
    """Render the login page and authenticate the hardcoded user."""
    if session.get("logged_in"):
        return redirect(url_for("index"))

    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "").strip()

        if username == VALID_USERNAME and password == VALID_PASSWORD:
            session["logged_in"] = True
            session["username"] = username
            return redirect(url_for("index"))

        flash("Invalid credentials. Use admin / 1234.", "error")

    return render_template("login.html")


@app.route("/logout")
def logout():
    """Clear the current session and return to the login page."""
    session.clear()
    return redirect(url_for("login"))


@app.route("/")
@login_required
def index():
    """Render the protected dashboard."""
    return render_template("index.html", username=session.get("username", VALID_USERNAME))


@app.route("/analyze", methods=["POST"])
@login_required
def analyze():
    """Analyze text, generate a safe version, and build an attack simulation."""
    payload = request.get_json(silent=True) or {}
    text = str(payload.get("text", "")).strip()
    mode = str(payload.get("mode", "")).strip().lower() if payload.get("mode") else ""

    if not text:
        return jsonify({"error": "Please provide text to analyze."}), 400

    analysis = analyze_text(text)
    # NEW FEATURE: adjust risk lightly for selected input modes (SMS/Email sensitivity)
    if mode in ("sms", "email"):
        analysis["risk_score"] = min(100, analysis["risk_score"] + 5)

    safe_version = generate_safe_version(text)
    attack = simulate_attack(analysis["extracted_data"], analysis["risk_score"])

    return jsonify(
        {
            "analysis": analysis,
            "safe_version": safe_version,
            "attack": attack,
        }
    )


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
