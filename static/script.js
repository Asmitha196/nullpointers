const state = {
    riskChart: null,
    loadingInterval: null,
    timeouts: {
        terminal: [],
        safe: [],
        timeline: [],
        ui: [],
        copy: [],
    },
};

const refs = {};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
} else {
    initialize();
}

function initialize() {
    createParticles(34);
    bindDashboard();
}

function bindDashboard() {
    refs.userInput = document.getElementById("userInput");
    refs.inputMode = document.getElementById("inputMode");
    refs.fileInput = document.getElementById("fileInput");
    refs.imageInput = document.getElementById("imageInput");
    refs.pasteBtn = document.getElementById("pasteBtn");
    refs.analyzeBtn = document.getElementById("analyzeBtn");
    refs.results = document.getElementById("results");
    refs.riskScore = document.getElementById("riskScore");
    refs.riskLabel = document.getElementById("riskLabel");
    refs.riskMeta = document.getElementById("riskMeta");
    refs.highRiskIndicator = document.getElementById("highRiskIndicator");
    refs.alertsList = document.getElementById("alertsList");
    refs.attackTimeline = document.getElementById("attackTimeline");
    refs.attackSteps = document.getElementById("attackSteps");
    refs.attackerPanel = document.getElementById("attackerPanel");
    refs.safeVersion = document.getElementById("safeVersion");
    refs.copyBtn = document.getElementById("copyBtn");
    refs.loadingTrack = document.getElementById("loadingTrack");
    refs.loadingBar = document.getElementById("loadingBar");
    refs.inputFeedback = document.getElementById("inputFeedback");
    refs.riskChartCanvas = document.getElementById("riskChart");

    if (!refs.analyzeBtn) {
        return;
    }

    refs.analyzeBtn.addEventListener("click", handleAnalyze);

    if (refs.fileInput) {
        refs.fileInput.addEventListener("change", handleFileUpload);
    }

    if (refs.imageInput) {
        refs.imageInput.addEventListener("change", handleImageUpload);
    }

    if (refs.pasteBtn) {
        refs.pasteBtn.addEventListener("click", handlePasteClipboard);
    }

    if (refs.userInput) {
        refs.userInput.addEventListener("input", () => {
            refs.userInput.classList.remove("field-error");
            setInputFeedback(
                "Paste a bio, email, or message to model what an attacker can infer from it.",
                false
            );
        });
    }

    if (refs.copyBtn) {
        refs.copyBtn.addEventListener("click", copySafeVersion);
    }
}

function createParticles(count) {
    const container = document.getElementById("particles");
    if (!container) {
        return;
    }

    container.innerHTML = "";
    const colors = ["var(--cyan)", "var(--red)", "var(--green)"];

    for (let index = 0; index < count; index += 1) {
        const particle = document.createElement("span");
        particle.className = "particle";
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${70 + Math.random() * 30}%`;
        particle.style.animationDuration = `${10 + Math.random() * 10}s`;
        particle.style.animationDelay = `${Math.random() * 12}s`;
        particle.style.color = colors[index % colors.length];
        container.appendChild(particle);
    }
}

async function handleAnalyze(textOverride) {
    const text = String(textOverride !== undefined ? textOverride : refs.userInput?.value || "").trim();
    const mode = (refs.inputMode?.value || "General Text").toLowerCase();

    if (!text) {
        refs.userInput?.classList.add("field-error");
        setInputFeedback("Paste a message, bio, or email before scanning.", true);
        refs.userInput?.focus();
        return;
    }

    setInputFeedback("Threat simulation in progress...", false);
    setLoadingState(true);

    try {
        const response = await fetch("/analyze", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ text, mode }),
        });

        if (response.status === 401) {
            window.location.href = "/login";
            return;
        }

        const payload = await response.json();

        if (!response.ok) {
            throw new Error(payload.error || "Analysis failed.");
        }

        finishLoading(() => displayResults(payload));
    } catch (error) {
        setLoadingState(false);
        setInputFeedback(error.message || "Analysis failed.", true);
    }
}

// NEW FEATURE: text file upload handler
async function handleFileUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();

    reader.onload = async () => {
        const fileText = String(reader.result || "").trim();
        if (!fileText) {
            setInputFeedback("Uploaded text file is empty.", true);
            return;
        }

        refs.userInput.value = fileText;
        setInputFeedback(`Text file loaded: ${file.name}. Analyzing...`, false);
        await handleAnalyze(fileText);
    };

    reader.onerror = () => {
        setInputFeedback("Unable to read the file. Please upload a valid text file.", true);
    };

    reader.readAsText(file);
}

// NEW FEATURE: mock image upload handler
async function handleImageUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) {
        return;
    }

    refs.userInput.value = file.name ? `Image: ${file.name}` : "Image uploaded";
    setInputFeedback("Image uploaded - analyzing...", false);
    await handleAnalyze(`Extracted from image:\nName: Image User\nDate of Birth: 15/03/1995\nPhone: 9876543210\nLocation: Mumbai`);
}

// NEW FEATURE: clipboard paste handler
async function handlePasteClipboard() {
    try {
        const clipboardText = String(await navigator.clipboard.readText() || "").trim();
        if (!clipboardText) {
            setInputFeedback("Clipboard is empty or contains no text.", true);
            return;
        }

        refs.userInput.value = clipboardText;
        setInputFeedback("Clipboard text pasted. Analyzing...", false);
        await handleAnalyze(clipboardText);
    } catch (error) {
        setInputFeedback("Unable to read clipboard. Please allow clipboard access.", true);
    }
}

function setLoadingState(isLoading) {
    if (!refs.analyzeBtn || !refs.loadingTrack || !refs.loadingBar) {
        return;
    }

    window.clearInterval(state.loadingInterval);
    clearTimeoutBucket("ui");

    refs.analyzeBtn.disabled = isLoading;
    refs.analyzeBtn.classList.toggle("is-loading", isLoading);

    if (isLoading) {
        let progress = 6;
        refs.loadingTrack.classList.add("is-visible");
        refs.loadingBar.style.width = `${progress}%`;
        state.loadingInterval = window.setInterval(() => {
            progress = Math.min(progress + Math.random() * 14, 88);
            refs.loadingBar.style.width = `${progress}%`;
        }, 120);
    } else {
        refs.analyzeBtn.classList.remove("is-loading");
        schedule("ui", () => {
            refs.loadingTrack.classList.remove("is-visible");
            refs.loadingBar.style.width = "0%";
        }, 220);
    }
}

function finishLoading(callback) {
    if (refs.loadingBar) {
        refs.loadingBar.style.width = "100%";
    }

    schedule("ui", () => {
        callback();
        setLoadingState(false);
    }, 220);
}

function setInputFeedback(message, isError) {
    if (!refs.inputFeedback) {
        return;
    }
    refs.inputFeedback.textContent = message;
    refs.inputFeedback.classList.toggle("is-error", Boolean(isError));
}

function displayResults(payload) {
    const analysis = payload.analysis || {};
    const extracted = normalizeExtractedData(analysis.extracted_data);
    const attack = payload.attack || [];
    const score = normalizeRiskScore(analysis.risk_score, extracted);

    refs.results?.classList.remove("is-hidden");

    safelyRender(() => updateRiskScore(score));
    safelyRender(() => updateAlerts(analysis.alerts || []));
    safelyRender(() => updateAttackTimeline(attack));
    safelyRender(() => updateAttackSteps(attack));
    safelyRender(() => updateAttackerPanel(extracted));
    safelyRender(() => updateSafeVersion(payload.safe_version || ""));
    safelyRender(() => updateChart({ ...analysis, extracted_data: extracted }));

    refs.results?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function updateRiskScore(score) {
    if (!refs.riskScore || !refs.riskLabel || !refs.riskMeta || !refs.highRiskIndicator) {
        return;
    }

    const normalizedScore = normalizeRiskScore(score);
    const meta = getRiskMeta(normalizedScore);
    refs.riskScore.className = `risk-value ${meta.className}`;
    refs.riskLabel.textContent = meta.label;
    refs.riskMeta.textContent = meta.copy;
    refs.highRiskIndicator.classList.toggle("hidden", normalizedScore <= 70);

    animateNumber(refs.riskScore, normalizedScore, 1200);
}

function getRiskMeta(score) {
    if (score > 70) {
        return {
            className: "risk-high",
            label: "Critical Exposure",
            copy: "Multiple identifiers can be chained into a convincing attack path.",
        };
    }
    if (score > 35) {
        return {
            className: "risk-medium",
            label: "Elevated Exposure",
            copy: "There is enough personal context here to support targeted abuse.",
        };
    }
    return {
        className: "risk-low",
        label: "Low Exposure",
        copy: "Only limited attacker value is visible in the current text.",
    };
}

function animateNumber(element, target, duration) {
    const startTime = performance.now();

    function step(currentTime) {
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const value = Math.round(target * easeOutCubic(progress));
        element.textContent = String(value);

        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    }

    window.requestAnimationFrame(step);
}

function easeOutCubic(value) {
    return 1 - Math.pow(1 - value, 3);
}

function updateAlerts(alerts) {
    if (!refs.alertsList) {
        return;
    }

    refs.alertsList.innerHTML = "";
    const alertItems = alerts.length ? alerts : ["No critical data indicators detected."];

    alertItems.forEach((text, index) => {
        const item = document.createElement("li");
        item.className = "alert-item";
        item.style.animationDelay = `${index * 0.12}s`;

        const alertIndex = document.createElement("span");
        alertIndex.className = "alert-index";
        alertIndex.textContent = `ALERT ${String(index + 1).padStart(2, "0")}`;

        const alertText = document.createElement("p");
        alertText.className = "alert-text";
        alertText.textContent = text;

        item.appendChild(alertIndex);
        item.appendChild(alertText);
        refs.alertsList.appendChild(item);
    });
}

function updateAttackTimeline(steps) {
    if (!refs.attackTimeline) {
        return;
    }

    clearTimeoutBucket("timeline");
    refs.attackTimeline.innerHTML = "";

    steps.forEach((step) => {
        const card = document.createElement("article");
        card.className = "timeline-step";

        const node = document.createElement("div");
        node.className = "timeline-node";
        const nodeLabel = document.createElement("span");
        nodeLabel.textContent = String(step.step).padStart(2, "0");
        node.appendChild(nodeLabel);

        const copy = document.createElement("div");
        const title = document.createElement("h3");
        title.className = "timeline-title";
        title.textContent = step.title;

        const description = document.createElement("p");
        description.className = "timeline-desc";
        description.textContent = step.description;

        const detail = document.createElement("p");
        detail.className = "timeline-detail";
        detail.textContent = step.details && step.details.length ? step.details[0] : "No additional trace.";

        copy.appendChild(title);
        copy.appendChild(description);
        copy.appendChild(detail);
        card.appendChild(node);
        card.appendChild(copy);
        refs.attackTimeline.appendChild(card);
    });

    [...refs.attackTimeline.children].forEach((card, index) => {
        schedule("timeline", () => {
            card.classList.add("is-active");
        }, 180 + index * 260);
    });
}

function updateAttackSteps(steps) {
    if (!refs.attackSteps) {
        return;
    }

    refs.attackSteps.innerHTML = "";

    steps.forEach((step) => {
        const card = document.createElement("article");
        card.className = "sim-card";

        const head = document.createElement("div");
        head.className = "sim-head";

        const badge = document.createElement("div");
        badge.className = "sim-step";
        badge.textContent = String(step.step);

        const title = document.createElement("h3");
        title.className = "sim-title";
        title.textContent = step.title;

        head.appendChild(badge);
        head.appendChild(title);

        const description = document.createElement("p");
        description.className = "sim-desc";
        description.textContent = step.description;

        const list = document.createElement("ul");
        list.className = "sim-list";

        (step.details || []).forEach((detailText) => {
            const item = document.createElement("li");
            item.textContent = detailText;
            list.appendChild(item);
        });

        card.appendChild(head);
        card.appendChild(description);
        card.appendChild(list);
        refs.attackSteps.appendChild(card);
    });
}

function updateAttackerPanel(extracted) {
    if (!refs.attackerPanel) {
        return;
    }

    clearTimeoutBucket("terminal");
    refs.attackerPanel.innerHTML = "";

    const lines = [
        "Boot sequence complete. Parsing exposed identity markers...",
        `NAME     : ${formatLineValue(extracted.names)}`,
        `PHONE    : ${formatLineValue(extracted.phones)}`,
        `DOB      : ${formatLineValue(extracted.dates)}`,
        `LOCATION : ${formatLineValue(extracted.locations)}`,
    ];

    renderTerminalLine(lines, 0);
}

function renderTerminalLine(lines, index) {
    if (!refs.attackerPanel || index >= lines.length) {
        return;
    }

    const line = document.createElement("div");
    line.className = "terminal-line";

    const prompt = document.createElement("span");
    prompt.className = "terminal-prompt";
    prompt.textContent = index === 0 ? "TRACE>" : "LEAK >";

    const content = document.createElement("span");
    content.className = "terminal-content";

    line.appendChild(prompt);
    line.appendChild(content);
    refs.attackerPanel.appendChild(line);

    typeText(content, lines[index], "terminal", 16, () => {
        refs.attackerPanel.scrollTop = refs.attackerPanel.scrollHeight;
        schedule("terminal", () => renderTerminalLine(lines, index + 1), 120);
    });
}

function updateSafeVersion(text) {
    if (!refs.safeVersion) {
        return;
    }

    typeText(
        refs.safeVersion,
        text || "No sanitization changes were needed.",
        "safe",
        8
    );
}

function typeText(element, text, bucket, speed, callback) {
    clearTimeoutBucket(bucket);
    element.textContent = "";
    element.classList.add("is-typing");

    if (!text) {
        element.classList.remove("is-typing");
        if (callback) {
            callback();
        }
        return;
    }

    let cursor = 0;

    const tick = () => {
        element.textContent = text.slice(0, cursor + 1);
        cursor += 1;

        if (cursor < text.length) {
            schedule(bucket, tick, speed);
        } else {
            element.classList.remove("is-typing");
            if (callback) {
                callback();
            }
        }
    };

    tick();
}

function updateChart(analysis) {
    if (!refs.riskChartCanvas || typeof Chart === "undefined") {
        return;
    }

    const extracted = normalizeExtractedData(analysis.extracted_data);
    const values = [
        extracted.names.length,
        extracted.phones.length,
        extracted.dates.length,
        extracted.locations.length,
    ];

    if (state.riskChart) {
        state.riskChart.destroy();
    }

    const context = refs.riskChartCanvas.getContext("2d");

    const cyanGradient = context.createLinearGradient(0, 0, 0, 240);
    cyanGradient.addColorStop(0, "rgba(99, 243, 255, 0.95)");
    cyanGradient.addColorStop(1, "rgba(99, 243, 255, 0.2)");

    const redGradient = context.createLinearGradient(0, 0, 0, 240);
    redGradient.addColorStop(0, "rgba(255, 77, 109, 0.95)");
    redGradient.addColorStop(1, "rgba(255, 77, 109, 0.22)");

    const greenGradient = context.createLinearGradient(0, 0, 0, 240);
    greenGradient.addColorStop(0, "rgba(114, 255, 182, 0.95)");
    greenGradient.addColorStop(1, "rgba(114, 255, 182, 0.2)");

    state.riskChart = new Chart(context, {
        type: "bar",
        data: {
            labels: ["Name", "Phone", "DOB", "Location"],
            datasets: [
                {
                    data: values,
                    backgroundColor: [cyanGradient, redGradient, redGradient, greenGradient],
                    borderColor: [
                        "rgba(99, 243, 255, 1)",
                        "rgba(255, 77, 109, 1)",
                        "rgba(255, 77, 109, 1)",
                        "rgba(114, 255, 182, 1)",
                    ],
                    borderWidth: 1.5,
                    borderRadius: 12,
                    borderSkipped: false,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1200,
                easing: "easeOutQuart",
            },
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    backgroundColor: "rgba(7, 12, 20, 0.94)",
                    borderColor: "rgba(99, 243, 255, 0.18)",
                    borderWidth: 1,
                    titleColor: "#edf4ff",
                    bodyColor: "#93a7be",
                    padding: 12,
                },
            },
            scales: {
                x: {
                    grid: {
                        display: false,
                    },
                    ticks: {
                        color: "#93a7be",
                        font: {
                            family: "Rajdhani",
                            size: 13,
                            weight: 600,
                        },
                    },
                },
                y: {
                    beginAtZero: true,
                    suggestedMax: Math.max(2, Math.max(...values) + 1),
                    ticks: {
                        color: "#93a7be",
                        stepSize: 1,
                        font: {
                            family: "Rajdhani",
                            size: 12,
                        },
                    },
                    grid: {
                        color: "rgba(147, 167, 190, 0.08)",
                    },
                },
            },
        },
    });
}

async function copySafeVersion() {
    if (!refs.copyBtn || !refs.safeVersion) {
        return;
    }

    const text = refs.safeVersion.textContent.trim();
    if (!text) {
        return;
    }

    const label = refs.copyBtn.querySelector(".button-label") || refs.copyBtn;
    const originalText = label.textContent;

    try {
        await navigator.clipboard.writeText(text);
        label.textContent = "Copied";
    } catch (error) {
        label.textContent = "Copy Failed";
    }

    schedule("copy", () => {
        label.textContent = originalText;
    }, 1400);
}

function formatLineValue(list) {
    return list && list.length ? list.join(", ") : "NOT FOUND";
}

function schedule(bucket, callback, delay) {
    const id = window.setTimeout(callback, delay);
    state.timeouts[bucket].push(id);
    return id;
}

function clearTimeoutBucket(bucket) {
    state.timeouts[bucket].forEach((id) => window.clearTimeout(id));
    state.timeouts[bucket] = [];
}

function normalizeExtractedData(extracted) {
    const source = extracted || {};
    return {
        names: Array.isArray(source.names) ? source.names : [],
        phones: Array.isArray(source.phones) ? source.phones : [],
        dates: Array.isArray(source.dates) ? source.dates : [],
        locations: Array.isArray(source.locations) ? source.locations : [],
    };
}

function normalizeRiskScore(score, extracted) {
    const numericScore = Number(score);
    if (Number.isFinite(numericScore)) {
        return Math.max(0, Math.min(100, Math.round(numericScore)));
    }

    if (!extracted) {
        return 0;
    }

    let fallbackScore = 0;
    fallbackScore += Math.min(extracted.names.length * 18, 28);
    fallbackScore += Math.min(extracted.phones.length * 35, 40);
    fallbackScore += Math.min(extracted.dates.length * 28, 32);
    fallbackScore += Math.min(extracted.locations.length * 12, 18);

    const detectedCategories = [
        extracted.names,
        extracted.phones,
        extracted.dates,
        extracted.locations,
    ].filter((items) => items.length > 0).length;

    if (detectedCategories >= 2) {
        fallbackScore += 8;
    }
    if (extracted.phones.length && extracted.dates.length) {
        fallbackScore += 10;
    }
    if (extracted.names.length && extracted.locations.length) {
        fallbackScore += 6;
    }

    return Math.min(fallbackScore, 100);
}

function safelyRender(renderFn) {
    try {
        renderFn();
    } catch (error) {
        console.error("Dashboard render error:", error);
    }
}
