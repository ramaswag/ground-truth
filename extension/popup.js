const status = document.getElementById("status");
const input = document.getElementById("origin");

async function refresh() {
  status.textContent = "Looking for the Ground Truth app…";
  status.dataset.state = "off";
  const res = await chrome.runtime.sendMessage({ type: "status" });
  if (res?.origin) {
    status.textContent = `Connected to ${res.origin}`;
    status.dataset.state = "on";
    input.value = res.origin;
  } else {
    status.textContent = "App not found. The tab shows demo data until it is running.";
  }
}

document.getElementById("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const value = input.value.trim().replace(/\/$/, "");
  if (value) await chrome.storage.local.set({ origin: value });
  else await chrome.storage.local.remove("origin");
  refresh();
});

refresh();
