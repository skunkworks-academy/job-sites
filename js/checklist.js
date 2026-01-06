const boxes = document.querySelectorAll("input[type='checkbox']");

boxes.forEach(box => {
  const saved = localStorage.getItem(box.id);
  box.checked = saved === "true";

  box.addEventListener("change", () => {
    localStorage.setItem(box.id, box.checked);
  });
});

function resetChecklist() {
  if (!confirm("Reset all completed tasks?")) return;
  boxes.forEach(box => {
    box.checked = false;
    localStorage.removeItem(box.id);
  });
}