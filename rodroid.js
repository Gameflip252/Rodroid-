let emulator = null;
let isoFile = null;
const statusEl = document.getElementById("status");
const runBtn = document.getElementById("runBtn");
const stopBtn = document.getElementById("stopBtn");
const isoInput = document.getElementById("isoInput");
const screenCanvas = document.getElementById("screen");

function setStatus(msg, isError = false) {
  statusEl.textContent = msg;
  statusEl.style.color = isError ? "#f87171" : "#a5b4fc";
}

// Handle ISO/IMG file selection
isoInput.addEventListener("change", (e) => {
  if (e.target.files.length > 0) {
    isoFile = e.target.files[0];
    setStatus(`Loaded file: ${isoFile.name}`);
  } else {
    isoFile = null;
    setStatus("No file loaded.");
  }
});

// Run emulator when Run button is clicked
runBtn.addEventListener("click", async () => {
  if (!isoFile) {
    setStatus("Please select an ISO/IMG file.", true);
    return;
  }
  setStatus("Loading and initializing emulator...");
  runBtn.disabled = true;
  stopBtn.disabled = false;

  // If emulator already running, stop first
  if (emulator) {
    emulator.stop();
    emulator = null;
  }

  // Read ISO/IMG as ArrayBuffer
  const fileBuffer = await isoFile.arrayBuffer();

  // Create emulator
  emulator = new V86Starter({
    wasm_path: "https://unpkg.com/v86/build/v86.wasm",
    memory_size: 256 * 1024 * 1024, // 256MB
    vga_memory_size: 16 * 1024 * 1024,
    screen_container: screenCanvas.parentElement,
    bios: { url: "https://copy.sh/v86/bios/seabios.bin" },
    vga_bios: { url: "https://copy.sh/v86/bios/vgabios.bin" },
    hda: { buffer: fileBuffer },
    autostart: true,
    disable_mouse: false,
    disable_keyboard: false,
    network_relay_url: undefined,
  });

  emulator.add_listener("emulator-ready", () => {
    setStatus("Emulator running! If you see a boot screen, your ISO/IMG is valid.");
  });
  emulator.add_listener("download-progress", (progress) => {
    setStatus(`Downloading BIOS: ${(progress * 100).toFixed(1)}%`);
  });
  emulator.add_listener("emulator-error", (e) => {
    setStatus("Emulator error: " + e, true);
    runBtn.disabled = false;
    stopBtn.disabled = true;
  });
});

// Stop emulator when Stop button is clicked
stopBtn.addEventListener("click", () => {
  if (emulator) {
    emulator.stop();
    emulator = null;
    setStatus("Emulator stopped.");
    runBtn.disabled = false;
    stopBtn.disabled = true;
  }
});

// Initial UI state
stopBtn.disabled = true;